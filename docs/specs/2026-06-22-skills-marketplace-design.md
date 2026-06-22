# WillowRyu/skills — 공개 마켓플레이스 설계

- 날짜: 2026-06-22
- 상태: 설계 승인 대기 (스펙 리뷰 단계)
- 대상 레포: `WillowRyu/skills` (remote `git@github.com-personal:WillowRyu/skills.git`, 현재 빈 레포)

## 1. 배경 / 문제

직접 만든 Claude Code 스킬·워크플로를 **레포마다 따로** 두지 않고 **한 곳**에 모으고 싶다.
현재 흩어진 자산:

- `WillowRyu/agent-handoff` — 독립 레포이자 퍼블리시된 플러그인 (v0.4.2). 스킬 4개(`setup-handoff`/`plan`/`execute`/`verify`) + 훅 + 문서. **공식 Claude 마켓플레이스에 신청해둔 상태.**
- `~/.agents/skills/` — `SKILL.md` 폴더 8개(git 미추적), `~/.claude/skills/`에 심볼릭링크. 일부는 공개 컬렉션 기반(third-party)으로 추정.

## 2. 목표 / 비목표

**목표**
- `WillowRyu/skills`를 **하나의 공개 마켓플레이스**로 만들어, 내 모든 플러그인을 한 진입점(`/plugin marketplace add WillowRyu/skills`)에서 설치 가능하게 한다.
- 앞으로 만들 새 스킬을 이 레포에 쌓되, **스킬마다 개별 설치**가 되도록 한다.
- 이미 공개 신청된 `agent-handoff`는 **건드리지 않고** 컬렉션에 포함한다.

**비목표**
- agent-handoff 원본 레포를 이동/아카이브/구조 변경하지 않는다 (공식 마켓플레이스 등록 보호).
- third-party 스킬을 재배포하지 않는다 (본인 저작 스킬만 수록).
- 모든 스킬을 하나의 묶음 플러그인으로 합치지 않는다 (개별 설치 요구사항과 상충).

## 3. 핵심 결정

`skills` 레포 = **마켓플레이스**.
- `agent-handoff`는 **외부 레포 참조**(`{"source":"github","repo":"WillowRyu/agent-handoff"}`)로 포함 → 원본 레포 그대로 유지, 공식 등록 안전. 같은 플러그인이 공식 마켓 + 내 마켓 양쪽에 올라가도 충돌 없음.
- 새 스킬은 **스킬 1개 = 로컬 플러그인 1개**로 `plugins/<name>/`에 추가하고 `marketplace.json`에 한 줄 등록.
- 공개 마켓플레이스, MIT 라이선스.

## 4. 레포 레이아웃

```
skills/                              ← WillowRyu/skills (공개 마켓플레이스)
├─ .claude-plugin/
│  └─ marketplace.json               ← 플러그인 목록 (초기엔 agent-handoff 참조만)
├─ plugins/                          ← 새 스킬 = 여기에 플러그인 폴더로 추가
│  └─ (초기 비어 있음)
├─ templates/
│  └─ skill-plugin/                  ← 새 스킬 만들 때 복사하는 스캐폴드
│     ├─ .claude-plugin/plugin.json
│     └─ skills/
│        └─ skill-name/SKILL.md
├─ README.md
└─ LICENSE                           ← MIT
```

각 스킬 플러그인의 형태(개별 설치 단위):

```
plugins/<skill-name>/
├─ .claude-plugin/plugin.json        ← name=<skill-name>, skills=["./skills/<skill-name>"]
└─ skills/
   └─ <skill-name>/SKILL.md
```

## 5. `marketplace.json` (초기 상태)

```jsonc
{
  "$schema": "https://anthropic.com/claude-code/marketplace.schema.json",
  "name": "willow",                          // 설치 식별자 → <plugin>@willow
  "description": "WillowRyu's Claude Code skills & workflows",
  "owner": { "name": "WillowRyu", "url": "https://github.com/WillowRyu" },
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

새 스킬을 추가하면 `plugins[]`에 로컬 참조가 한 줄씩 늘어난다:

```jsonc
{
  "name": "<skill-name>",
  "description": "<one-line>",
  "category": "<category>",
  "source": "./plugins/<skill-name>"
}
```

- agent-handoff 참조는 `sha`/`ref`를 박지 않아 **항상 최신 추적**(내 레포라 안전). 필요 시 핀 고정 가능.

## 6. 스킬 플러그인 템플릿

`templates/skill-plugin/.claude-plugin/plugin.json`:

```jsonc
{
  "name": "skill-name",
  "version": "0.1.0",
  "description": "TODO one-line description",
  "author": { "name": "WillowRyu", "url": "https://github.com/WillowRyu" },
  "homepage": "https://github.com/WillowRyu/skills/tree/main/plugins/skill-name",
  "repository": "https://github.com/WillowRyu/skills",
  "license": "MIT",
  "skills": ["./skills/skill-name"]
}
```

`templates/skill-plugin/skills/skill-name/SKILL.md`:

```markdown
---
name: skill-name
description: TODO — what it does + when to use it (트리거 문구 포함).
---

스킬 본문.
```

## 7. 새 스킬 추가 워크플로

1. `templates/skill-plugin/` → `plugins/<name>/`로 복사.
2. 내부 `skills/skill-name/` → `skills/<name>/`로 이름 변경, `SKILL.md`의 frontmatter(`name`/`description`)와 본문 작성.
3. `plugins/<name>/.claude-plugin/plugin.json`의 `name`/`description`/`skills` 경로 채움.
4. `.claude-plugin/marketplace.json`의 `plugins[]`에 로컬 참조 한 줄 추가.
5. commit & push.
6. 사용자: `/plugin install <name>@willow` (신규) 또는 `/plugin update` (갱신).

- 스킬이 커져 **훅/커맨드/에이전트**가 필요해지면, 같은 플러그인 폴더에 `hooks/`·`commands/`를 추가한다(플러그인이므로 그대로 지원). agent-handoff가 그 예시.
- (선택·후속) `scripts/new-skill.sh <name> "<desc>"`로 1~3단계 자동화 가능. 4단계(JSON 편집)는 수동 또는 `jq`로.

## 8. 설치 / 사용

```
/plugin marketplace add WillowRyu/skills
/plugin install agent-handoff@willow        # agent-handoff (외부 레포에서 받아옴)
/plugin install <skill>@willow              # 개별 스킬
```

## 9. 기존 흩어진 스킬 처리 (후속·선택)

- `~/.agents/skills/` 중 **본인 저작** 스킬(예: `grill-me`, `zoom-out`, `to-prd` 등으로 추정)은 원하면 7번 워크플로로 하나씩 플러그인화해 넣는다.
- third-party 추정 스킬(`tdd`, `improve-codebase-architecture`, `grill-with-docs` 등)은 **수록하지 않는다**. 필요하면 원 출처 마켓플레이스를 별도로 설치.
- 이번 스캐폴드 범위에는 포함하지 않는다.

## 10. 명명 / 라이선스

- 마켓플레이스 `name`: `willow`. 레포명: `skills`. (둘이 달라도 됨)
- 스킬 플러그인 이름: 스킬 이름과 동일하게.
- LICENSE: MIT (agent-handoff과 동일).

## 11. 구현 범위 (이번 작업)

빈 골격을 만든다. 첫 스킬은 사용자가 추후 지정.

- `.claude-plugin/marketplace.json` (agent-handoff 참조만)
- `templates/skill-plugin/` 스캐폴드
- `plugins/` (빈 디렉터리 유지용 `.gitkeep`)
- `README.md`, `LICENSE`(MIT), `.gitignore`

상세 단계는 구현 계획(writing-plans)에서 확정한다.
