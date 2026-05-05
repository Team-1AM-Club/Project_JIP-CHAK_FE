export type UserProfileType = 'SINGLE' | 'COUPLE' | 'FAMILY';

/** 도메인 모델용 (대문자). UI/state 내부에서 사용. */
export type RiskType = 'FLOOD' | 'SAFETY' | 'MEDICAL' | 'CONGESTION' | 'NOISE';

/** wire용 (백엔드가 lowercase로 응답). 야간 안전은 'safety'가 아니라 'security'. */
export type RiskTypeWire = 'flood' | 'security' | 'medical' | 'noise' | 'congestion';

export type Grade = 'SAFE' | 'NORMAL' | 'CAUTION' | 'DANGER';

export interface AddressCandidate {
  id: string;
  roadAddress: string;
  detailAddress: string;
  dong: string;
  gu: string;
  lat: number;
  lng: number;
}

export interface RiskScore {
  type: RiskType;
  label: string;
  score: number;
  grade: Grade;
  summary: string;
}

export interface RiskMetric {
  label: string;
  value: string;
  grade?: Grade;
}

export interface RiskDetail {
  type: RiskType;
  title: string;
  score: number;
  grade: Grade;
  summary: string;
  description: string;
  metrics: RiskMetric[];
  source: string;
  trend: number[];
}

export interface ReportSummary {
  reportId: string;
  address: AddressCandidate;
  profileType: UserProfileType;
  totalScore: number;
  totalGrade: Grade;
  analyzedAt: string;
  oneLineSummary: string;
  risks: RiskScore[];
}

/** GET /api/v1/reports/{reportId}/analysis — 점수 출처 메타 */
export interface ScoreSource {
  base_score_cached: boolean;
  weight_applied: boolean;
}

/** GET /api/v1/reports/{reportId}/analysis — 카테고리별 요약 점수 */
export interface AnalysisCategory {
  type: RiskTypeWire;
  /** "침수 리스크" 등 한국어 그대로 표시 */
  title: string;
  /** 0-100 */
  score: number;
  /** "안심" | "양호" | "주의" 등 한국어. 도메인 Grade와 매핑 필요 */
  grade: string;
  summary: string;
}

/** GET /api/v1/reports/{reportId}/analysis — 종합 분석 리포트 응답. */
export interface AnalysisReport {
  /** UUID string (백엔드와 string 통일 합의됨) */
  report_id: string;
  address: string;
  dong_code: string;
  total_score: number;
  /** 한국어 종합 등급 ("양호" 등) */
  grade: string;
  /** AI/템플릿 기반 종합 요약 (한 줄) */
  summary: string;
  score_source: ScoreSource;
  categories: AnalysisCategory[];
  /** 북마크 여부 */
  saved: boolean;
}

/** GET /api/v1/reports/{reportId}/analysis — 정의된 에러 코드 (UI 분기용) */
export type AnalysisErrorCode =
  | 'INVALID_INPUT'
  | 'INVALID_TOKEN'
  | 'EXPIRED_TOKEN'
  | 'FORBIDDEN_REPORT'
  | 'REPORT_NOT_FOUND'
  | 'REGION_DATA_NOT_FOUND'
  | 'EXTERNAL_API_ERROR'
  | 'ANALYSIS_FAILED'
  | 'INTERNAL_SERVER_ERROR';

/**
 * GET /api/v1/reports/{reportId}/{flood|security|medical|noise|congestion}
 * — 지도 마커 type. 카테고리마다 다른 enum이 올 수 있어 string fallback.
 *
 * 침수(flood): 'LOWLAND' | 'RIVER' (위험 요인)
 * 치안(security): 'CCTV' | 'STREET_LIGHT' (안전 인프라)
 * 의료(medical): 'CLINIC' | 'PHARMACY' | 'EMERGENCY_CENTER' (의료 시설)
 * 소음(noise): 'ROAD' | 'COMMERCIAL_AREA' (소음원)
 *
 * 이름이 'RiskFactorType'이지만 안전 인프라/시설도 포함 — 백엔드 응답 키도
 * `risk_factors` 또는 `facilities`로 카테고리마다 다름. 의미보다 모양 기준 재사용.
 */
export type RiskFactorType =
  | 'LOWLAND'
  | 'RIVER'
  | 'CCTV'
  | 'STREET_LIGHT'
  | 'CLINIC'
  | 'PHARMACY'
  | 'EMERGENCY_CENTER'
  | 'ROAD'
  | 'COMMERCIAL_AREA'
  | (string & {});

/**
 * GET .../{risk} — 데이터 출처 계층.
 * 카테고리마다 합성값 추가 가능 → string fallback.
 *
 * 단순값: 'STATIC' | 'CACHE' | 'DYNAMIC'
 * 합성값: 'STATIC_CACHE' (치안), 'STATIC_DYNAMIC' (소음)
 */
export type DataSourceType =
  | 'STATIC'
  | 'CACHE'
  | 'DYNAMIC'
  | 'STATIC_CACHE'
  | 'STATIC_DYNAMIC'
  | (string & {});

/** GET .../{risk} — 정적 지표 (DB) */
export interface RiskIndicator {
  /** 한국어 그대로 (예: "해발 고도", "5년 침수 이력", "5대 범죄 발생") */
  name: string;
  /**
   * 단위 포함 자유 형식 문자열, 표시 전용.
   * 예: "12.4m", "0건", "8%", "42대 / 반경 500m", "9/25"
   * — 정렬/계산 불가
   */
  value: string;
  /**
   * 한국어 등급 (예: "안심", "양호", "주의") 또는 null.
   * 정보 전달용 지표(예: "5대 범죄 발생: 140건")는 등급 없이 null로 옴.
   */
  status: string | null;
}

/** GET .../{risk} — 지도 마커 (위험 요인 / 안전 인프라 / 의료 시설 공통 모양) */
export interface RiskFactor {
  type: RiskFactorType;
  /** 한국어 (예: "저지대 구간", "망원365약국") */
  name: string;
  /** 단위 포함 문자열 (예: "250m", "3.8km") — 정렬/계산 불가 */
  distance: string;
}

/**
 * GET .../{risk} — 지도 데이터.
 * 카테고리마다 마커 배열의 키 이름이 다름 (백엔드 정의):
 * - 침수/치안: `risk_factors`
 * - 의료: `facilities`
 * - 다른 카테고리는 명세 받는 대로 둘 중 하나 또는 새 키 등장 가능
 *
 * 화면 측 패턴: `map.risk_factors ?? map.facilities ?? []`
 */
export interface RiskDetailMap {
  lat: number;
  lng: number;
  /** 침수(flood), 치안(security) */
  risk_factors?: RiskFactor[];
  /** 의료(medical) */
  facilities?: RiskFactor[];
}

/** GET .../{risk} — 데이터 출처 */
export interface RiskDataSource {
  type: DataSourceType;
  /** 한국어 설명 */
  description: string;
}

/**
 * GET .../{risk} — 차트 기준 요일/패턴.
 * 혼잡(congestion): 'MONDAY_AVERAGE' (월요일 평균 등)
 * 다른 패턴 추가 가능 → string fallback
 */
export type BaseDateType = 'MONDAY_AVERAGE' | (string & {});

/**
 * GET .../{risk} — 시간대별 차트 데이터.
 * 혼잡(congestion)에만 등장. 다른 카테고리에 추가될 수도 있어 일반화된 이름.
 */
export interface RiskDetailChart {
  base_date_type: BaseDateType;
  /** X축 라벨 (예: ["06시", "09시", ...]) */
  labels: string[];
  /** Y축 값 (예: [55, 88, 61, ...]) */
  values: number[];
  /**
   * 차트 값 단위 (명세표엔 있으나 sample엔 없음 — 옵셔널 처리).
   * 예: "명/100m²" 같은 형식이 올 수도 있고 생략될 수도 있음.
   */
  unit?: string;
  /** 캐시 데이터 사용 여부 */
  cached: boolean;
}

/**
 * GET /api/v1/reports/{reportId}/{flood|security|medical|noise|congestion}
 * — 카테고리별 리스크 상세 응답.
 *
 * 명세는 침수(flood)만 수령. 다른 4개 카테고리도 동일 구조 가정.
 * 실제로 다르면 카테고리별 타입으로 분리.
 */
export interface RiskDetailResponse {
  /** UUID string (백엔드와 string 통일 합의됨) */
  report_id: string;
  address: string;
  /**
   * 행정동/법정동 코드 (예: "1144012300").
   * 명세상 의료(medical)에만 등장하지만, 다른 카테고리에서도 올 수 있어 옵셔널.
   */
  region_code?: string;
  /** wire lowercase — RiskTypeWire와 일치 */
  category: RiskTypeWire;
  /** 한국어 (예: "침수 리스크") */
  title: string;
  /** 사용자 가중치 반영 점수 (0-100) */
  score: number;
  /** 지역 기본 점수 (가중치 미반영, 0-100) */
  base_score: number;
  /** 한국어 등급 (예: "안심") */
  grade: string;
  summary: string;
  indicators: RiskIndicator[];
  /**
   * 지도 데이터. 혼잡(congestion) 카테고리는 지도 없이 차트만 옴 → 옵셔널.
   */
  map?: RiskDetailMap;
  /**
   * 시간대별 차트 데이터. 현재 혼잡(congestion)에만 등장.
   * 다른 카테고리에서도 추가될 수 있어 옵셔널.
   */
  chart?: RiskDetailChart;
  data_source: RiskDataSource;
}

/** GET /api/v1/reports/{reportId}/{risk} — 정의된 에러 코드 (analysis와 동일) */
export type RiskDetailErrorCode = AnalysisErrorCode;

export interface CompareResult {
  left: ReportSummary;
  right: ReportSummary;
  recommendation: string;
}

export interface SavedReport {
  report: ReportSummary;
  savedAt: string;
  tags: string[];
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthTokenResponse {
  accessToken: string;
  refreshToken?: string;
}

export interface UserProfile {
  id: string;
  nickname: string;
  profileType: UserProfileType;
}

export interface UserSettings {
  notificationsEnabled: boolean;
  darkMode: 'SYSTEM' | 'LIGHT' | 'DARK';
}

/** POST /api/v1/reports — request body (wire format, snake_case) */
export interface CreateReportRequest {
  /** 대표 주소 */
  address: string;
  /** 도로명 주소 */
  road_addr?: string;
  /** 지번 주소 */
  jibun_addr?: string;
  lat: number;
  lng: number;
  /** 행정동 코드 (있으면 전달, 없으면 백엔드가 lat/lng로 추정) */
  dong_code?: string;
  /** 진입 경로 */
  source: 'SEARCH' | 'MAP';
}

/** POST /api/v1/reports — 캐시 HIT (status: 'READY') */
export interface ReportReadyData {
  report_id: string;
  dong_code: string;
  dong_name: string;
  address: string;
  total_score: number;
  cached: true;
  /** ISO 8601 */
  analyzed_at: string;
}

/** POST /api/v1/reports — 캐시 MISS (status: 'PROCESSING') */
export interface ReportProcessingData {
  task_id: string;
  dong_code: string;
  dong_name: string;
  address: string;
  estimated_seconds: number;
  cached: false;
}

/** POST /api/v1/reports — 응답 envelope (status 기반 union) */
export type CreateReportEnvelope =
  | { status: 'READY'; data: ReportReadyData }
  | { status: 'PROCESSING'; data: ReportProcessingData };

/** POST /api/v1/reports — 정의된 에러 코드 (UI 분기용) */
export type CreateReportErrorCode =
  | 'INVALID_INPUT'
  | 'INVALID_LOCATION'
  | 'OUT_OF_SERVICE_AREA'
  | 'INVALID_TOKEN'
  | 'EXTERNAL_API_ERROR'
  | 'ANALYSIS_FAILED';

/** GET /api/v1/reports/status/{task_id} — 분석 진행중 (status: 'PROCESSING') */
export interface ReportStatusProcessingData {
  task_id: string;
  /** 0-100 */
  progress: number;
  /** 한국어 그대로 표시 (예: "치안 리스크 검증 중") */
  current_step: string;
  /** 한국어 그대로 표시 */
  completed_steps: string[];
  estimated_remaining_seconds: number;
}

/** GET /api/v1/reports/status/{task_id} — 분석 완료 (status: 'COMPLETED') */
export interface ReportStatusCompletedData {
  task_id: string;
  report_id: string;
  progress: 100;
  /** ISO 8601 */
  completed_at: string;
}

/**
 * GET /api/v1/reports/status/{task_id} — 응답 envelope (status 기반 union).
 * 분석 실패(`status: 'FAILED'`)는 envelope-level success=false라 ApiError로 떨어짐.
 */
export type ReportStatusEnvelope =
  | { status: 'PROCESSING'; data: ReportStatusProcessingData }
  | { status: 'COMPLETED'; data: ReportStatusCompletedData };

/**
 * GET /api/v1/reports/status/{task_id} — 정의된 에러 코드 (UI 분기용).
 * 주의: 'FAILED' status로 EXTERNAL_API_ERROR/ANALYSIS_FAILED 같은 분석 자체 실패도 같이 옴.
 */
export type ReportStatusErrorCode =
  | 'INVALID_INPUT'
  | 'INVALID_COORDINATES'
  | 'OUT_OF_SERVICE_AREA'
  | 'UNAUTHORIZED'
  | 'TASK_NOT_FOUND'
  | 'TOO_MANY_REQUESTS'
  | 'EXTERNAL_API_ERROR'
  | 'ANALYSIS_FAILED';

/**
 * 점수 상태 코드 (백엔드가 grade 한국어와 별개로 제공하는 분기용 영어 코드).
 * 주의: 도메인 `Grade`는 4단계(SAFE/NORMAL/CAUTION/DANGER)인데 wire는 3단계.
 */
export type ScoreStatus = 'SAFE' | 'CAUTION' | 'RISK';

/** GET /api/v1/bookmarks/properties — 필터 status (query param) */
export type BookmarkFilterStatus = 'ALL' | ScoreStatus;

/** GET /api/v1/bookmarks/properties — query params (전부 옵셔널, 백엔드 default 적용) */
export interface BookmarkPropertiesQuery {
  /** default 'ALL' */
  status?: BookmarkFilterStatus;
  /** default 1 */
  page?: number;
  /** default 10 */
  size?: number;
}

/** GET /api/v1/bookmarks/properties — 필터 탭별 카운트 */
export interface BookmarkFilterCounts {
  total_cnt: number;
  safe_cnt: number;
  caution_cnt: number;
  risk_cnt: number;
}

/** GET /api/v1/bookmarks/properties — 저장된 매물 한 항목 */
export interface BookmarkProperty {
  /**
   * 매물 ID. 명세는 integer지만 ID 통일 합의(string)로 받음.
   * 백엔드 실 응답이 number면 JS는 number→string 변환 필요한지 확인.
   */
  property_id: string;
  /** 연결된 리포트 ID (UUID 합의 동일) */
  report_id: string;
  address: string;
  /** 위치/접근성 한 줄 설명 (예: "잔디로7길 24 · 망원역 6번 출구 도보 6분") */
  description: string;
  score: number;
  /** 한국어 등급 (예: "양호", "안심", "주의") — 표시용 */
  grade: string;
  /** 분기용 영어 코드 (3단계) — 필터/UI 분기에 사용 */
  score_status: ScoreStatus;
  /** 매물 요약 태그 (예: ["양호", "의료 강점"]) */
  tags: string[];
  bookmarked: boolean;
  /**
   * 저장 일시. timezone 정보 없는 ISO 8601 부분 형식 (예: "2026-05-04T15:00:00").
   * 분석 endpoint의 analyzed_at(...Z)와 형식 다름.
   */
  saved_at: string;
}

/** GET /api/v1/bookmarks/properties — 응답 (페이지네이션 포함, Spring Page 형태) */
export interface BookmarkPropertiesResponse {
  filter_counts: BookmarkFilterCounts;
  content: BookmarkProperty[];
  page: number;
  size: number;
  total_elements: number;
}

/**
 * POST /api/v1/bookmarks/properties — request body.
 * 명세표는 uuid, sample은 integer로 적혀 있어 자가모순.
 * ID 통일 합의(string)에 맞춰 string으로 적용.
 */
export interface SavePropertyRequest {
  /** 저장할 매물 ID (필수) */
  property_id: string;
  /** 연결할 리포트 ID (옵셔널) */
  report_id?: string;
}

/** POST /api/v1/bookmarks/properties — 성공 응답 (토글 결과만, 매물 상세 없음) */
export interface SavePropertyResponse {
  property_id: string;
  report_id: string;
  bookmarked: boolean;
}

/**
 * POST /api/v1/bookmarks/properties — 정의된 에러 코드.
 * 주의: 명세에 에러 표 통째로 누락. sample에 등장한 한 개만 잡아둠.
 * 백엔드가 보낼 가능성 높은 표준 에러(INVALID_TOKEN, EXPIRED_TOKEN, INVALID_INPUT 등)는 명세 갱신 후 추가.
 */
export type SavePropertyErrorCode = 'PROPERTY_ALREADY_BOOKMARKED';

/**
 * DELETE /api/v1/bookmarks/properties/{id} — 성공 응답.
 * 토글 결과만 ({ property_id, bookmarked: false }). 매물 상세 없음.
 */
export interface DeletePropertyResponse {
  property_id: string;
  /** 항상 false (저장 해제 결과) */
  bookmarked: boolean;
}

/**
 * DELETE /api/v1/bookmarks/properties/{id} — 정의된 에러 코드.
 * 주의: 명세에 에러 표 통째로 누락. sample 한 개만.
 * 표준 에러(INVALID_TOKEN, EXPIRED_TOKEN, FORBIDDEN_REPORT 등)는 명세 갱신 후 추가.
 */
export type DeletePropertyErrorCode = 'PROPERTY_NOT_BOOKMARKED';

export type Screen =
  | 'onboarding'
  | 'home'
  | 'search'
  | 'map'
  | 'loading'
  | 'report'
  | 'detail'
  | 'compare'
  | 'saved'
  | 'my';
