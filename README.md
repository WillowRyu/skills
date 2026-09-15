# Willow Skills

**English** | [한국어](README.ko.md)

A collection of WillowRyu's skills and workflows for **Claude Code and Codex**. Each plugin is independently installable; see the host-specific instructions below.

## Install

### Claude Code

```
/plugin marketplace add WillowRyu/skills
/plugin install <plugin>@willow
/reload-plugins
```

- `<plugin>` is one of the plugin names below (e.g. `study-coding-mode`).
- **Update later:** `/plugin marketplace update willow`, then `/plugin install <plugin>@willow` again.

### Codex

Requires Node.js 18+ on `PATH` and a Codex version with plugins and `UserPromptSubmit` hooks. The package was checked with Codex CLI 0.147.0.

```bash
codex plugin marketplace add WillowRyu/skills
codex plugin add study-coding-mode@willow
```

Review and trust the plugin's hooks when Codex prompts, then start a new task. Hook trust is required for automatic study-mode reminders. See [Codex hooks](https://learn.chatgpt.com/docs/hooks#plugin-bundled-hooks).

- **Update later:** `codex plugin marketplace upgrade willow`, then `codex plugin add study-coding-mode@willow` and start a new task. Review updated hooks if prompted.
- **Develop from a local checkout:** use `codex plugin marketplace add /absolute/path/to/skills` instead of the GitHub source, then install with the same command. For later local edits, ask Codex's `$plugin-creator` to update this plugin from the local marketplace; its update flow refreshes the version cachebuster and reinstalls the package. Start a new task afterward.
- The Codex marketplace currently contains `study-coding-mode` and `command-code-delegate`. Install `agent-handoff` through its existing universal skill installer below; its upstream repository does not yet provide a Codex plugin manifest.

## Plugins

### `agent-handoff`

Claude Code plugin:

```
/plugin install agent-handoff@willow
```

Codex — install all four skills together:

```bash
npx skills@latest add WillowRyu/agent-handoff --skill '*' -g -a codex
```

The universal installation includes the skills and their resources. The Claude plugin's automatic file-write approval hook is not installed; Codex uses its own permissions. See the [upstream installation and permissions guide](https://github.com/WillowRyu/agent-handoff#install).

A strict **3-stage handoff workflow for coding agents** — `plan` → `execute` → `verify` — with disk-backed state (`.handoff/*.md`) so each stage can run in a **fresh chat / context**. That means verification and code review happen with clean context instead of the same agent grading its own work. Supports multi-phase plans and parallel subagent execution.

- **Skills:** `setup-handoff`, `plan`, `execute`, `verify`
- **Source & full docs:** [github.com/WillowRyu/agent-handoff](https://github.com/WillowRyu/agent-handoff) — it lives in its own repository and is included here by reference.

### `study-coding-mode`

Claude Code:

```
/plugin install study-coding-mode@willow
```

Codex: `codex plugin add study-coding-mode@willow` after adding the marketplace above.

A **learn-by-typing tutor mode.** Instead of writing the optimal code *for* you, the AI becomes a tutor: it explains the *why*, hands you one small step at a time to **type yourself**, verifies your code, and proactively teaches the architecture, patterns, and terminology as you go. Use it when you want to actually understand and be able to judge what you're building — not just receive finished code.

**The loop:**

1. Breaks the work into the smallest *learnable* steps and shares a roadmap (and why that order).
2. For each step: explains the **why** first → hands you the exact small piece to **type** → **verifies the code you typed** → at key decisions, offers **2–4 named deep-dive topics** to explore.
3. Ask anything, anytime — terminal tables/code by default, or a **styled HTML explainer** for big or visual topics.

**Code boundary:** you type the meaningful code; the AI fills only pure boilerplate/config on request, and never silently takes over.

**Turn it on / off in Claude Code:**

```
/study-coding-mode:toggle            # flip on / off
/study-coding-mode:toggle junior     # turn on at a level: junior | mid | senior
/study-coding-mode:toggle status     # check
```

**In Codex**, type `$` and select `study-coding-mode:study-coding-mode`. The examples below abbreviate the selected skill as `$study-coding-mode`; standalone installs use that unprefixed name.

```text
$study-coding-mode                  # flip on / off
$study-coding-mode on               # enable, preserving the current level
$study-coding-mode junior           # enable/change level: junior | mid | senior
$study-coding-mode status           # report state only
$study-coding-mode off              # exit
```

…or say *"study coding mode"* / *"teach me as we build, I'll type it"*. Natural-language activation preserves an existing level. Pick a **teaching level** — `junior` (default; unpacks terms with plain definitions and analogies), `mid`, or `senior` — at the start or anytime by asking (*"explain this more simply"*, *"switch to senior"*). Ordinary explanation requests do not activate the mode.

The full plugin's `UserPromptSubmit` hook re-asserts the active mode on subsequent prompts, including after context compaction, until you turn it off. Both hosts intentionally share the legacy `.claude/study-coding-mode` marker in the session working directory: switching hosts in that directory preserves the mode and level. Keep this local state out of commits. Installing the complete skill directory (including `scripts/`) on its own provides the controls but does **not** install the reminder hook; use `$study-coding-mode on` to resume at the saved level after context loss. A bare invocation would toggle an active mode off. Copying only `SKILL.md` is insufficient for the controls.

### `command-code-delegate`

Claude Code:

```
/plugin install command-code-delegate@willow
```

Codex: after adding the marketplace above, run `codex plugin add command-code-delegate@willow`, then type `$` and select the namespaced skill `command-code-delegate:command-code-delegate` (standalone installs use the unprefixed name).

Delegates **bounded, well-specified coding** — simple implementations, repetitive edits, mechanical transformations — to a **configured Command Code CLI worker** (`cmd -p`), while the **main model keeps planning, design decisions, and final review**. The worker implements, reviews its own diff, runs the relevant checks, fixes defects, re-runs them, and only then hands back a final result; the main model independently verifies that diff instead of accepting the worker's claims.

- **Role split:** the main model fixes the purpose, requirements, allowed change scope, acceptance criteria, and verification method; the worker does the implementation; the main model then reviews the final diff. Do not let the worker self-approve and stop there.
- **Execution settings:** the worker runs non-interactively as `cmd -p --output-format json` with an appropriate `--max-turns`. The model, reasoning effort, and permission mode follow your request first, then applicable personal/project instructions, then your existing Command Code config. When you don't specify a model or effort, the skill omits `--model`/`--effort` so the CLI resolves its own defaults — it never invents a value or silently changes persistent config. It does not force a permission mode; the CLI's settings apply, and `--yolo` is added only when you have already explicitly authorized it.
- **Your preferences:** anything you leave unspecified falls back to your Command Code config and its CLI defaults, so a personal default — say, a particular model or effort you keep in your own instructions — is honored for that run without being baked into the skill.
- **Making delegation your default:** a single delegation does not change how the agent behaves on later tasks. Persistent default delegation requires you to instruct it separately (for example, *"Delegate bounded implementation to Command Code by default and reserve yourself for planning and review"*).

**Running the worker on another PC:** the machine that executes the delegations needs its own prerequisites, none of which this skill installs — the Command Code CLI **`cmd`** installed and on `PATH`, **Node.js 22 or newer** (if a directory selects Node 20, prefix that call's `PATH` with the Node 22+ bin directory), and an authenticated Command Code account with access to the chosen model (sign in with `cmd login`). Installing this skill/plugin does **not** install the CLI, perform authentication, or copy any personal global `AGENTS.md` instructions; those live on that machine and must be set up there separately. Install the CLI through its official distribution and confirm `cmd --version` before delegating.

## Adding a new skill

Each skill ships as its own installable plugin under `plugins/`.

1. Copy the template:
   ```
   cp -R templates/skill-plugin plugins/<name>
   mv plugins/<name>/skills/skill-name plugins/<name>/skills/<name>
   ```
2. Edit `plugins/<name>/skills/<name>/SKILL.md` — set `name:` and `description:` (include trigger phrasing) and write the body.
3. Edit **both** manifests copied from the template:
   - `.claude-plugin/plugin.json`: set `name`, `description`, `homepage`, and `skills` (`["./skills/<name>"]`).
   - `.codex-plugin/plugin.json`: use the same name and version, set the metadata and `interface` presentation fields, and keep `skills` as `"./skills/"`.
4. Register it in `.claude-plugin/marketplace.json` under `plugins`:
   ```json
   { "name": "<name>", "description": "<one-line>", "category": "<category>", "source": "./plugins/<name>" }
   ```
5. Register it in `.agents/plugins/marketplace.json` under `plugins`:
   ```json
   {
     "name": "<name>",
     "source": { "source": "local", "path": "./plugins/<name>" },
     "policy": { "installation": "AVAILABLE", "authentication": "ON_INSTALL" },
     "category": "Developer Tools"
   }
   ```
   Paths resolve from the repository root. This catalog is for Codex; the Claude catalog remains separate.
6. Check installation in each host, then commit and push. Users install with `/plugin install <name>@willow` in Claude Code or `codex plugin add <name>@willow` in Codex.

A plugin can bundle Claude **commands** (`commands/`) and shared **hooks** (`hooks/hooks.json`). Provide Codex controls through the skill itself. Both hosts discover `hooks/hooks.json`; Codex also supplies `CLAUDE_PLUGIN_ROOT` for compatibility. See `study-coding-mode` for an example and the [Codex packaging reference](https://developers.openai.com/plugins/build/plugins).

## Development checks

```bash
node --test tests/study-coding-mode.test.js
```

This checks real marker changes and the reminder's input/output for both hosts, using temporary projects. After installing the plugin, also smoke-test `on`, `senior`, `status`, a normal follow-up prompt, context compaction followed by another prompt, and `off` in a disposable project. Confirm that `status` does not enable the mode and that the selected level survives reloading the skill.

## License

MIT © 2026 WillowRyu
