# Skills Marketplace Scaffold Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create the empty scaffold for `WillowRyu/skills` — a public Claude Code plugin marketplace that includes `agent-handoff` by reference and is ready to accept new per-skill plugins.

**Architecture:** The repo is a marketplace (`.claude-plugin/marketplace.json`). `agent-handoff` is referenced from its own GitHub repo (never moved/modified). New skills are added later as individual plugins under `plugins/`, each independently installable. A `templates/skill-plugin/` scaffold makes adding a skill a copy-and-fill operation.

**Tech Stack:** JSON manifests (Claude Code marketplace/plugin schema), Markdown, git. Validation via `jq` (`/usr/bin/jq`).

## Global Constraints

- Working directory: `/Users/siwonryu/projects/skills` (run all commands from repo root). Default branch: `main`.
- Marketplace `name`: `willow`. Repo name: `skills`. (They differ on purpose — install identifier is `<plugin>@willow`.)
- Public marketplace. **Own-authored skills only** — never redistribute third-party skills.
- License: MIT, `Copyright (c) 2026 WillowRyu` (verbatim, matches `agent-handoff`).
- `agent-handoff` is included **only by external GitHub reference** (`{"source":"github","repo":"WillowRyu/agent-handoff"}`). Never move, copy, or modify the original `WillowRyu/agent-handoff` repo.
- Each skill = its own plugin (individual install). No umbrella/bundle plugin.
- All JSON files must be valid and parse with `jq`.
- Every commit message ends with the trailer: `Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>`.
- Do **not** push to the remote during tasks 1–3. Pushing is gated on explicit user confirmation in Task 4 (public repo).

## File Structure

| File | Responsibility |
|------|----------------|
| `LICENSE` | MIT license, copyright WillowRyu |
| `.gitignore` | Ignore OS/editor cruft |
| `README.md` | Human-facing: what it is, install, how to add a skill |
| `.claude-plugin/marketplace.json` | Marketplace manifest; lists plugins (initially only `agent-handoff` by reference) |
| `plugins/.gitkeep` | Keep the (initially empty) `plugins/` directory tracked |
| `templates/skill-plugin/.claude-plugin/plugin.json` | Template plugin manifest for a new per-skill plugin |
| `templates/skill-plugin/skills/skill-name/SKILL.md` | Template skill body |

Note: the `templates/` files intentionally contain placeholder tokens (`skill-name`, "One-line description…"). Those are literal template content to be filled when copied — not plan placeholders.

---

### Task 1: Repo hygiene — LICENSE, .gitignore, README

**Files:**
- Create: `LICENSE`
- Create: `.gitignore`
- Create: `README.md`

**Interfaces:**
- Consumes: nothing (first task).
- Produces: a documented, licensed repo root. README documents the install command (`/plugin install <plugin>@willow`) and the add-a-skill workflow that Task 3's template supports.

- [ ] **Step 1: Create `LICENSE`** (exact content)

```
MIT License

Copyright (c) 2026 WillowRyu

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

- [ ] **Step 2: Create `.gitignore`** (exact content)

```
# OS
.DS_Store
Thumbs.db

# Editor
.idea/
.vscode/
*.swp
```

- [ ] **Step 3: Create `README.md`** (exact content)

````markdown
# Willow Skills

A personal [Claude Code](https://claude.com/claude-code) plugin marketplace — WillowRyu's skills and workflows in one place.

## Install

```
/plugin marketplace add WillowRyu/skills
/plugin install <plugin>@willow
```

## Plugins

| Plugin | Description | Source |
|--------|-------------|--------|
| `agent-handoff` | Strict 3-stage handoff workflow (plan → execute → verify) for coding agents. | [WillowRyu/agent-handoff](https://github.com/WillowRyu/agent-handoff) |

> `agent-handoff` lives in its own repo and is included here by reference. Install it with `/plugin install agent-handoff@willow`.

## Adding a new skill

Each skill ships as its own installable plugin under `plugins/`.

1. Copy the template:
   ```
   cp -R templates/skill-plugin plugins/<name>
   mv plugins/<name>/skills/skill-name plugins/<name>/skills/<name>
   ```
2. Edit `plugins/<name>/skills/<name>/SKILL.md` — set `name:` and `description:` (include trigger phrasing) and write the body.
3. Edit `plugins/<name>/.claude-plugin/plugin.json` — set `name`, `description`, and the `skills` path (`./skills/<name>`).
4. Register it in `.claude-plugin/marketplace.json` under `plugins`:
   ```json
   { "name": "<name>", "description": "<one-line>", "source": "./plugins/<name>" }
   ```
5. Commit and push. Users get it with `/plugin install <name>@willow` (or `/plugin update`).

## License

MIT © 2026 WillowRyu
````

- [ ] **Step 4: Verify files exist and are non-empty**

Run:
```bash
cd /Users/siwonryu/projects/skills && wc -l LICENSE .gitignore README.md
```
Expected: three line counts, all > 0 (LICENSE 21, .gitignore ~7, README ~35).

- [ ] **Step 5: Commit**

```bash
cd /Users/siwonryu/projects/skills
git add LICENSE .gitignore README.md
git commit -m "chore: add LICENSE, .gitignore, and README"
```
(Append the Co-Authored-By trailer per Global Constraints.)

---

### Task 2: Marketplace manifest

**Files:**
- Create: `.claude-plugin/marketplace.json`
- Create: `plugins/.gitkeep`

**Interfaces:**
- Consumes: nothing from Task 1.
- Produces: a valid marketplace named `willow` whose `plugins[0]` is `agent-handoff` sourced from `{source:"github", repo:"WillowRyu/agent-handoff"}`. Task 3 and all future skills append local entries (`source: "./plugins/<name>"`) to this `plugins` array.

- [ ] **Step 1: Create `.claude-plugin/marketplace.json`** (exact content)

```json
{
  "$schema": "https://anthropic.com/claude-code/marketplace.schema.json",
  "name": "willow",
  "description": "WillowRyu's Claude Code skills & workflows",
  "owner": {
    "name": "WillowRyu",
    "url": "https://github.com/WillowRyu"
  },
  "plugins": [
    {
      "name": "agent-handoff",
      "description": "Strict 3-stage handoff workflow (plan → execute → verify) for coding agents.",
      "category": "workflow",
      "source": { "source": "github", "repo": "WillowRyu/agent-handoff" }
    }
  ]
}
```

- [ ] **Step 2: Create `plugins/.gitkeep`** (empty file)

```bash
cd /Users/siwonryu/projects/skills && mkdir -p plugins && touch plugins/.gitkeep
```

- [ ] **Step 3: Validate JSON is well-formed**

Run:
```bash
cd /Users/siwonryu/projects/skills && jq empty .claude-plugin/marketplace.json && echo OK
```
Expected: prints `OK`, exit 0 (no parse error).

- [ ] **Step 4: Validate required structure**

Run:
```bash
cd /Users/siwonryu/projects/skills && jq -e '
  .name=="willow"
  and (.plugins | length>=1)
  and (.plugins[0].name=="agent-handoff")
  and (.plugins[0].source.source=="github")
  and (.plugins[0].source.repo=="WillowRyu/agent-handoff")
' .claude-plugin/marketplace.json
```
Expected: prints `true`, exit 0.

- [ ] **Step 5: Commit**

```bash
cd /Users/siwonryu/projects/skills
git add .claude-plugin/marketplace.json plugins/.gitkeep
git commit -m "feat: add marketplace manifest referencing agent-handoff"
```
(Append the Co-Authored-By trailer per Global Constraints.)

---

### Task 3: New-skill template scaffold

**Files:**
- Create: `templates/skill-plugin/.claude-plugin/plugin.json`
- Create: `templates/skill-plugin/skills/skill-name/SKILL.md`

**Interfaces:**
- Consumes: the marketplace from Task 2 (a new skill registers a `./plugins/<name>` entry there).
- Produces: a copy-ready plugin template. After `cp -R templates/skill-plugin plugins/<name>`, the result is a valid single-skill plugin once its tokens are filled.

- [ ] **Step 1: Create `templates/skill-plugin/.claude-plugin/plugin.json`** (exact content)

```json
{
  "name": "skill-name",
  "version": "0.1.0",
  "description": "One-line description of the skill.",
  "author": {
    "name": "WillowRyu",
    "url": "https://github.com/WillowRyu"
  },
  "homepage": "https://github.com/WillowRyu/skills/tree/main/plugins/skill-name",
  "repository": "https://github.com/WillowRyu/skills",
  "license": "MIT",
  "skills": ["./skills/skill-name"]
}
```

- [ ] **Step 2: Create `templates/skill-plugin/skills/skill-name/SKILL.md`** (exact content)

```markdown
---
name: skill-name
description: What it does and when to use it. Include trigger phrases (e.g. "Use when ...").
---

Write the skill body here.
```

- [ ] **Step 3: Validate the template plugin.json**

Run:
```bash
cd /Users/siwonryu/projects/skills && jq -e '
  .name and .version and .description
  and (.skills | type=="array")
  and (.skills[0]=="./skills/skill-name")
' templates/skill-plugin/.claude-plugin/plugin.json
```
Expected: prints `true`, exit 0.

- [ ] **Step 4: Validate the SKILL.md has YAML frontmatter with name + description**

Run:
```bash
cd /Users/siwonryu/projects/skills && awk 'NR==1&&$0=="---"{f=1;next} f&&$0=="---"{exit} f{print}' templates/skill-plugin/skills/skill-name/SKILL.md | grep -E '^(name|description):'
```
Expected: prints the `name:` and `description:` lines (two matches).

- [ ] **Step 5: Commit**

```bash
cd /Users/siwonryu/projects/skills
git add templates/
git commit -m "feat: add per-skill plugin template"
```
(Append the Co-Authored-By trailer per Global Constraints.)

---

### Task 4: End-to-end acceptance (+ optional push)

**Files:** none created. Verification + delivery only.

**Interfaces:**
- Consumes: all prior tasks (full repo).
- Produces: confidence the marketplace loads, and (on user confirmation) a pushed public repo.

- [ ] **Step 1: Confirm final tree**

Run:
```bash
cd /Users/siwonryu/projects/skills && git ls-files
```
Expected (order may vary):
```
.claude-plugin/marketplace.json
.gitignore
LICENSE
README.md
docs/plans/2026-06-22-skills-marketplace-scaffold.md
docs/specs/2026-06-22-skills-marketplace-design.md
plugins/.gitkeep
templates/skill-plugin/.claude-plugin/plugin.json
templates/skill-plugin/skills/skill-name/SKILL.md
```

- [ ] **Step 2: Re-validate all JSON parses**

Run:
```bash
cd /Users/siwonryu/projects/skills && find . -name '*.json' -not -path './.git/*' -print -exec jq empty {} \; && echo ALL_JSON_OK
```
Expected: lists each JSON file, then prints `ALL_JSON_OK`, exit 0.

- [ ] **Step 3: Manual smoke test — load the marketplace in Claude Code**

In a Claude Code session, run:
```
/plugin marketplace add /Users/siwonryu/projects/skills
/plugin
```
Expected: marketplace `willow` is added; `agent-handoff@willow` appears in the plugin list and is installable. (This is the human acceptance gate — slash commands can't be run from a shell.)

- [ ] **Step 4: Push — ONLY after explicit user confirmation**

This repo's remote is public. Ask the user to confirm before pushing. On confirmation:
```bash
cd /Users/siwonryu/projects/skills
git push -u origin main
```
Expected: `main` published to `git@github.com-personal:WillowRyu/skills.git`. If the user declines, stop here — the scaffold is complete locally.

---

## Self-Review

**1. Spec coverage** (against `docs/specs/2026-06-22-skills-marketplace-design.md`):
- §4 layout → Tasks 1–3 create every listed file. ✓
- §5 marketplace.json (agent-handoff ref) → Task 2. ✓
- §6 template → Task 3. ✓
- §7 add-skill workflow → documented in README (Task 1) + template (Task 3). ✓
- §8 install/usage → README (Task 1) + smoke test (Task 4). ✓
- §10 naming/license → Global Constraints + Tasks 1–2. ✓
- §11 scaffold scope (marketplace, templates, plugins/.gitkeep, README, LICENSE, .gitignore) → fully covered. ✓
- §9 (existing loose skills) is explicitly out of scope — no task, by design. ✓

**2. Placeholder scan:** No plan-level placeholders. Template tokens in Task 3 are intentional literal content (flagged in File Structure note).

**3. Type consistency:** Marketplace `name` is `willow` everywhere (Tasks 2, README, smoke test). Plugin `source` shapes are consistent: external = `{source:"github",repo:...}`, local = `"./plugins/<name>"`. Template skill path `./skills/skill-name` matches the directory created in Task 3 Step 2.
