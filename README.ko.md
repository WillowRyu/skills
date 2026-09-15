# Willow Skills

[English](README.md) | **한국어**

**Claude Code와 Codex**에서 사용하는 WillowRyu의 스킬·워크플로 모음입니다. 각 플러그인을 개별 설치할 수 있으며, 도구별 설치 방법은 아래와 같습니다.

## 설치

### Claude Code

```
/plugin marketplace add WillowRyu/skills
/plugin install <plugin>@willow
/reload-plugins
```

- `<plugin>`은 아래 플러그인 이름 중 하나입니다 (예: `study-coding-mode`).
- **나중에 업데이트:** `/plugin marketplace update willow` 실행 후 `/plugin install <plugin>@willow` 다시.

### Codex

`PATH`에서 실행 가능한 Node.js 18 이상과 플러그인·`UserPromptSubmit` 훅을 지원하는 Codex가 필요합니다. 패키지는 Codex CLI 0.147.0에서 확인했습니다.

```bash
codex plugin marketplace add WillowRyu/skills
codex plugin add study-coding-mode@willow
```

Codex가 플러그인 훅의 신뢰 여부를 물으면 내용을 검토하고 허용한 뒤 새 작업을 시작하세요. 자동 학습 모드 알림에는 훅 신뢰가 필요합니다. [Codex 훅 문서](https://learn.chatgpt.com/docs/hooks#plugin-bundled-hooks)

- **업데이트:** `codex plugin marketplace upgrade willow` 실행 후 `codex plugin add study-coding-mode@willow`를 다시 실행하고 새 작업을 시작하세요. 훅이 변경되어 확인을 요청하면 다시 검토하세요.
- **로컬 체크아웃으로 개발:** GitHub 주소 대신 `codex plugin marketplace add /absolute/path/to/skills`를 실행한 뒤 같은 설치 명령을 사용하세요. 이후 로컬 수정은 Codex의 `$plugin-creator`에 이 로컬 마켓플레이스의 플러그인 업데이트를 요청하세요. 업데이트 절차가 버전의 캐시 식별자를 갱신하고 패키지를 재설치합니다. 이후 새 작업을 시작하세요.
- 현재 Codex 마켓플레이스에는 `study-coding-mode`와 `command-code-delegate`가 포함됩니다. `agent-handoff`는 아래의 기존 범용 스킬 설치 경로를 사용하세요. 원본 저장소에는 아직 Codex 플러그인 manifest가 없습니다.

## 플러그인

### `agent-handoff`

Claude Code 플러그인:

```
/plugin install agent-handoff@willow
```

Codex — 스킬 4개를 함께 설치:

```bash
npx skills@latest add WillowRyu/agent-handoff --skill '*' -g -a codex
```

범용 설치에는 스킬과 관련 리소스가 포함됩니다. Claude 플러그인의 파일 쓰기 자동 승인 훅은 설치되지 않으며, Codex 자체 권한 설정을 따릅니다. [원본 설치·권한 안내](https://github.com/WillowRyu/agent-handoff#install)

코딩 에이전트를 위한 엄격한 **3단계 핸드오프 워크플로** — `plan` → `execute` → `verify` — 입니다. 디스크 기반 상태(`.handoff/*.md`)를 써서 각 단계를 **새 채팅 / 컨텍스트**에서 실행할 수 있어요. 덕분에 검증·코드리뷰가 같은 에이전트가 자기 작업을 자평하는 게 아니라 깨끗한 컨텍스트에서 이뤄집니다. 다단계 플랜과 병렬 서브에이전트 실행을 지원합니다.

- **스킬:** `setup-handoff`, `plan`, `execute`, `verify`
- **소스 & 전체 문서:** [github.com/WillowRyu/agent-handoff](https://github.com/WillowRyu/agent-handoff) — 자체 레포에 있으며 여기서는 참조로 포함됩니다.

### `study-coding-mode`

Claude Code:

```
/plugin install study-coding-mode@willow
```

Codex: 위에서 마켓플레이스를 추가한 뒤 `codex plugin add study-coding-mode@willow`로 설치합니다.

**직접 타이핑하며 배우는 튜터 모드.** AI가 최적의 코드를 *대신* 써주는 대신 튜터가 됩니다: *왜* 그렇게 하는지 먼저 설명하고, 한 번에 한 단계씩 **직접 타이핑**하도록 넘겨주고, 당신이 친 코드를 검증하고, 진행하면서 아키텍처·패턴·용어를 선제적으로 알려줍니다. 완성된 코드를 받기만 하는 게 아니라 — 만드는 걸 실제로 이해하고 판단하고 싶을 때 쓰세요.

**진행 루프:**

1. 작업을 가장 작은 *학습 단위*로 쪼개고 로드맵을 공유합니다 (그 순서인 이유까지).
2. 각 단계: **왜**를 먼저 설명 → 정확한 작은 코드를 **타이핑**하라고 넘김 → **당신이 친 코드를 검증** → 핵심 결정 지점에서 **더 깊게 볼 주제 2~4개**를 제시.
3. 언제든 질문 가능 — 기본은 터미널 표·코드, 크거나 시각적인 주제는 **styled HTML 설명기**.

**코드 경계:** 의미 있는 코드는 당신이 타이핑하고, AI는 요청 시 순수 보일러플레이트/설정만 채웁니다. 절대 몰래 대신 작성하지 않습니다.

**Claude Code에서 켜고 / 끄기:**

```
/study-coding-mode:toggle            # 켜기 / 끄기 토글
/study-coding-mode:toggle junior     # 레벨 지정해서 켜기: junior | mid | senior
/study-coding-mode:toggle status     # 상태 확인
```

**Codex에서는** `$`를 입력하고 `study-coding-mode:study-coding-mode`를 선택하세요. 아래 예시에서는 선택한 스킬을 `$study-coding-mode`로 줄여 표기합니다. 단독 설치 시에는 접두사 없는 이름을 사용합니다.

```text
$study-coding-mode                  # 켜기 / 끄기 토글
$study-coding-mode on               # 기존 레벨을 유지하며 켜기
$study-coding-mode junior           # 레벨 지정: junior | mid | senior
$study-coding-mode status           # 상태만 확인
$study-coding-mode off              # 종료
```

…또는 *"스터디 코딩 모드"* / *"학습하면서 만들자, 내가 칠게"*처럼 말로 해도 됩니다. 말로 모드를 켜면 기존 레벨을 유지합니다. **티칭 레벨**은 `junior`(기본; 용어를 쉬운 정의와 비유로 설명), `mid`, `senior` 중 선택하고, 도중에도 *"더 쉽게 설명해줘"*, *"시니어로 바꿔줘"*처럼 변경할 수 있습니다. 일반적인 설명 요청만으로 모드를 켜지는 않습니다.

전체 플러그인의 `UserPromptSubmit` 훅이 이후 프롬프트마다 활성 모드를 다시 주입하므로, 컨텍스트 요약 이후에도 끄기 전까지 이어집니다. 두 도구는 기존 호환성을 위해 **세션 작업 디렉터리**의 `.claude/study-coding-mode` 파일을 함께 사용합니다. 같은 디렉터리에서 도구를 바꿔도 모드와 레벨이 유지됩니다. 이 로컬 상태 파일은 커밋하지 마세요. `scripts/`를 포함한 스킬 디렉터리를 단독 설치하면 모드 제어는 가능하지만 알림 훅은 설치되지 않습니다. 컨텍스트가 사라지면 `$study-coding-mode on`으로 저장된 레벨에서 재개하세요. 인자 없이 호출하면 켜져 있던 모드를 끄게 됩니다. `SKILL.md` 파일만 복사하면 제어 스크립트가 빠지므로 정상 작동하지 않습니다.

### `command-code-delegate`

Claude Code:

```
/plugin install command-code-delegate@willow
```

Codex: 위에서 마켓플레이스를 추가한 뒤 `codex plugin add command-code-delegate@willow`로 설치하고, `$`를 입력해 네임스페이스가 붙은 스킬 `command-code-delegate:command-code-delegate`를 선택하세요 (단독 설치 시에는 접두사 없는 이름을 사용합니다).

**범위가 명확한 코딩** — 단순 구현, 반복 수정, 기계적 변환 — 을 **DeepSeek**를 돌리는 **Command Code CLI 작업자**(`cmd -p`)에게 위임하고, **메인 모델은 기획·설계 판단·최종 리뷰를 유지**합니다. 작업자는 구현 → 자체 diff 검토 → 관련 검증 실행 → 결함 수정 → 재검증을 마친 뒤에야 최종 결과를 인계하고, 메인 모델은 작업자의 주장을 그대로 받아들이지 않고 그 diff를 독립 검증합니다.

- **역할 분담:** 메인 모델이 목적·요구사항·수정 허용 범위·완료 기준·검증 방법을 정하고, DeepSeek이 구현하며, 다시 메인 모델이 최종 diff를 리뷰합니다. 작업자의 자체 검증만으로 끝내지 마세요.
- **실행 설정:** 작업자는 high effort·YOLO 모드로 비대화형 실행합니다 — `cmd -p --model deepseek/deepseek-v4.1-flash --effort high --yolo --output-format json`에 작업에 맞는 `--max-turns`를 붙입니다. YOLO는 요청된 기본 방식이며 위임 범위 안에서는 다시 묻지 않지만, 관련 없는 변경이나 외부 게시 권한을 추가하지는 않습니다.
- **위임을 기본값으로 만들기:** 한 번의 위임이 이후 작업의 에이전트 동작을 바꾸지는 않습니다. 지속적인 기본 위임은 사용자가 별도로 지시해야 합니다 (예: *"범위가 명확한 구현은 기본적으로 Command Code에 위임하고, 너는 기획과 리뷰에 집중해"*).

**다른 PC에서 작업자를 실행할 때:** 위임을 실제로 실행하는 머신에는 이 스킬이 설치하지 않는 자체 준비물이 필요합니다 — `PATH`에 있는 Command Code CLI **`cmd`**, **Node.js 22 이상**(디렉터리별 설정이 Node 20을 선택하면 해당 호출의 `PATH` 앞에 Node 22 이상 bin 디렉터리를 지정), 그리고 선택한 모델에 접근할 수 있는 인증된 Command Code 계정(`cmd login`으로 로그인)입니다. 이 스킬/플러그인을 설치해도 CLI 설치, 인증, 개인 전역 `AGENTS.md` 지침 복사는 이뤄지지 않습니다. 그것들은 해당 머신에 있으며 거기서 따로 설정해야 합니다. CLI는 공식 배포 경로로 설치하고 위임 전에 `cmd --version`을 확인하세요.

## 새 스킬 추가하기

각 스킬은 `plugins/` 아래 독립 설치형 플러그인으로 들어갑니다.

1. 템플릿 복사:
   ```
   cp -R templates/skill-plugin plugins/<name>
   mv plugins/<name>/skills/skill-name plugins/<name>/skills/<name>
   ```
2. `plugins/<name>/skills/<name>/SKILL.md` 편집 — `name:`, `description:`(트리거 문구 포함) 설정 후 본문 작성.
3. 템플릿에서 복사한 **두 manifest**를 편집:
   - `.claude-plugin/plugin.json`: `name`, `description`, `homepage`, `skills`(`["./skills/<name>"]`) 설정.
   - `.codex-plugin/plugin.json`: 이름과 버전을 동일하게 맞추고 메타데이터·`interface` 표시 정보를 설정. `skills`는 `"./skills/"`로 유지.
4. `.claude-plugin/marketplace.json`의 `plugins`에 등록:
   ```json
   { "name": "<name>", "description": "<one-line>", "category": "<category>", "source": "./plugins/<name>" }
   ```
5. `.agents/plugins/marketplace.json`의 `plugins`에도 등록:
   ```json
   {
     "name": "<name>",
     "source": { "source": "local", "path": "./plugins/<name>" },
     "policy": { "installation": "AVAILABLE", "authentication": "ON_INSTALL" },
     "category": "Developer Tools"
   }
   ```
   경로 기준은 저장소 루트입니다. 이 목록은 Codex용이며 Claude용 목록은 별도로 유지합니다.
6. 두 도구에서 설치를 확인한 뒤 커밋·푸시합니다. Claude Code는 `/plugin install <name>@willow`, Codex는 `codex plugin add <name>@willow`로 설치합니다.

플러그인은 Claude **명령**(`commands/`)과 공통 **훅**(`hooks/hooks.json`)도 묶을 수 있습니다. Codex의 제어 명령은 스킬 본문으로 제공합니다. 두 도구 모두 `hooks/hooks.json`을 탐색하고, Codex도 호환용 `CLAUDE_PLUGIN_ROOT`를 제공합니다. 예시는 `study-coding-mode`와 [Codex 패키징 문서](https://developers.openai.com/plugins/build/plugins)를 참고하세요.

## 개발 검증

```bash
node --test tests/study-coding-mode.test.js
```

임시 프로젝트에서 실제 상태 파일 변경과 두 도구의 훅 입출력을 확인합니다. 플러그인 설치 후에는 별도 테스트 프로젝트에서 `on`, `senior`, `status`, 일반 후속 프롬프트, 컨텍스트 요약 후 후속 프롬프트, `off`도 확인하세요. `status`만으로 모드가 켜지지 않고, 스킬을 다시 읽어도 선택한 레벨이 유지되어야 합니다.

## 라이선스

MIT © 2026 WillowRyu
