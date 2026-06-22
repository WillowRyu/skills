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
| `study-coding-mode` | Learn-by-typing tutor mode: explains the *why*, hands you one step at a time to type yourself, verifies it, and teaches architecture/patterns/terms as you go. Persistent on/off mode (`/study-coding-mode`). | this repo · `plugins/study-coding-mode` |

> `agent-handoff` lives in its own repo and is included here by reference. Install it with `/plugin install agent-handoff@willow`.

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

## License

MIT © 2026 WillowRyu
