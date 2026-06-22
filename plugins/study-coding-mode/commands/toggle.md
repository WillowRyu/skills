---
description: Toggle study coding mode (no arg = flip on/off) — on | off | status | junior | mid | senior
argument-hint: (empty = flip) | on | off | status | junior | mid | senior
disable-model-invocation: true
allowed-tools: Bash(mkdir:*), Bash(rm:*), Bash(test:*), Bash(printf:*), Bash(cat:*), Bash(echo:*)
---

Toggle **study coding mode**. The marker file `.claude/study-coding-mode` drives a `UserPromptSubmit` hook that keeps the mode active every turn until it is turned off; the marker's **contents are the teaching level** — `junior` (default) | `mid` | `senior`. Act on `$ARGUMENTS`:

- **empty → flip.** Run `test -f .claude/study-coding-mode`.
  - Marker absent → turn **on** at the default level: `mkdir -p .claude && printf junior > .claude/study-coding-mode`. Then invoke the **study-coding-mode** skill and begin: confirm what we are building, propose a learning-ordered roadmap, and start step 1 — explain the *why*, then hand over the first small piece for the user to type themselves.
  - Marker present → turn **off**: `rm -f .claude/study-coding-mode`, confirm study coding mode is off, and resume normal assistance.
- **`on`** → turn on, keeping the current level if already on: `mkdir -p .claude && { test -f .claude/study-coding-mode || printf junior > .claude/study-coding-mode; }`. Then invoke the skill and begin (as above).
- **`off`** → `rm -f .claude/study-coding-mode`; confirm it is off.
- **`junior` | `mid` | `senior`** → turn on **at that level** (or just change the level if already on): `mkdir -p .claude && printf <level> > .claude/study-coding-mode` (with `<level>` = the requested word). Invoke the skill if newly on, and note the active level.
- **`status`** → run `test -f .claude/study-coding-mode && echo "study coding mode: ON (level: $(cat .claude/study-coding-mode))" || echo "study coding mode: OFF"` and report the result.
