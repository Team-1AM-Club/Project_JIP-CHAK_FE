export type UserProfileType = 'SINGLE' | 'COUPLE' | 'FAMILY';
export type RiskType = 'FLOOD' | 'SAFETY' | 'MEDICAL' | 'CONGESTION' | 'NOISE';
export type Grade = 'SAFE' | 'NORMAL' | 'CAUTION' | 'DANGER';
export type SocialProvider = 'KAKAO' | 'GOOGLE' | 'NAVER';

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

export interface CompareResult {
  left: ReportSummary;
  right: ReportSummary;
  recommendation: string;
}

export type SocialProviderWire = 'kakao' | 'naver' | 'google';

export interface RecentAddressSummary {
  id: string;
  address: string;
  detail: string;
  score?: number;
  grade?: Grade;
  viewedAtLabel?: string;
}

export interface SavedReportPreview {
  id: string;
  reportId?: string;
  address: string;
  detail: string;
  score?: number;
  grade?: Grade;
  savedAtLabel?: string;
  isBookmarked?: boolean;
}

export interface LoginRequest {
  provider: SocialProviderWire;
  code: string;
  redirect_uri: string;
  state?: string;
}

export interface AuthSubscription {
  plan: 'FREE' | 'PRO';
  expires_at: string | null;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  profile_image?: string;
  provider: SocialProviderWire;
  created_at: string;
  has_preferences: boolean;
  subscription: AuthSubscription;
}

export interface AuthLoginData {
  is_new_user: boolean;
  user: AuthUser;
  access_token: string;
  refresh_token: string;
  expires_in: number;
  refresh_expires_in?: number;
}

export type AuthLoginErrorCode =
  | 'INVALID_INPUT_VALUE'
  | 'LOGIN_FAILED'
  | 'INTERNAL_SERVER_ERROR';

export interface UserProfile {
  id: string;
  nickname: string;
  profileType: UserProfileType;
}

export interface UserSettings {
  notificationsEnabled: boolean;
  darkMode: 'SYSTEM' | 'LIGHT' | 'DARK';
}

export interface RiskWeights {
  security: number;
  noise: number;
  medical: number;
  flood: number;
  congestion: number;
}

export interface UserWeightProfile {
  profileType: UserProfileType;
  profileTypeName: string;
  profileTypeDescription: string;
  isCustomized: boolean;
  weights: RiskWeights;
}

export interface AccountWithdrawalResult {
  userName: string;
  deletedAt: string;
}

export type Screen =
  | 'login'
  | 'onboarding'
  | 'saved'
  | 'home'
  | 'search'
  | 'map'
  | 'loading'
  | 'report'
  | 'detail'
  | 'compare'
  | 'weights'
  | 'my';

export type ReportSource = 'SEARCH' | 'MAP';

export interface CreateReportPayload {
  address: string;
  road_addr?: string;
  jibun_addr?: string;
  lat: number;
  lng: number;
  dong_code?: string;
  source: ReportSource;
}

export interface ReportReadyData {
  status: 'READY';
  report_id: string;
  dong_code: string;
  dong_name: string;
  address: string;
  total_score: number;
  cached: true;
  analyzed_at: string;
}

export interface ReportProcessingData {
  status: 'PROCESSING';
  task_id: string;
  dong_code: string;
  dong_name: string;
  address: string;
  estimated_seconds: number;
  cached: false;
}

export type CreateReportResult = ReportReadyData | ReportProcessingData;

export type CreateReportErrorCode =
  | 'INVALID_INPUT_VALUE'
  | 'INVALID_LOCATION'
  | 'OUT_OF_SERVICE_AREA'
  | 'INVALID_TOKEN'
  | 'EXTERNAL_API_ERROR'
  | 'ANALYSIS_FAILED';

export interface ReportStatusProcessingData {
  status: 'PROCESSING';
  task_id: string;
  progress: number;
  current_step: string;
  completed_steps: string[];
  estimated_remaining_seconds: number;
}

export interface ReportStatusCompletedData {
  status: 'COMPLETED';
  task_id: string;
  report_id: string;
  progress: number;
  completed_at: string;
}

export type ReportStatusResult = ReportStatusProcessingData | ReportStatusCompletedData;

export type ReportStatusErrorCode =
  | 'INVALID_INPUT'
  | 'INVALID_COORDINATES'
  | 'OUT_OF_SERVICE_AREA'
  | 'UNAUTHORIZED'
  | 'TASK_NOT_FOUND'
  | 'TOO_MANY_REQUESTS'
  | 'EXTERNAL_API_ERROR'
  | 'ANALYSIS_FAILED';

export type RiskTypeWire =
  | 'flood'
  | 'security'
  | 'medical'
  | 'noise'
  | 'congestion'
  | (string & {});

export type GradeLabel = '안심' | '양호' | '주의' | '경고' | '위험' | (string & {});

export interface AnalysisCategory {
  type: RiskTypeWire;
  title: string;
  score: number;
  grade: GradeLabel;
  summary: string;
}

export interface AnalysisScoreSource {
  base_score_cached: boolean;
  weight_applied: boolean;
}

export interface AnalysisReport {
  report_id: string;
  property_id?: string | number;
  address: string;
  dong_code: string;
  total_score: number;
  grade: GradeLabel;
  summary: string;
  score_source: AnalysisScoreSource;
  categories: AnalysisCategory[];
  saved: boolean;
}

export type AnalysisErrorCode =
  | 'INVALID_INPUT_VALUE'
  | 'INVALID_TOKEN'
  | 'EXPIRED_TOKEN'
  | 'FORBIDDEN_REPORT'
  | 'REPORT_NOT_FOUND'
  | 'REGION_DATA_NOT_FOUND'
  | 'EXTERNAL_API_ERROR'
  | 'ANALYSIS_FAILED'
  | 'INTERNAL_SERVER_ERROR';

export type DataSourceType =
  | 'STATIC'
  | 'STATIC_CACHE'
  | 'STATIC_DYNAMIC'
  | 'CACHE'
  | 'DYNAMIC'
  | (string & {});

export interface RiskDataSource {
  type: DataSourceType;
  description: string;
}

export interface RiskIndicator {
  key: string;
  name: string;
  raw_value: number | string | boolean | Record<string, unknown> | null;
  display_value: string;
  unit: string | null;
  score: number;
  weight: number;
  status: GradeLabel;
}

export type FloodLayerType = 'FLOOD_TRACE' | (string & {});

export interface FloodVisualizationLayer {
  type: FloodLayerType;
  name: string;
  source: string;
}

export interface FloodVisualization {
  type: 'map' | (string & {});
  center: { lat: number; lng: number };
  layers: FloodVisualizationLayer[];
}

export interface FloodRiskDetail {
  report_id: string;
  address: string;
  region_code: string;
  category: 'flood';
  title: string;
  score: number;
  base_score: number;
  grade: GradeLabel;
  summary: string;
  indicators: RiskIndicator[];
  visualization: FloodVisualization;
  data_source: RiskDataSource;
}

export type SecurityLayerType =
  | 'CCTV'
  | 'STREET_LIGHT'
  | 'POLICE'
  | 'SAFE_PATH'
  | (string & {});

export interface SecurityVisualizationLayer {
  type: SecurityLayerType;
  name: string;
  source: string;
}

export interface SecurityVisualization {
  type: 'map' | (string & {});
  center: { lat: number; lng: number };
  layers: SecurityVisualizationLayer[];
}

export interface SecurityRiskDetail {
  report_id: string;
  address: string;
  region_code: string;
  category: 'security';
  title: string;
  score: number;
  base_score: number;
  grade: GradeLabel;
  summary: string;
  indicators: RiskIndicator[];
  visualization: SecurityVisualization;
  data_source: RiskDataSource;
}

export type MedicalLayerType =
  | 'NIGHT_CLINIC'
  | 'PHARMACY'
  | 'PUBLIC_EMERGENCY'
  | (string & {});

export interface MedicalVisualizationLayer {
  type: MedicalLayerType;
  name: string;
  source: string;
}

export interface MedicalVisualization {
  type: 'map' | (string & {});
  center: { lat: number; lng: number };
  layers: MedicalVisualizationLayer[];
}

export interface MedicalRiskDetail {
  report_id: string;
  address: string;
  region_code: string;
  category: 'medical';
  title: string;
  score: number;
  base_score: number;
  grade: GradeLabel;
  summary: string;
  indicators: RiskIndicator[];
  visualization: MedicalVisualization;
  data_source: RiskDataSource;
}

export type NoiseLayerType =
  | 'ROAD'
  | 'RAIL'
  | 'AIRCRAFT'
  | 'NOISE_PUB'
  | (string & {});

export interface NoiseVisualizationLayer {
  type: NoiseLayerType;
  name: string;
  source: string;
}

export type NoiseChartBaseDateType = 'HOURLY_AVERAGE' | (string & {});

export interface NoiseVisualizationChart {
  base_date_type: NoiseChartBaseDateType;
  labels: string[];
  values: number[];
  unit?: string;
  cached: boolean;
}

export interface NoiseVisualization {
  type: 'map_chart' | (string & {});
  center: { lat: number; lng: number };
  chart: NoiseVisualizationChart;
  layers: NoiseVisualizationLayer[];
}

export interface NoiseRiskDetail {
  report_id: string;
  address: string;
  region_code: string;
  category: 'noise';
  title: string;
  score: number;
  base_score: number;
  grade: GradeLabel;
  summary: string;
  indicators: RiskIndicator[];
  visualization: NoiseVisualization;
  data_source: RiskDataSource;
}

export type CongestionLayerType =
  | 'BUS'
  | 'SUBWAY'
  | 'POPULATION'
  | (string & {});

export interface CongestionVisualizationLayer {
  type: CongestionLayerType;
  name: string;
  source: string;
}

export type CongestionChartBaseDateType =
  | 'WEEKDAY_AVERAGE'
  | 'WEEKEND_AVERAGE'
  | 'MONDAY_AVERAGE'
  | (string & {});

export interface CongestionVisualizationChart {
  base_date_type: CongestionChartBaseDateType;
  labels: string[];
  values: number[];
  unit?: string;
  cached: boolean;
}

export interface CongestionVisualization {
  type: 'chart' | (string & {});
  chart: CongestionVisualizationChart;
  layers: CongestionVisualizationLayer[];
}

export interface CongestionRiskDetail {
  report_id: string;
  address: string;
  region_code: string;
  category: 'congestion';
  title: string;
  score: number;
  base_score: number;
  grade: GradeLabel;
  summary: string;
  indicators: RiskIndicator[];
  visualization: CongestionVisualization;
  data_source: RiskDataSource;
}

export type RiskDetailErrorCode =
  | 'INVALID_INPUT_VALUE'
  | 'INVALID_TOKEN'
  | 'EXPIRED_TOKEN'
  | 'FORBIDDEN_REPORT'
  | 'REPORT_NOT_FOUND'
  | 'REGION_DATA_NOT_FOUND'
  | 'EXTERNAL_API_ERROR'
  | 'ANALYSIS_FAILED'
  | 'INTERNAL_SERVER_ERROR';

export type BookmarkFilterStatus = 'ALL' | 'SAFE' | 'CAUTION' | 'RISK';
export type ScoreStatus = 'SAFE' | 'CAUTION' | 'RISK';

export interface BookmarkFilterCounts {
  total_cnt: number;
  safe_cnt: number;
  caution_cnt: number;
  risk_cnt: number;
}

export interface BookmarkProperty {
  property_id: string | number;
  report_id: string | number;
  address: string;
  description: string;
  score: number;
  grade: GradeLabel;
  score_status: ScoreStatus;
  tags: string[];
  bookmarked: boolean;
  saved_at: string;
}

export interface BookmarkPropertiesData {
  filter_counts: BookmarkFilterCounts;
  content: BookmarkProperty[];
  page: number;
  size: number;
  total_elements: number;
}

export interface BookmarkPropertiesQuery {
  status?: BookmarkFilterStatus;
  page?: number;
  size?: number;
}

export type BookmarkPropertiesErrorCode =
  | 'INVALID_INPUT_VALUE'
  | 'INVALID_TOKEN'
  | 'EXPIRED_TOKEN'
  | 'INTERNAL_SERVER_ERROR';

export interface SavePropertyPayload {
  property_id: string | number;
  report_id?: string | number;
}

export interface SavePropertyData {
  property_id: string | number;
  report_id: string | number;
  bookmarked: boolean;
}

export type SavePropertyErrorCode =
  | 'PROPERTY_ALREADY_BOOKMARKED'
  | 'INVALID_INPUT_VALUE'
  | 'INVALID_TOKEN'
  | 'EXPIRED_TOKEN'
  | 'INTERNAL_SERVER_ERROR';

export interface DeletePropertyData {
  property_id: string | number;
  bookmarked: false;
}

export type DeletePropertyErrorCode =
  | 'PROPERTY_NOT_BOOKMARKED'
  | 'INVALID_INPUT_VALUE'
  | 'INVALID_TOKEN'
  | 'EXPIRED_TOKEN'
  | 'INTERNAL_SERVER_ERROR';
