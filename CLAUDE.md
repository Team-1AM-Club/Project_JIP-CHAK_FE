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

모든 응답은 다음 두 형태 중 하나로 옴. raw JSON 아님:

```jsonc
// 성공
{ "success": true,  "data": <T>,  "error": null }

// 실패
{ "success": false, "data": null, "error": { "code": "ERROR_CODE", "message": "..." } }
```

[apiClient.ts](src/services/api/apiClient.ts)가 자동으로:
- 성공이면 `data`만 unwrap해서 반환
- 실패면 `ApiError(message, code, status, payload)` 던짐

화면/queries 레이어는 envelope을 직접 보지 않음. UI 에러 분기는 항상 `error.code` 기반:
```ts
try { ... } catch (e) {
  if (e instanceof ApiError && e.code === 'AUTH_INVALID') { ... }
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
reports   : POST /reports, GET /reports/status/:taskId,
            GET /reports/:reportId/analysis,
            GET /reports/:reportId/{flood|security|medical|noise|congestion}
bookmarks : GET/POST /bookmarks/properties, DELETE /bookmarks/properties/:id
```

`RiskType` → URL 세그먼트 매핑: [endpoints.ts](src/services/api/endpoints.ts)의 `riskEndpointByType` (예: `SAFETY` → `security`).

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
