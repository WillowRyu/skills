const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { test } = require('node:test');

const plugin = path.resolve(__dirname, '../plugins/study-coding-mode');
const controller = path.join(plugin, 'skills/study-coding-mode/scripts/mode.js');
const hook = path.join(plugin, 'hooks/study-mode-reminder.js');

function project(t) {
  const cwd = fs.mkdtempSync(path.join(os.tmpdir(), 'study mode '));
  t.after(() => fs.rmSync(cwd, { recursive: true, force: true }));
  return cwd;
}

function runMode(cwd, ...args) {
  const result = spawnSync(process.execPath, [controller, ...args], { cwd, encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr);
  return JSON.parse(result.stdout);
}

function reminder(cwd, payload) {
  const result = spawnSync(process.execPath, [hook], {
    cwd,
    input: typeof payload === 'string' ? payload : JSON.stringify(payload),
    encoding: 'utf8'
  });
  assert.equal(result.status, 0, result.stderr);
  return result.stdout;
}

test('status leaves an inactive project untouched', (t) => {
  const cwd = project(t);
  assert.deepEqual(runMode(cwd, 'status'), { enabled: false, level: null });
  assert.deepEqual(fs.readdirSync(cwd), []);
});

test('bare invocation toggles on at junior and then removes the marker', (t) => {
  const cwd = project(t);
  assert.deepEqual(runMode(cwd), { enabled: true, level: 'junior' });
  assert.equal(fs.readFileSync(path.join(cwd, '.claude/study-coding-mode'), 'utf8').trim(), 'junior');
  assert.deepEqual(runMode(cwd), { enabled: false, level: null });
  assert.equal(fs.existsSync(path.join(cwd, '.claude/study-coding-mode')), false);
});

test('on preserves the teaching level, including a legacy alias', (t) => {
  const cwd = project(t);
  fs.mkdirSync(path.join(cwd, '.claude'));
  fs.writeFileSync(path.join(cwd, '.claude/study-coding-mode'), 'expert\n');
  assert.deepEqual(runMode(cwd, 'on'), { enabled: true, level: 'senior' });
  assert.equal(fs.readFileSync(path.join(cwd, '.claude/study-coding-mode'), 'utf8'), 'expert\n');
  assert.deepEqual(runMode(cwd, 'toggle'), { enabled: false, level: null });
});

test('level changes feed the same reminder protocol for Claude Code and Codex', (t) => {
  const cwd = project(t);
  for (const level of ['junior', 'mid', 'senior']) {
    assert.deepEqual(runMode(cwd, level), { enabled: true, level });
    for (const payload of [
      { cwd, hook_event_name: 'UserPromptSubmit', session_id: 'claude-test', prompt: 'Continue' },
      { cwd, hook_event_name: 'UserPromptSubmit', session_id: 'codex-test', turn_id: 'turn-1', model: 'test', prompt: 'Continue' }
    ]) {
      const output = JSON.parse(reminder(cwd, payload)).hookSpecificOutput;
      assert.equal(output.hookEventName, 'UserPromptSubmit');
      assert.match(output.additionalContext, new RegExp(`TEACHING LEVEL = ${level.toUpperCase()}`));
      assert.match(output.additionalContext, /Do NOT write the meaningful code/);
    }
  }
});

test('off is idempotent and preserves unrelated Claude settings', (t) => {
  const cwd = project(t);
  runMode(cwd, 'on');
  const settings = path.join(cwd, '.claude/settings.json');
  fs.writeFileSync(settings, '{"example":true}\n');
  assert.deepEqual(runMode(cwd, 'off'), { enabled: false, level: null });
  assert.deepEqual(runMode(cwd, 'off'), { enabled: false, level: null });
  assert.equal(fs.readFileSync(settings, 'utf8'), '{"example":true}\n');
  assert.equal(reminder(cwd, { cwd }), '');
});

test('invalid actions and extra arguments fail without changing active state', (t) => {
  const cwd = project(t);
  runMode(cwd, 'senior');
  for (const args of [['invalid'], ['off', 'unexpected']]) {
    const result = spawnSync(process.execPath, [controller, ...args], { cwd, encoding: 'utf8' });
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /Usage:/);
    assert.equal(result.stdout, '');
    assert.deepEqual(runMode(cwd, 'status'), { enabled: true, level: 'senior' });
  }
});

test('hook uses payload cwd and handles legacy default levels and invalid input', (t) => {
  const cwd = project(t);
  const other = project(t);
  fs.mkdirSync(path.join(cwd, '.claude'));
  fs.writeFileSync(path.join(cwd, '.claude/study-coding-mode'), '');
  const output = JSON.parse(reminder(other, { cwd })).hookSpecificOutput;
  assert.match(output.additionalContext, /TEACHING LEVEL = JUNIOR/);
  assert.equal(reminder(cwd, { cwd: other }), '');
  assert.equal(reminder(cwd, 'invalid json'), '');
});

test('the packaged hook command works after relocation to a path with spaces', (t) => {
  const cwd = project(t);
  const installed = path.join(project(t), 'installed plugin');
  fs.cpSync(plugin, installed, { recursive: true });
  const markerDir = path.join(cwd, '.claude');
  fs.mkdirSync(markerDir);
  fs.writeFileSync(path.join(markerDir, 'study-coding-mode'), 'senior');
  const config = JSON.parse(fs.readFileSync(path.join(installed, 'hooks/hooks.json'), 'utf8'));
  const command = config.hooks.UserPromptSubmit[0].hooks[0].command;
  const result = spawnSync(command, {
    cwd,
    shell: true,
    env: { ...process.env, CLAUDE_PLUGIN_ROOT: installed, PLUGIN_ROOT: installed },
    input: JSON.stringify({ cwd, hook_event_name: 'UserPromptSubmit', session_id: 'relocated' }),
    encoding: 'utf8'
  });
  assert.equal(result.status, 0, result.stderr);
  const output = JSON.parse(result.stdout).hookSpecificOutput;
  assert.equal(output.hookEventName, 'UserPromptSubmit');
  assert.match(output.additionalContext, /TEACHING LEVEL = SENIOR/);
});
