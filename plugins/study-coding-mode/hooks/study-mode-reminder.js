#!/usr/bin/env node
// UserPromptSubmit hook for study-coding-mode in Claude Code and Codex.
// While the marker .claude/study-coding-mode exists in the project, re-inject a short
// reminder every turn so the mode survives context compaction. Silent (exit 0) when off.
// The marker's CONTENTS select the teaching level (junior | mid | senior; default junior).
// Reads the hook payload from stdin; uses its `cwd` to locate the project-local marker.

const { readState } = require('../skills/study-coding-mode/scripts/mode.js');

// Teaching levels — how much prior knowledge to assume / how much to unpack jargon.
const LEVEL_GUIDANCE = {
  junior: 'TEACHING LEVEL = JUNIOR (the default, most unpacked). Assume minimal background: before using ANY technical term or acronym, give a one-line plain-language definition plus a concrete analogy or real example, and spell acronyms out. Never stack multiple new terms at once. Prefer smaller steps.',
  mid: 'TEACHING LEVEL = MID. Assume solid programming fundamentals but treat THIS domain as new: define domain-specific or newer terms briefly inline, but do not re-explain the basics. Normal step size.',
  senior: 'TEACHING LEVEL = SENIOR. Assume strong general and domain familiarity: use precise terminology freely and flag only genuinely obscure terms. Center trade-offs, edge cases, and alternatives. Larger steps, faster pace.'
};

let input = '';
process.stdin.on('data', (chunk) => { input += chunk; });
process.stdin.on('end', () => {
  try {
    const payload = JSON.parse(input || '{}');
    const cwd = typeof payload.cwd === 'string' && payload.cwd ? payload.cwd : process.cwd();
    const { enabled, level } = readState(cwd);
    if (!enabled) return; // mode off → stay silent

    process.stdout.write(JSON.stringify({
      hookSpecificOutput: {
        hookEventName: 'UserPromptSubmit',
        additionalContext: [
          '[STUDY CODING MODE — ON] Stay in tutor mode (follow the study-coding-mode skill).',
          'Do NOT write the meaningful code: explain the *why*, then hand the user ONE small step to type themselves; only fill pure boilerplate/config on request.',
          'Each step, verify the code THEY typed (read it, give a concrete check) before moving on.',
          'At key decisions or first-time concepts, proactively offer 2-4 named deep-dive topics.',
          'Answer any question richly — terminal tables/code by default, a styled HTML file for big or visual topics.',
          LEVEL_GUIDANCE[level],
          'The user can change level anytime ("주니어/미들/시니어로", "더 쉽게 풀어줘", "압축해서") — when they do, rewrite .claude/study-coding-mode with the new level word (junior|mid|senior).',
          'If the user is impatient, offer to condense or to exit the mode — do not silently take over the code.',
          'Loading this reminder or the skill is not a toggle request; preserve the current level.',
          'Honor explicit off, toggle, status, and level requests before tutoring. Exit when the user asks to leave study mode: remove .claude/study-coding-mode.'
        ].join(' ')
      }
    }));
  } catch {
    // Invalid or empty input — stay silent and fall through.
  }
});
