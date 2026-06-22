---
description: Toggle study coding mode — on | off | status
argument-hint: on | off | status
disable-model-invocation: true
allowed-tools: Bash(mkdir:*), Bash(touch:*), Bash(rm:*), Bash(test:*)
---

Toggle **study coding mode**. The marker file `.claude/study-coding-mode` drives a `UserPromptSubmit` hook that keeps the mode active every turn until it is turned off. Act on `$ARGUMENTS`:

- **`on`** (or empty): turn it on.
  1. Run: `mkdir -p .claude && touch .claude/study-coding-mode`
  2. Invoke the **study-coding-mode** skill, then begin: confirm what we are building, propose a learning-ordered roadmap, and start step 1 — explain the *why*, then hand over the first small piece for the user to type themselves.

- **`off`**: turn it off.
  1. Run: `rm -f .claude/study-coding-mode`
  2. Confirm study coding mode is off and resume normal assistance.

- **`status`**: run `test -f .claude/study-coding-mode && echo "study coding mode: ON" || echo "study coding mode: OFF"` and report the result.
