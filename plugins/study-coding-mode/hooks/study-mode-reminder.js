#!/usr/bin/env node
// UserPromptSubmit hook for study-coding-mode.
// While the marker .claude/study-coding-mode exists in the project, re-inject a short
// reminder every turn so the mode survives context compaction. Silent (exit 0) when off.
// The marker's CONTENTS select the teaching level (junior | mid | senior; default junior).
// Reads the hook payload from stdin; uses its `cwd` to locate the project-local marker.

const fs = require('fs');
const path = require('path');

// Teaching levels — how much prior knowledge to assume / how much to unpack jargon.
const LEVEL_GUIDANCE = {
  junior: 'TEACHING LEVEL = JUNIOR (the default, most unpacked). Assume minimal background: before using ANY technical term or acronym, give a one-line plain-language definition plus a concrete analogy or real example, and spell acronyms out. Never stack multiple new terms at once. Prefer smaller steps.',
  mid: 'TEACHING LEVEL = MID. Assume solid programming fundamentals but treat THIS domain as new: define domain-specific or newer terms briefly inline, but do not re-explain the basics. Normal step size.',
  senior: 'TEACHING LEVEL = SENIOR. Assume strong general and domain familiarity: use precise terminology freely and flag only genuinely obscure terms. Center trade-offs, edge cases, and alternatives. Larger steps, faster pace.'
};

// Map whatever word is in the marker (incl. natural-language synonyms) to a canonical level.
const LEVEL_ALIASES = {
  junior: 'junior', beginner: 'junior', easy: 'junior', novice: 'junior',
  mid: 'mid', middle: 'mid', intermediate: 'mid', normal: 'mid',
  senior: 'senior', advanced: 'senior', expert: 'senior', hard: 'senior'
};

let input = '';
process.stdin.on('data', (chunk) => { input += chunk; });
process.stdin.on('end', () => {
  try {
    const payload = JSON.parse(input || '{}');
    const cwd = typeof payload.cwd === 'string' && payload.cwd ? payload.cwd : process.cwd();
    const marker = path.join(cwd, '.claude', 'study-coding-mode');
    if (!fs.existsSync(marker)) return; // mode off → stay silent

    let level = 'junior';
    try {
      const raw = fs.readFileSync(marker, 'utf8').trim().toLowerCase();
      if (LEVEL_ALIASES[raw]) level = LEVEL_ALIASES[raw];
    } catch { /* unreadable marker → default level */ }

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
          'Exit when the user runs `/study-coding-mode:toggle` again (or says exit): remove .claude/study-coding-mode.'
        ].join(' ')
      }
    }));
  } catch {
    // Invalid or empty input — stay silent and fall through.
  }
});
