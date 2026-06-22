#!/usr/bin/env node
// UserPromptSubmit hook for study-coding-mode.
// While the marker .claude/study-coding-mode exists in the project, re-inject a short
// reminder every turn so the mode survives context compaction. Silent (exit 0) when off.
// Reads the hook payload from stdin; uses its `cwd` to locate the project-local marker.

const fs = require('fs');
const path = require('path');

let input = '';
process.stdin.on('data', (chunk) => { input += chunk; });
process.stdin.on('end', () => {
  try {
    const payload = JSON.parse(input || '{}');
    const cwd = typeof payload.cwd === 'string' && payload.cwd ? payload.cwd : process.cwd();
    const marker = path.join(cwd, '.claude', 'study-coding-mode');
    if (fs.existsSync(marker)) {
      process.stdout.write(JSON.stringify({
        hookSpecificOutput: {
          hookEventName: 'UserPromptSubmit',
          additionalContext: [
            '[STUDY CODING MODE — ON] Stay in tutor mode (follow the study-coding-mode skill).',
            'Do NOT write the meaningful code: explain the *why*, then hand the user ONE small step to type themselves; only fill pure boilerplate/config on request.',
            'Each step, verify the code THEY typed (read it, give a concrete check) before moving on.',
            'At key decisions or first-time concepts, proactively offer 2-4 named deep-dive topics.',
            'Answer any question richly — terminal tables/code by default, a styled HTML file for big or visual topics.',
            'If the user is impatient, offer to condense or to exit the mode — do not silently take over the code.',
            'Exit when the user runs `/study-coding-mode off` or says exit: remove .claude/study-coding-mode.'
          ].join(' ')
        }
      }));
    }
  } catch {
    // Invalid or empty input — stay silent and fall through.
  }
});
