# Willow Skills

[English](README.md) | **한국어**

개인용 [Claude Code](https://claude.com/claude-code) 플러그인 마켓플레이스 — WillowRyu의 스킬과 워크플로를 한곳에 모았습니다. 마켓플레이스를 한 번 추가한 뒤, 아래 플러그인을 골라 설치하세요.

## 설치

```
/plugin marketplace add WillowRyu/skills
/plugin install <plugin>@willow
/reload-plugins
```

- `<plugin>`은 아래 플러그인 이름 중 하나입니다 (예: `study-coding-mode`).
- **나중에 업데이트:** `/plugin marketplace update willow` 실행 후 `/plugin install <plugin>@willow` 다시.

## 플러그인

### `agent-handoff`

```
/plugin install agent-handoff@willow
```

코딩 에이전트를 위한 엄격한 **3단계 핸드오프 워크플로** — `plan` → `execute` → `verify` — 입니다. 디스크 기반 상태(`.handoff/*.md`)를 써서 각 단계를 **새 채팅 / 컨텍스트**에서 실행할 수 있어요. 덕분에 검증·코드리뷰가 같은 에이전트가 자기 작업을 자평하는 게 아니라 깨끗한 컨텍스트에서 이뤄집니다. 다단계 플랜과 병렬 서브에이전트 실행을 지원합니다.

- **스킬:** `setup-handoff`, `plan`, `execute`, `verify`
- **소스 & 전체 문서:** [github.com/WillowRyu/agent-handoff](https://github.com/WillowRyu/agent-handoff) — 자체 레포에 있으며 여기서는 참조로 포함됩니다.

### `study-coding-mode`

```
/plugin install study-coding-mode@willow
```

**직접 타이핑하며 배우는 튜터 모드.** AI가 최적의 코드를 *대신* 써주는 대신 튜터가 됩니다: *왜* 그렇게 하는지 먼저 설명하고, 한 번에 한 단계씩 **직접 타이핑**하도록 넘겨주고, 당신이 친 코드를 검증하고, 진행하면서 아키텍처·패턴·용어를 선제적으로 알려줍니다. 완성된 코드를 받기만 하는 게 아니라 — 만드는 걸 실제로 이해하고 판단하고 싶을 때 쓰세요.

**진행 루프:**

1. 작업을 가장 작은 *학습 단위*로 쪼개고 로드맵을 공유합니다 (그 순서인 이유까지).
2. 각 단계: **왜**를 먼저 설명 → 정확한 작은 코드를 **타이핑**하라고 넘김 → **당신이 친 코드를 검증** → 핵심 결정 지점에서 **더 깊게 볼 주제 2~4개**를 제시.
3. 언제든 질문 가능 — 기본은 터미널 표·코드, 크거나 시각적인 주제는 **styled HTML 설명기**.

**코드 경계:** 의미 있는 코드는 당신이 타이핑하고, AI는 요청 시 순수 보일러플레이트/설정만 채웁니다. 절대 몰래 대신 작성하지 않습니다.

**켜고 / 끄기:**

```
/study-coding-mode:toggle            # 켜기 / 끄기 토글
/study-coding-mode:toggle junior     # 레벨 지정해서 켜기: junior | mid | senior
/study-coding-mode:toggle status     # 상태 확인
```

…또는 그냥 *"스터디 코딩 모드"* / *"학습하면서 만들자, 내가 칠게"* 처럼 말로 해도 됩니다. **티칭 레벨**을 고르세요 — `junior`(기본; 모든 용어를 쉬운 정의 + 비유로 풀어줌), `mid`, `senior` — 시작할 때나 도중에 그냥 말로 바꿀 수 있습니다 (*"더 쉽게 설명해줘"*, *"시니어로 바꿔줘"*). 명시적인 **지속 모드**라서 `UserPromptSubmit` 훅이 매 턴 모드를 다시 주입합니다 — 긴 세션이나 컨텍스트 요약(compaction)에도 끄기 전까지 유지됩니다.

## 새 스킬 추가하기

각 스킬은 `plugins/` 아래 독립 설치형 플러그인으로 들어갑니다.

1. 템플릿 복사:
   ```
   cp -R templates/skill-plugin plugins/<name>
   mv plugins/<name>/skills/skill-name plugins/<name>/skills/<name>
   ```
2. `plugins/<name>/skills/<name>/SKILL.md` 편집 — `name:`, `description:`(트리거 문구 포함) 설정 후 본문 작성.
3. `plugins/<name>/.claude-plugin/plugin.json` 편집 — `name`, `description`, `homepage` 경로, `skills` 경로(`./skills/<name>`) 설정.
4. `.claude-plugin/marketplace.json`의 `plugins`에 등록:
   ```json
   { "name": "<name>", "description": "<one-line>", "category": "<category>", "source": "./plugins/<name>" }
   ```
5. 커밋 & 푸시. 사용자는 `/plugin install <name>@willow`(또는 `/plugin update`)로 받습니다.

플러그인은 **명령**(`commands/`)과 **훅**(`hooks/hooks.json`)도 함께 묶을 수 있습니다 — 예시는 `study-coding-mode` 참고.

## 라이선스

MIT © 2026 WillowRyu
