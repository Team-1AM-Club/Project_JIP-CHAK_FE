# 집:착 (Jip-chak) — Claude Code Project Context

> 이 파일은 Claude Code가 매 세션 시작 시 자동으로 읽음.
> 부모 디렉토리(`c:\Users\gitue\OneDrive\Desktop\CLAUDE.md` — "야수의 심장")의 명세는 **다른 프로젝트**다. 무시하고 이 파일만 따라.

---

## 프로젝트 개요

**집:착** — *"좋은 집을 향한 이유 있는 집착"*

서울시 공공데이터(기후·소음·치안·인프라)를 기반으로, 사용자가 계약을 고민 중인 주소의 **생활 리스크를 사전에 분석**해주는 서비스. 가격·면적·교통·매물조건이 아니라, **실거주 이후 체감되는 불편/위험**을 중심으로 집을 평가한다.

핵심 화면 흐름:
온보딩(가구 유형 선택) → 홈(최근/저장 리포트) → 주소 검색 → 지도 확정 → 분석중 → 리포트(종합 점수 + 5리스크) → 리스크 상세 / 비교

### 5대 생활 리스크 (가드레일)

| 코드(`RiskType`) | 의미 |
|---|---|
| `FLOOD` | 침수 (저지대·침수흔적·배수) |
| `SAFETY` | 야간 안전 (안심귀갓길·CCTV·5대 범죄) |
| `MEDICAL` | 의료 접근성 (응급실·야간진료·약국) |
| `CONGESTION` | 생활 혼잡도 (생활인구·유동인구·주차) |
| `NOISE` | 소음 (도로·항공) |

이 다섯 외 새 리스크 카테고리는 **PRD 변경**이다. 임의로 `RiskType` 유니온 확장 금지. 사용자에게 먼저 확인.

### 가구 유형 (`UserProfileType`)

| 코드 | 의미 | 우선순위 |
|---|---|---|
| `SINGLE` | 청년 1인 가구 | **주타겟** — UX/문구 1순위 |
| `COUPLE` | 신혼·예비부부 | 부타겟 |
| `FAMILY` | 부모 동거 가족 | 부타겟 |

리스크 가중치는 가구 유형별로 다르게 적용될 예정 (`/users/weights`).

### 서비스 정체성 (코드 결정 시 참고)

이 줄들이 곧 "이 앱이 뭐가 아닌지"의 가드레일이다. 새 기능 검토 시 위배되면 의심하고 사용자에게 확인:

- **생활 리스크 중심**, 거래 리스크 아님 → 전세사기·권리관계·임대인 검증·시세 비교는 다른 서비스 영역(직방 지킴진단, 서울시 전세사기 보고서)
- **통합 리포트**, 단순 데이터 나열 아님 → 5리스크는 항상 종합 점수 + 차트로 묶어 표현. 개별 데이터 조회 화면을 따로 만드는 방향 지양
- **의사결정 지원**, 지도 조회 아님 → 지도/검색은 진입점. 최종 산출물은 항상 "이 집 살까/말까"를 돕는 리포트
- **서울 한정 (MVP)** → 전국 확장 가정한 추상화는 아직 하지 말 것. 주소는 서울시 행정동/도로명 기준
- **타겟 우선순위**: 청년 1인 가구 > 신혼 > 부모 동거. 마이크로카피·기본값은 1인 가구 기준

### 플랫폼: 웹 우선

**1순위 타겟은 웹**. 추후 PWA 확장 가능. 현재는 데스크톱에서도 모바일 폭(360~430px)으로 가운데 고정되는 "모바일 프레임" 레이아웃([src/styles/global.css](src/styles/global.css)의 `.mobile-frame`)으로 구현돼 있음.

- UI 변경은 항상 `npm run dev` 띄워서 브라우저에서 먼저 확인
- 데스크톱 브라우저에서 깨지지 않게 `--frame-width: clamp(360px, 92vw, 430px)` 유지
- 호버 의존 상호작용 지양 (모바일 터치 우선이지만 데스크톱에서도 동작해야 함)
- 키보드 접근성·포커스 링 정도는 신경 쓸 것

---

## 현재 단계

UI 프로토타입 — 디자인/화면 구조 완성, **데이터는 mock**(`src/data/mockData.ts` + `src/services/mockService.ts`).

자체 백엔드 API 스켈레톤은 [src/services/api/](src/services/api/)에 잡혀 있고, **명세 받은 feature부터 점진 교체** 중. 전역 mock 토글 플래그는 없음 — 화면이 어떤 호출을 쓰는지로 판단.

---

## 기술 스택 (실제 설치된 것만)

| 레이어 | 라이브러리 | 비고 |
|---|---|---|
| 빌드/번들 | **Vite 5** + `@vitejs/plugin-react` | `npm run dev` / `build` / `preview` |
| 프레임워크 | **React 18** + `react-dom` | StrictMode 사용 |
| 언어 | **TypeScript 5.6** | `strict: true`, `noEmit`, bundler resolution |
| 라우팅 | **없음** — `useState<Screen>` 기반 수동 화면 전환 ([App.tsx](src/App.tsx)) | react-router 등 도입 안 함 |
| 상태관리 | **로컬 useState만** | Zustand / TanStack Query / Redux 전부 미설치 |
| 스타일 | **일반 CSS** ([src/styles/tokens.css](src/styles/tokens.css), [global.css](src/styles/global.css)) | Tailwind / NativeWind / styled-components 전부 미설치 |
| 아이콘 | **lucide-react** | |
| 폼 | 미설치 | (react-hook-form, zod 없음) |

**없는 것 (부모 CLAUDE.md "야수의 심장"과 다름)**: Expo, React Native, Expo Router, NativeWind, Tailwind, Zustand, TanStack Query, Firebase, Drizzle/SQLite, Vision Camera, Skia, MMKV, AsyncStorage, react-native-* 전부.

이런 의존성 가정하고 코드 짜지 말 것. 도입이 필요해 보이면 사용자에게 먼저 confirm.

---

## 폴더 구조 (실제)

```
index.html                            # Vite 진입점
vite.config.ts                        # 최소 설정 (react 플러그인만)
tsconfig.json                         # strict + bundler resolution
src/
├── main.tsx                          # React 마운트, tokens.css → global.css 순서로 import
├── App.tsx                           # screen state 관리 + 화면 분기 (라우터 대체)
├── components/
│   ├── AppShell.tsx                  # mobile-frame 컨테이너 + BottomNav 토글
│   ├── ui.tsx                        # Button/IconButton/Card/Header/BottomNav/ScorePill 등 공용
│   ├── ScoreGauge.tsx                # 종합 점수 게이지
│   ├── RiskChart.tsx                 # 5리스크 레이더/막대 차트 (SVG)
│   └── MockMap.tsx                   # SVG 가짜 지도
├── pages/
│   ├── Onboarding.tsx                # 4스텝 온보딩 (가구 유형 선택 포함)
│   ├── HomePage.tsx                  # 최근/저장 리포트, 빠른 진입 그리드
│   ├── SearchPage.tsx                # 주소 검색 (mock 후보)
│   ├── MapSelectPage.tsx             # 위치 확정 → 분석 시작
│   ├── LoadingPage.tsx               # 분석중 (가짜 progress)
│   ├── ReportPage.tsx                # 종합 리포트 (총점 + 5리스크 카드)
│   ├── RiskDetailPage.tsx            # 개별 리스크 상세
│   ├── ComparePage.tsx               # 두 주소 비교
│   ├── SavedPage.tsx                 # 북마크 리스트
│   └── MyPage.tsx                    # 마이페이지
├── data/mockData.ts                  # 모든 가짜 주소/리포트/리스크 상세/비교 결과
├── services/
│   ├── mockService.ts                # 가짜 지연 + mockData 반환 (실 API 붙기 전 사용)
│   └── api/                          # 자체 백엔드 호출 스켈레톤 (점진 교체 대상)
│       ├── apiClient.ts              # apiRequest<T>() 단일 fetch 래퍼 + ApiError
│       ├── endpoints.ts              # 모든 path 상수 (/api/v1/...)
│       ├── authApi.ts                # login / logout / reissue
│       ├── userApi.ts                # 내 프로필 / weights / settings
│       ├── addressApi.ts             # search / map-search / compare
│       ├── reportApi.ts              # 리포트 생성·상태·분석·리스크 상세
│       ├── bookmarkApi.ts            # 북마크 CRUD
│       └── index.ts                  # 외부 노출 barrel
├── types/domain.ts                   # 단일 도메인 타입 모음 (확장 시 여기부터)
└── styles/
    ├── tokens.css                    # CSS 변수 (색·radius·shadow·frame-width) — 단일 출처
    └── global.css                    # 컴포넌트 스타일 클래스
```

**새 도메인 추가 시 순서**: `src/types/domain.ts`에 타입 추가 → `src/services/api/<name>Api.ts` 작성 → `endpoints.ts`에 path 등록 → `mockService.ts`에 fallback → 페이지에서 사용.

---

## 도메인 핵심 타입 (변경 시 신중히)

[src/types/domain.ts](src/types/domain.ts) 단일 출처:

```ts
UserProfileType   = 'SINGLE' | 'COUPLE' | 'FAMILY'
RiskType          = 'FLOOD' | 'SAFETY' | 'MEDICAL' | 'CONGESTION' | 'NOISE'
Grade             = 'SAFE' | 'NORMAL' | 'CAUTION' | 'DANGER'   // 4단계
ReportTaskStatus  = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED'

Screen = 'onboarding' | 'home' | 'search' | 'map' | 'loading'
       | 'report' | 'detail' | 'compare' | 'saved' | 'my'

interface AddressCandidate { id, roadAddress, detailAddress, dong, gu, lat, lng }
interface RiskScore        { type, label, score(0~100), grade, summary }
interface RiskMetric       { label, value, grade? }
interface RiskDetail       { type, title, score, grade, summary, description,
                              metrics: RiskMetric[], source, trend: number[] }
interface ReportSummary    { reportId, address, profileType, totalScore,
                              totalGrade, analyzedAt, oneLineSummary,
                              risks: RiskScore[] }
interface CompareResult    { left: ReportSummary, right: ReportSummary, recommendation }
interface SavedReport      { report, savedAt, tags: string[] }
```

**주의 — 이 프로젝트의 함정**:
- 점수 단계는 **4단계** (`SAFE`/`NORMAL`/`CAUTION`/`DANGER`). 부모 CLAUDE.md의 3단계(safe/watch/alert)와 다름
- 5번째 리스크는 **`CONGESTION`** (혼잡도). `CROWD` 아님
- 가구 유형은 `SINGLE`/`COUPLE`/`FAMILY` 대문자. soft한 별칭(single/newlywed) 만들지 말 것
- 점수 → 등급 매핑 임계값은 한 곳에 모아둘 것. 현재는 mock 데이터에서 grade를 직접 박아 놓음. 헬퍼 만들 거면 `src/types/domain.ts` 또는 `src/components/ui.tsx` 근처에 단 하나만

---

## 디자인 시스템

**팔레트** ([src/styles/tokens.css](src/styles/tokens.css) — 모든 색·radius·shadow의 단일 출처):
- 메인: `--color-primary #E07856` (코랄), `--color-coral-deep`, `--color-coral-soft`, `--color-coral-tint`
- 텍스트: `--color-ink #1A2540`, `--color-ink-body`, `--color-ink-muted`
- 배경: `--color-bg #FAF7F2` (베이지), `--color-beige`, `--color-line`
- 점수: `--color-safe #3B906E`, `--color-watch #D89A2A`, `--color-alert #D45A4A`
- radius: `--radius-sm/md/lg/xl` (10/16/22/30px)
- shadow: `--shadow-card`, `--shadow-soft`
- 프레임: `--frame-width: clamp(360px, 92vw, 430px)`

**작성 규칙**:
- 인라인 색상/spacing 하드코딩 금지 (`#E07856` 직접 X → `var(--color-primary)`)
- 토큰에 없는 값을 새로 쓰려면 **먼저 `tokens.css`에 변수 추가**, 그 다음 사용
- shadow는 `--shadow-card` / `--shadow-soft` 둘 중 하나 우선
- 라이트 테마 고정. 다크 모드 미지원
- 컴포넌트 스타일은 `src/styles/global.css`에 클래스로 추가 (인라인 스타일은 동적 값에 한해 사용)

---

## 코딩 컨벤션

### TypeScript
- `strict: true`. `any` 금지 (필요하면 `unknown`)
- Props는 **interface**로 정의
- 도메인 타입은 [src/types/domain.ts](src/types/domain.ts)에 모음. feature가 늘어나면 폴더 분할 시점에 사용자에게 확인

### React
- 함수형 컴포넌트
- **export 컨벤션 (현 코드베이스 기준)**:
  - 페이지(`src/pages/**`): named export (`export function HomePage`) — `App.tsx`에서 `{ HomePage }`로 import
  - 공용 컴포넌트(`src/components/**`): named export
  - 진입점(`App.tsx`)만 default export
  - 새 파일 추가 시 이 패턴 따라
- `useEffect` 최소화. 데이터 페칭은 mock/api 함수 → 로컬 state로

### 상태관리
- **로컬 state만** (현재 라이브러리 미설치). 필요해지면 사용자에게 먼저 도입 확인
- 화면 전환은 [App.tsx](src/App.tsx)의 `screen` state. 새 화면 추가 시 `Screen` 유니온에 코드 추가 → `App.tsx` 분기 추가
- 영속 데이터(북마크 등)는 현재 메모리만. localStorage 도입 필요해지면 한 곳(util)에 묶어서 추가

### 파일 네이밍
- 컴포넌트/페이지: `PascalCase.tsx`
- 훅/유틸: `camelCase.ts`
- 상수/엔드포인트: `camelCase` 또는 `UPPER_SNAKE`

---

## 라우팅 패턴 (현재 — 라우터 라이브러리 없음)

[App.tsx](src/App.tsx)에서 `useState<Screen>('onboarding')`으로 화면 관리. 화면 전환은 `navigate(next)` 함수 prop으로 자식에 내려줌:

```ts
const navigate = (next: Screen) => {
  setScreen(next);
  window.scrollTo({ top: 0, behavior: 'smooth' });
};
```

**새 화면 추가 절차**:
1. `Screen` 유니온에 코드 추가 ([src/types/domain.ts](src/types/domain.ts))
2. `src/pages/<Name>Page.tsx` 작성 (named export)
3. `App.tsx`에 `{screen === '<code>' && <NewPage ... />}` 추가
4. 진입점이 탭이면 `bottomNav` 분기 업데이트, [src/components/ui.tsx](src/components/ui.tsx)의 `BottomNav` 항목 확인

URL/딥링크가 필요해지면 그때 라우터 도입 — 그 전엔 단순함 유지.

---

## API 레이어

### 응답 envelope (확정)

모든 응답은 다음 형태:

```jsonc
// 성공 (status 없음 — 표준)
{ "success": true,  "data": <T>,  "error": null }

// 성공 (status 분기 — 비동기/캐시 분기 엔드포인트)
{ "success": true,  "status": "READY",  "data": <T>,  "error": null }

// 실패
{
  "success": false, "status": "ERROR", "data": null,
  "error": { "code": "ERROR_CODE", "message": "...", "details": "개발자용 (옵션)" }
}
```

[apiClient.ts](src/services/api/apiClient.ts)가 두 가지 호출 함수를 제공:

| 함수 | 반환 | 언제 |
|---|---|---|
| `apiRequest<T>(...)` | `T` (= `data`만 unwrap) | 대부분 — `status` 분기 없는 엔드포인트 |
| `apiRequestEnvelope<TEnvelope>(...)` | `{ status, data }` 형태 그대로 | `status`로 분기해야 하는 엔드포인트 (예: POST /reports — READY/PROCESSING) |

`apiRequestEnvelope`은 호출 측이 envelope 모양을 generic 인자로 정의:

```ts
type CreateReportEnvelope =
  | { status: 'READY'; data: ReportReadyData }
  | { status: 'PROCESSING'; data: ReportProcessingData };

const env = await apiRequestEnvelope<CreateReportEnvelope>(path, ...);
if (env.status === 'READY') { /* env.data는 ReportReadyData로 narrowing */ }
```

실패 시 두 함수 모두 `ApiError(message, code, status, details?, payload?)` 던짐. UI 에러 분기는 항상 `code` 기반:

```ts
try { ... } catch (e) {
  if (e instanceof ApiError && e.code === 'OUT_OF_SERVICE_AREA') { ... }
}
```

### 베이스 / 클라이언트
- 베이스 URL: `import.meta.env.VITE_API_ORIGIN` (없으면 `window.location.origin`) — `.env`로 주입
- 베이스 패스: `/api/v1` (`API_BASE_PATH` in [endpoints.ts](src/services/api/endpoints.ts))
- 단일 클라이언트: [apiClient.ts](src/services/api/apiClient.ts)의 `apiRequest<T>(path, { method, body, query, headers, skipAuth? })`. **`fetch` 직접 호출 금지** — 항상 이 래퍼 경유
- 와이어 enum 케이스: 백엔드도 FE 타입과 동일한 **대문자** (`'SINGLE'`, `'FLOOD'`, `'SAFE'`, `'PENDING'` 등). 변환 헬퍼 만들지 말 것

### 인증 흐름 (sessionStorage + 자동 reissue)

토큰 저장은 [tokenStorage.ts](src/services/api/tokenStorage.ts)의 `tokenStorage` 헬퍼만 사용 — `sessionStorage` 직접 호출 금지. 키 prefix `jipchak.*`.

자동 동작:
1. 모든 요청에 access token이 있으면 `Authorization: Bearer <token>` 자동 부착
2. 응답이 401이면 `/auth/reissue`를 한 번 호출해서 새 access token 발급 → **원 요청 1회 자동 재시도**
3. reissue 실패 시 `tokenStorage.clear()` + 원래 401 `ApiError` 던짐
4. 동시 요청이 다 401 받아도 reissue는 in-flight 1개만 (스탬피드 방지)

호출 측은 토큰을 신경 쓸 필요 없음. 토큰 빼고 보내야 하는 호출(`login`, `reissue` 자체)은 `skipAuth: true`.

`authApi.login()` 성공 시 `tokenStorage.set()` 자동 호출, `authApi.logout()`은 서버 호출 후 `tokenStorage.clear()` 자동 호출.

**로그인 화면은 후순위** (현재 미구현). 그 전까지는 토큰 없는 상태로 호출되며 백엔드가 그걸 어떻게 처리할지에 맡김.

### 엔드포인트 카탈로그 (현재)

[src/services/api/endpoints.ts](src/services/api/endpoints.ts) 단일 출처. 새 path는 반드시 여기 등록 후 사용.

```
auth      : POST /auth/login, /auth/logout, /auth/reissue
users     : GET/PATCH /users/myprofile, PATCH /users/weights, GET/PATCH /users/settings
addresses : GET /addresses/search?query=, /addresses/map-search?lat=&lng=,
            /addresses/compare?leftAddressId=&rightAddressId=
reports   : POST /reports                            ← 명세 적용 완료
            GET /reports/status/:taskId              ← 명세 적용 완료
            GET /reports/:reportId/analysis          ← 명세 적용 완료
            GET /reports/:reportId/{flood|security|medical|noise|congestion}  ← 5개 전부 수령
bookmarks : GET /bookmarks/properties                ← 명세 적용 완료
            POST /bookmarks/properties               ← 명세 적용 완료
            DELETE /bookmarks/properties/:id         ← 명세 적용 완료
```

`RiskType` → URL 세그먼트 매핑: [endpoints.ts](src/services/api/endpoints.ts)의 `riskEndpointByType` (`FLOOD→flood`, **`SAFETY→security`** ⚠️, `MEDICAL→medical`, `NOISE→noise`, `CONGESTION→congestion`). 도메인은 `SAFETY`이지만 백엔드 wire/URL은 `security`를 씀.

### 와이어 타입 컨벤션 (현재 정책)

백엔드 와이어는 **snake_case** (`road_addr`, `dong_code`, `report_id`, `total_score`, `analyzed_at`). FE 도메인 모델은 **camelCase** (`reportId`, `totalScore`, `analyzedAt`).

**현재는 변환 안 함**. wire DTO 타입을 snake_case 그대로 [domain.ts](src/types/domain.ts)에 정의하고 호출 측이 받음. 이유: 화면 실연동이 아직이라 비용 없음. 화면 붙이는 시점에 변환 패턴(api 레이어 변환 함수) 도입할지 결정.

### 적용된 명세

#### POST /api/v1/reports — 분석 리포트 생성/조회

- 함수: `reportApi.create(payload)` ([reportApi.ts](src/services/api/reportApi.ts))
- 반환: `Promise<CreateReportEnvelope>` (status 기반 union — `apiRequestEnvelope` 사용)
- request body 필드: `address`(req), `road_addr`(opt), `jibun_addr`(opt), `lat`(req), `lng`(req), `dong_code`(opt), `source`(req: `'SEARCH' | 'MAP'`)
- 응답 분기:
  - `status: 'READY'` → 캐시 HIT, `report_id` 즉시 사용 가능 → `/report/{id}` 이동
  - `status: 'PROCESSING'` → 캐시 MISS, `task_id` + `estimated_seconds` → 폴링 화면으로
- 정의된 에러 코드 ([domain.ts](src/types/domain.ts)의 `CreateReportErrorCode`):

| HTTP | code | 사용자 메시지 처리 가이드 |
|---|---|---|
| 400 | `INVALID_INPUT` | 폼 검증 실패. 주소 다시 입력 안내 |
| 400 | `INVALID_LOCATION` | 좌표 이상. 지도 다시 선택 안내 |
| 400 | `OUT_OF_SERVICE_AREA` | "서울시 내 주소만 분석 가능" 안내 (서비스 가드레일) |
| 401 | `INVALID_TOKEN` | 자동 reissue → 실패 시 로그인 유도 (apiClient가 reissue 1회 시도) |
| 500 | `EXTERNAL_API_ERROR` | "잠시 후 다시 시도" + 재시도 버튼 |
| 500 | `ANALYSIS_FAILED` | 동일 처리 |

#### GET /api/v1/reports/status/{task_id} — 분석 진행 상황 폴링

- 함수: `reportApi.getStatus(taskId)` ([reportApi.ts](src/services/api/reportApi.ts))
- 반환: `Promise<ReportStatusEnvelope>` (status 기반 union — `apiRequestEnvelope` 사용)
- 응답 분기:
  - `status: 'PROCESSING'` → `progress`(0-100) + `current_step`(한국어 그대로) + `completed_steps[]`(한국어 그대로) + `estimated_remaining_seconds`. 폴링 계속
  - `status: 'COMPLETED'` → `report_id` 발급 → `getAnalysis(report_id)` 호출로 전환
  - `status: 'FAILED'` → envelope-level `success=false`로 옴. **`ApiError`로 던져짐**, 호출 측이 catch
- **Rate limit: 분당 10회** (`TOO_MANY_REQUESTS` 시 429). 폴링 정책은 [LoadingPage](src/pages/LoadingPage.tsx) 실연동 시 결정 — 6초 균등 / 1.5~2초 + 429 백오프 / `estimated_remaining_seconds` 따라가기 등
- 정의된 에러 코드 ([domain.ts](src/types/domain.ts)의 `ReportStatusErrorCode`):

| HTTP | code | 사용자 메시지 처리 가이드 |
|---|---|---|
| 400 | `INVALID_INPUT` | 입력값 누락 (보통 발생 안 함, task_id 외 query 추가될 경우) |
| 400 | `INVALID_COORDINATES` | 좌표 범위 오류 |
| 400 | `OUT_OF_SERVICE_AREA` | "서울시 내 주소만 분석 가능" |
| 401 | `UNAUTHORIZED` | 자동 reissue → 실패 시 로그인 유도 |
| 404 | `TASK_NOT_FOUND` | 잘못된/만료된 task_id. 폴링 중단 + 새 분석 유도 |
| 429 | `TOO_MANY_REQUESTS` | 폴링 너무 빠름. 백오프 후 재시도 |
| 500 | `EXTERNAL_API_ERROR` | "잠시 후 다시 시도" |
| 500 | `ANALYSIS_FAILED` | 분석 자체 실패. 새 분석 유도 |

#### GET /api/v1/reports/{reportId}/analysis — 종합 분석 리포트 조회

- 함수: `reportApi.getAnalysis(reportId)` ([reportApi.ts](src/services/api/reportApi.ts))
- 반환: `Promise<AnalysisReport>` (표준 envelope — `apiRequest` 사용)
- 응답 모양:
  - `report_id` (number), `address`, `dong_code`, `total_score`, `grade`(한국어), `summary`(한국어 한 줄)
  - `score_source: { base_score_cached, weight_applied }` — 점수 출처 메타
  - `categories[]` — 5개 (`flood` / `security` / `medical` / `noise` / `congestion`). 각 항목: `type`(wire lowercase) / `title`(한국어) / `score` / `grade`(한국어) / `summary`
  - `saved` — 북마크 여부 (UI 토글에 직접 사용)
- 정의된 에러 코드 ([domain.ts](src/types/domain.ts)의 `AnalysisErrorCode`):

| HTTP | code | 사용자 메시지 처리 가이드 |
|---|---|---|
| 400 | `INVALID_INPUT` | reportId 형식 오류 |
| 401 | `INVALID_TOKEN` | 자동 reissue 시도 (apiClient) |
| 401 | `EXPIRED_TOKEN` | 자동 reissue 시도 (apiClient) |
| 403 | `FORBIDDEN_REPORT` | "이 리포트에 접근할 권한이 없습니다" |
| 404 | `REPORT_NOT_FOUND` | "리포트를 찾을 수 없습니다" + 홈으로 |
| 404 | `REGION_DATA_NOT_FOUND` | 지역 원천 데이터 없음. 새 분석 유도 |
| 500 | `EXTERNAL_API_ERROR` | "잠시 후 다시 시도" |
| 500 | `ANALYSIS_FAILED` | 동일 처리 |
| 500 | `INTERNAL_SERVER_ERROR` | 동일 처리 |

#### GET /api/v1/reports/{reportId}/{flood|security|medical|noise|congestion} — 카테고리별 리스크 상세

**5개 카테고리 전부 수령**. 카테고리별 응답 모양이 의외로 자유로움:
- `map`: 혼잡(congestion)엔 **없음** → `RiskDetailResponse.map?` 옵셔널
- `map`의 마커 키: 침수/치안/소음은 `risk_factors`, 의료는 `facilities`
- `chart`: 혼잡에만 있음 (시간대별 차트) → `RiskDetailResponse.chart?` 옵셔널
- `region_code`: 의료/혼잡에만 명시 (다른 카테고리에서도 옴 가능) → 옵셔널

화면 측 패턴:
```ts
const detail = await reportApi.getRiskDetail(reportId, riskType);
const markers = detail.map?.risk_factors ?? detail.map?.facilities ?? [];
if (detail.chart) { /* 차트 렌더링 (혼잡) */ }
if (detail.map)   { /* 지도 렌더링 (그 외 4개) */ }
```

- 함수: `reportApi.getRiskDetail(reportId, riskType)` ([reportApi.ts](src/services/api/reportApi.ts))
- 반환: `Promise<RiskDetailResponse>` (표준 envelope — `apiRequest` 사용)
- `riskType`은 도메인 `RiskType`(대문자) 받아서 [endpoints.ts](src/services/api/endpoints.ts)의 `riskEndpointByType`이 URL 세그먼트로 변환
- 응답 모양:
  - 헤더: `report_id`(number), `address`, `category`(wire lowercase), `title`(한국어), `score`, `base_score`, `grade`(한국어), `summary`
  - `indicators[]` — 정적 지표. `{ name, value, status }` 모두 한국어/단위 포함 문자열. **`value`는 `"12.4m"`/`"0건"`/`"8%"`처럼 표시 전용** (정렬/계산 불가)
  - `map: { lat, lng, risk_factors[] }` — 지도 데이터. `risk_factors[]`는 `{ type(대문자 enum), name(한국어), distance(단위 문자열) }`
  - `data_source: { type: 'STATIC' | 'CACHE' | 'DYNAMIC', description(한국어) }`
- 에러 코드: analysis와 동일 9개 ([domain.ts](src/types/domain.ts)의 `RiskDetailErrorCode = AnalysisErrorCode`)

**지도 마커 배열 키 이름이 카테고리마다 다름**:
- 침수/치안: `map.risk_factors[]`
- 의료: `map.facilities[]`
- 화면 측 패턴: `map.risk_factors ?? map.facilities ?? []`로 통합 처리

**마커 `type` enum은 카테고리마다 다름** (FE 측 union: `RiskFactorType`):
- 침수(flood): `'LOWLAND' | 'RIVER'` — 위험 요인
- 치안(security): `'CCTV' | 'STREET_LIGHT'` — 안전 인프라
- 의료(medical): `'CLINIC' | 'PHARMACY' | 'EMERGENCY_CENTER'` — 의료 시설
- 소음(noise): `'ROAD' | 'COMMERCIAL_AREA'` — 소음원
- 혼잡(congestion): map 없음 (대신 chart)
- 새 값은 `string & {}` fallback으로 자동 허용

**`region_code`(행정동/법정동 코드)** — 의료 명세에만 명시적으로 등장. 다른 카테고리에서도 올 수 있어 옵셔널 처리.

**`data_source.type`도 합성값 등장**:
- 침수(flood): `'STATIC'`
- 치안(security): `'STATIC_CACHE'`
- 의료(medical): `'STATIC'`
- 소음(noise): `'STATIC_DYNAMIC'`
- 혼잡(congestion): `'CACHE'`
- 새 값은 `string & {}` fallback

**`chart` 차트 데이터** (혼잡 전용):
- `base_date_type`: 기준 패턴 (예: `'MONDAY_AVERAGE'`) — 새 패턴 추가 가능, `string & {}` fallback
- `labels`/`values`: X/Y축 (`["06시", ...]`, `[55, 88, ...]`) — `values`는 number 배열
- `unit`: 명세표엔 있으나 sample 누락 → 옵셔널
- `cached`: 캐시 사용 여부

**`indicators[].status`는 nullable**: 등급 없는 정보 지표 (예: "5대 범죄 발생: 140건")는 `null`로 옴.

**`indicators[].value`는 자유 형식 문자열**: `"12.4m"`, `"0건"`, `"8%"`, `"42대 / 반경 500m"`, `"9/25"` — 단위/조합 자유. 정렬·계산 불가, 표시 전용.

#### GET /api/v1/bookmarks/properties — 저장 매물 목록

- 함수: `bookmarkApi.getProperties(params?)` ([bookmarkApi.ts](src/services/api/bookmarkApi.ts))
- 반환: `Promise<BookmarkPropertiesResponse>` (표준 envelope)
- query params (모두 옵셔널, 백엔드 default 적용):
  - `status`: `'ALL' | 'SAFE' | 'CAUTION' | 'RISK'` (default `'ALL'`) — 필터 탭
  - `page`: number (default 1)
  - `size`: number (default 10)
- 응답 모양:
  - `filter_counts: { total_cnt, safe_cnt, caution_cnt, risk_cnt }` — 필터 탭별 카운트 (UI 뱃지)
  - `content: BookmarkProperty[]` — 매물 목록
  - `page` / `size` / `total_elements` — Spring Page 형태 페이지네이션 메타
- `BookmarkProperty` 구조:
  - `property_id`, `report_id` — **string으로 통일 적용** (명세는 integer지만 ID 통일 합의)
  - `address`, `description`(위치/접근성 한 줄)
  - `score`, `grade`(한국어 표시용), **`score_status`** (`'SAFE'|'CAUTION'|'RISK'` 분기용 영어 코드)
  - `tags: string[]`, `bookmarked: boolean`
  - `saved_at`: `"2026-05-04T15:00:00"` (Z 없음 — 분석 endpoint와 형식 다름)
- 주의: `score_status`는 **3단계**(SAFE/CAUTION/RISK)인데 도메인 `Grade`는 **4단계**(SAFE/NORMAL/CAUTION/DANGER) — 매핑 시 불일치

#### POST /api/v1/bookmarks/properties — 매물 북마크 저장

- 함수: `bookmarkApi.saveProperty(payload)` ([bookmarkApi.ts](src/services/api/bookmarkApi.ts))
- 반환: `Promise<SavePropertyResponse>` (표준 envelope)
- 요청 body: `{ property_id: string (필수), report_id?: string (옵셔널) }` — wire snake_case
- 응답: `{ property_id, report_id, bookmarked }` — 토글 결과만, 매물 상세 없음. 화면이 매물 정보 알고 있어야 호출 가능, 또는 호출 후 `getProperties` 재호출
- 정의된 에러 코드: `'PROPERTY_ALREADY_BOOKMARKED'` 단 1개 (명세 누락 — 표준 401/404/500은 명세 갱신 후 추가)

#### DELETE /api/v1/bookmarks/properties/{id} — 매물 북마크 해제

- 함수: `bookmarkApi.deleteProperty(id)` ([bookmarkApi.ts](src/services/api/bookmarkApi.ts))
- 반환: `Promise<DeletePropertyResponse>` (`{ property_id, bookmarked: false }` — 토글 결과만)
- path param `id`는 `property_id` (저장 해제할 매물 ID)
- ⚠️ 기존 시그니처 `Promise<void>`에서 변경됨 — 호출 측에서 응답 받으면 낙관적 업데이트 확정에 활용 가능
- 정의된 에러 코드: `'PROPERTY_NOT_BOOKMARKED'` 단 1개 (명세 누락 동일)

---

### ⚠️ 백엔드 명세 불일치 모음

#### ✅ 합의/해결된 것 (사용자 결정)
- **`report_id` 타입**: **string(UUID)로 통일**. FE도 모든 위치에서 `string` 사용 ([domain.ts](src/types/domain.ts)의 `AnalysisReport.report_id`, `RiskDetailResponse.report_id`)
- **risk type 명칭 (URL/wire)**: **`security` 유지** (백엔드 그대로). 도메인 `RiskType.SAFETY` ↔ wire `security`는 [endpoints.ts](src/services/api/endpoints.ts)의 `riskEndpointByType`이 매핑. *(직전에 `safety`로 통일하기로 합의했다가 백엔드 미반영 확인 후 되돌림)*
- **입력값 오류 코드**: **`INVALID_INPUT`**으로 통일하기로 했지만 백엔드 명세서는 여전히 `INVALID_INPUT_VALUE` — 실제 백엔드 구현 따라 다시 결정 필요 (아래 항목 참고)
- **status 명세 sample 경로 오타**: `/api/v1/analysis/status/...` → 모두 `/api/v1/`로 정규화. [endpoints.ts](src/services/api/endpoints.ts)는 이미 정상 경로(`/api/v1/reports/status/...`)로 잡혀 있음

#### 🔄 보류 — 백엔드 실 구현 확인 필요
- **`INVALID_INPUT` vs `INVALID_INPUT_VALUE`**: FE는 현재 `INVALID_INPUT`으로 적용([domain.ts](src/types/domain.ts)의 `CreateReportErrorCode`/`AnalysisErrorCode`). 백엔드 실 구현이 어느 쪽인지 확인 후 맞춰야 함. 다르면 FE 되돌리기
- **지도 마커 배열 키 이름 통일**: 카테고리별로 `risk_factors`(침수/치안/소음) vs `facilities`(의료)로 다름. 의미상 자연스럽긴 한데 FE는 통합 처리 필요. 백엔드 입장에서 `markers` 같은 중립 키로 통일하면 깔끔. 우선순위 낮음
- **`region_code` 응답 누락**: 의료 명세에만 명시. 다른 카테고리도 같은 값 보내는지 명세 갱신 또는 응답 확인 필요
- **소음 명세표 작성 오류**: 명세표에 `data_standard String`으로 적혀 있으나 sample은 다른 카테고리와 동일한 `data_source: { type, description }` 객체. `base_score` 필드도 명세표 누락. → sample이 진실로 가정. FE 타입 그대로 유지. 명세서 갱신 필요
- **북마크 명세 ID 모순**: 명세는 `property_id`/`report_id`를 integer로 정의. FE는 합의 우선(`string`)으로 적용. 백엔드 실 구현 따라 결정 (명세서 갱신 또는 FE 되돌리기)
- **`score_status` 3단계 vs `Grade` 4단계**: 백엔드가 북마크 명세에서 `score_status: 'SAFE'|'CAUTION'|'RISK'` 영어 분기 코드 자발적 추가 — 이전 보류 항목 #6(grade 한국어) 부분 해결. 단 도메인 `Grade`(SAFE/NORMAL/CAUTION/DANGER)와 단계 수 다름. 화면 매핑 시 NORMAL/DANGER 처리 정책 결정 필요
- **POST/DELETE /bookmarks/properties 명세 부실**:
  - request/response의 ID 타입 표기가 `uuid` / `integer`로 자가모순 (FE는 합의대로 `string` 적용)
  - 에러 코드 표 통째 누락. POST는 `PROPERTY_ALREADY_BOOKMARKED`, DELETE는 `PROPERTY_NOT_BOOKMARKED` 한 개씩만 sample에 등장. 표준 401/404/500은 명세 갱신 필요
  - `property_id` 출처 불명 — 분석 endpoint(`AnalysisReport`)는 `report_id`만 반환하는데 POST에선 `property_id` 필수. 매물 등록 별도 endpoint가 있는지 또는 명세 모순인지 백엔드 흐름 확인 필요

#### 🔄 남은 협의 항목

**좌표/위치 오류 코드 통일**:
- POST /reports: `INVALID_LOCATION`
- GET status: `INVALID_COORDINATES`
→ 같은 의미니 한쪽으로 통일 권장. UI 분기는 일단 둘 다 처리

**401 코드 셋이 엔드포인트마다 다름**:
- POST /reports: `INVALID_TOKEN`
- GET status: `UNAUTHORIZED`
- GET analysis / risk detail: `INVALID_TOKEN` + `EXPIRED_TOKEN`
→ apiClient가 HTTP 401 보고 reissue 시도하므로 동작은 OK. 코드명만 협의 사안

**`grade`가 한국어 문자열로 옴**:
- 도메인 `Grade = 'SAFE' | 'NORMAL' | 'CAUTION' | 'DANGER'` (영어 코드)
- wire는 `"안심" | "양호" | "주의"` (한국어)
- 화면 등급별 색깔/아이콘 분기는 enum 코드가 더 안정적 — 한국어 문자열 비교는 오타·표기 변경에 약함
- 옵션 (사용자 결정 필요):
  - **A.** 백엔드가 `grade_code: "SAFE"` + `grade_label: "안심"` 두 필드로 분리해서 보냄 (분기는 코드, 표시는 라벨)
  - **B.** FE가 매핑 테이블 만들어서 처리 (`{"안심": "SAFE", "양호": "NORMAL", ...}`)

**정량 데이터가 단위 포함 문자열**:
- `indicators[].value` (`"12.4m"`, `"0건"`, `"8%"`), `risk_factors[].distance` (`"250m"`)
- 정렬·계산·차트 그릴 때 못 씀
- 차트/정렬 필요해지면 백엔드에 별도 numeric 필드(예: `value_raw: 12.4`, `unit: "m"`) 요청

**enum 케이싱이 한 응답 안에서도 섞임**:
같은 JSON 안에서 케이싱 패턴이 일관되지 않음 — 무슨 의미냐면, 응답 하나에서:

```json
{
  "status": "READY",                ← 대문자
  "data": {
    "category": "flood",            ← 소문자
    "grade": "안심",                ← 한국어
    "data_source": {
      "type": "STATIC"              ← 대문자
    },
    "map": {
      "risk_factors": [
        { "type": "LOWLAND" }       ← 대문자
      ]
    }
  }
}
```

이렇게 enum 케이싱이 4가지 패턴(대문자 / 소문자 / 한국어 / URL slug)으로 섞여 있음. FE는 그냥 받아쓰면 되니까 동작상 문제 없는데, 백엔드 컨벤션이 들쑥날쑥하다는 신호. 우선순위 낮음 — 기능 다 붙고 나서 백엔드 리팩터 시점에 통일 제안 정도.

→ FE는 도메인용 `RiskType`(대문자)과 wire용 `RiskTypeWire`(소문자) 둘 다 [domain.ts](src/types/domain.ts)에 둠. 화면 실연동 시점에 변환 헬퍼 도입 결정.

**다른 4개 카테고리(safety/medical/noise/congestion) 명세**:
침수와 동일 구조 가정 중. 각자 `risk_factors[].type` enum 값 다를 것 — 명세 받는 대로 `RiskFactorType` union 확장.

### Mock ↔ 실 API 점진 교체 정책 (현재 채택)

- 명세 받은 feature만 실 API로 갈아끼움. 나머지는 [mockService.ts](src/services/mockService.ts) 그대로
- 한 화면 안에 mock + 실 API 혼재 가능 — OK
- 실 API 도입 시 mock 함수 **삭제하지 말고** 그대로 두기 (오프라인 데모/스토리북 용도). 화면이 어느 쪽을 부르는지로 판단

---

## 자주 쓰는 명령어

```powershell
npm install                  # 의존성
npm run dev                  # Vite 개발 서버 (--host 0.0.0.0 → LAN에서도 접근 가능)
npm run build                # tsc --noEmit 후 vite build
npm run preview              # 빌드 결과 로컬 프리뷰
```

**없는 것**: 테스트 스크립트, 린트 스크립트, 포맷터 스크립트. 도입 전엔 사용자에게 확인.
타입 체크는 `npm run build` 안에 포함된 `tsc --noEmit`이 유일.

---

## 작업 원칙 (DO)

1. **먼저 읽기**: 변경 전 해당 페이지 + 사용 컴포넌트 + `tokens.css` 빠르게 훑기
2. **mock 데이터 형태 유지**: 실 API 붙기 전엔 [src/data/mockData.ts](src/data/mockData.ts) 형태에 맞춰 작업. 나중에 호출 함수만 갈아끼우는 구조 유지
3. **점수 표시는 재사용**: `ScorePill`(ui.tsx) / `ScoreGauge` / `RiskChart`. 비슷한 거 새로 만들지 말 것
4. **CSS 변수 우선**: 토큰에 없는 값이 필요하면 먼저 `tokens.css`에 추가 후 사용
5. **작은 commit**: feat/fix/refactor/chore 한 논리 단위씩
6. **UI 변경은 브라우저 확인**: `npm run dev` 띄우고 실제 화면 본 뒤 완료 처리

---

## 절대 하지 말 것 (DON'T)

- ❌ **부모 CLAUDE.md(야수의 심장)의 명세를 이 프로젝트에 적용** — 다른 앱이다 (Expo/RN 아님)
- ❌ **거래 리스크 기능 추가** — 전세사기·권리관계·임대인 검증·시세 비교는 이 앱 영역 아님
- ❌ **5리스크 외 새 카테고리 추가하기 전에 사용자 확인 없이 진행** — `RiskType` 유니온 임의 확장 금지
- ❌ **미설치 라이브러리 가정** — Expo, React Native, NativeWind, Tailwind, Zustand, TanStack Query, Firebase 등 코드에 import하기 전에 확인
- ❌ **공공 API 키를 클라이언트에 노출** (`VITE_*` 접두어 포함, Vite는 `import.meta.env.VITE_*`만 클라이언트에 번들) — 서버 경유
- ❌ **`fetch` 직접 호출** — 항상 [apiClient.ts](src/services/api/apiClient.ts)의 `apiRequest` 경유 (envelope unwrap + 토큰 자동 부착 + 401 reissue 다 들어 있음)
- ❌ **endpoints.ts 우회** — 새 path는 반드시 [endpoints.ts](src/services/api/endpoints.ts)에 등록 후 `<name>Api.ts`에서 사용
- ❌ **`sessionStorage` 직접 호출 (토큰 키)** — [tokenStorage.ts](src/services/api/tokenStorage.ts)의 `tokenStorage.{getAccess,getRefresh,set,clear}`만 사용
- ❌ **API 에러를 `instanceof Error`로만 분기** — `ApiError` 인스턴스 + `code` 기반 분기. envelope의 `error.code`가 1급 시그널
- ❌ **응답에서 `success`/`data`/`error` 필드 직접 다루기** — `apiRequest<T>`가 unwrap 다 해주므로 호출 측은 `T`만 받음
- ❌ **`status` 분기 엔드포인트에 `apiRequest` 사용** — `status`가 사라짐. `apiRequestEnvelope<TEnvelope>` 사용
- ❌ **wire DTO를 임의로 camelCase로 정의** — 백엔드 와이어가 snake_case면 타입도 snake_case 그대로. 변환 도입 시점은 화면 실연동 시 사용자와 합의
- ❌ **점수 임계값을 여러 곳에서 정의** — 단일 출처 유지
- ❌ **인라인 색상/spacing 하드코딩** (`#E07856` 등) — `var(--color-primary)` 또는 토큰 추가 후 사용
- ❌ **다크 모드 스타일 추가** — 라이트 고정
- ❌ **`console.log` 남기기** (디버그 후 제거)
- ❌ **react-router 등 라우팅 라이브러리 임의 도입** — 화면 전환은 `App.tsx`의 `screen` state로 충분. URL이 필요해지면 사용자와 먼저 합의

---

## 환경 / 외부 자료

- 환경 변수 (예정): `.env`에 `VITE_API_ORIGIN=https://...` 형태로. `import.meta.env`로 접근. `.env` 자체는 gitignore
- Vite env: https://vitejs.dev/guide/env-and-mode
- React 18: https://react.dev/
- lucide-react: https://lucide.dev/

---

## 작업 시작 템플릿

```
[목표]: 예) 리포트 페이지에 metric 비교 섹션 추가

[관련 파일]:
- src/pages/ReportPage.tsx
- src/components/RiskChart.tsx
- src/types/domain.ts (필요 시 타입 확장)

[작업 시작 전]:
1. plan으로 변경 범위 검토
2. mock 데이터 구조에 맞는지 확인 (src/data/mockData.ts)
3. 새 토큰 필요하면 src/styles/tokens.css 먼저 업데이트
4. npm run dev 띄워서 브라우저 확인
```
