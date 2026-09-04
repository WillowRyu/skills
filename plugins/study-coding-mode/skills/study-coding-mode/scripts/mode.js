#!/usr/bin/env node
// Shared project state for Claude Code and Codex. Keep the legacy marker so
// existing Claude sessions and both hosts' hooks see the same teaching level.
const fs = require('node:fs');
const path = require('node:path');

const LEVEL_ALIASES = {
  junior: 'junior', beginner: 'junior', easy: 'junior', novice: 'junior',
  mid: 'mid', middle: 'mid', intermediate: 'mid', normal: 'mid',
  senior: 'senior', advanced: 'senior', expert: 'senior', hard: 'senior'
};

function markerPath(cwd) {
  return path.join(cwd, '.claude', 'study-coding-mode');
}

function readState(cwd) {
  const marker = markerPath(cwd);
  if (!fs.existsSync(marker)) return { enabled: false, level: null };
  let level = 'junior';
  try {
    const raw = fs.readFileSync(marker, 'utf8').trim().toLowerCase();
    if (Object.hasOwn(LEVEL_ALIASES, raw)) level = LEVEL_ALIASES[raw];
  } catch { /* Legacy unreadable markers use the default teaching level. */ }
  return { enabled: true, level };
}

if (require.main === module) {
  try {
    const args = process.argv.slice(2);
    const action = args[0] || 'toggle';
    if (args.length > 1 || !['toggle', 'on', 'off', 'status', 'junior', 'mid', 'senior'].includes(action)) {
      throw new Error('Usage: node mode.js [toggle|on|off|status|junior|mid|senior]');
    }
    const cwd = process.cwd();
    const state = readState(cwd);
    const marker = markerPath(cwd);
    if (action === 'off' || (action === 'toggle' && state.enabled)) {
      fs.rmSync(marker, { force: true });
    } else if (action !== 'status' && !(action === 'on' && state.enabled)) {
      const level = ['junior', 'mid', 'senior'].includes(action) ? action : 'junior';
      fs.mkdirSync(path.dirname(marker), { recursive: true });
      fs.writeFileSync(marker, `${level}\n`);
    }
    process.stdout.write(`${JSON.stringify(readState(cwd))}\n`);
  } catch (error) {
    process.stderr.write(`${error.message}\n`);
    process.exitCode = 1;
  }
}

module.exports = { readState };
