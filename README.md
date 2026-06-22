# Willow Skills

**English** | [한국어](README.ko.md)

A personal [Claude Code](https://claude.com/claude-code) plugin marketplace — WillowRyu's skills and workflows in one place. Add the marketplace once, then install any plugin below.

## Install

```
/plugin marketplace add WillowRyu/skills
/plugin install <plugin>@willow
/reload-plugins
```

- `<plugin>` is one of the plugin names below (e.g. `study-coding-mode`).
- **Update later:** `/plugin marketplace update willow`, then `/plugin install <plugin>@willow` again.

## Plugins

### `agent-handoff`

```
/plugin install agent-handoff@willow
```

A strict **3-stage handoff workflow for coding agents** — `plan` → `execute` → `verify` — with disk-backed state (`.handoff/*.md`) so each stage can run in a **fresh chat / context**. That means verification and code review happen with clean context instead of the same agent grading its own work. Supports multi-phase plans and parallel subagent execution.

- **Skills:** `setup-handoff`, `plan`, `execute`, `verify`
- **Source & full docs:** [github.com/WillowRyu/agent-handoff](https://github.com/WillowRyu/agent-handoff) — it lives in its own repository and is included here by reference.

### `study-coding-mode`

```
/plugin install study-coding-mode@willow
```

A **learn-by-typing tutor mode.** Instead of writing the optimal code *for* you, the AI becomes a tutor: it explains the *why*, hands you one small step at a time to **type yourself**, verifies your code, and proactively teaches the architecture, patterns, and terminology as you go. Use it when you want to actually understand and be able to judge what you're building — not just receive finished code.

**The loop:**

1. Breaks the work into the smallest *learnable* steps and shares a roadmap (and why that order).
2. For each step: explains the **why** first → hands you the exact small piece to **type** → **verifies the code you typed** → at key decisions, offers **2–4 named deep-dive topics** to explore.
3. Ask anything, anytime — terminal tables/code by default, or a **styled HTML explainer** for big or visual topics.

**Code boundary:** you type the meaningful code; the AI fills only pure boilerplate/config on request, and never silently takes over.

**Turn it on / off:**

```
/study-coding-mode:toggle on        # start
/study-coding-mode:toggle off       # stop
/study-coding-mode:toggle status    # check
```

…or just say *"study coding mode"* / *"teach me as we build, I'll type it"* in your own words. It's an explicit, **persistent mode** — a `UserPromptSubmit` hook re-asserts it every turn, so it survives long sessions and context compaction until you turn it off.

## Adding a new skill

Each skill ships as its own installable plugin under `plugins/`.

1. Copy the template:
   ```
   cp -R templates/skill-plugin plugins/<name>
   mv plugins/<name>/skills/skill-name plugins/<name>/skills/<name>
   ```
2. Edit `plugins/<name>/skills/<name>/SKILL.md` — set `name:` and `description:` (include trigger phrasing) and write the body.
3. Edit `plugins/<name>/.claude-plugin/plugin.json` — set `name`, `description`, the `homepage` path, and the `skills` path (`./skills/<name>`).
4. Register it in `.claude-plugin/marketplace.json` under `plugins`:
   ```json
   { "name": "<name>", "description": "<one-line>", "category": "<category>", "source": "./plugins/<name>" }
   ```
5. Commit and push. Users get it with `/plugin install <name>@willow` (or `/plugin update`).

A plugin can also bundle a **command** (`commands/`) and **hooks** (`hooks/hooks.json`) — see `study-coding-mode` for a worked example.

## License

MIT © 2026 WillowRyu
