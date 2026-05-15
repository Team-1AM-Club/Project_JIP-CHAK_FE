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
  dongCode?: string;
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

export interface CompareReportItem {
  report_id: string;
  address: string;
  short_address: string;
  region_name: string;
  rank_label: string;
  total_score: number;
  grade: GradeLabel;
  strength_tags: string[];
  saved: boolean;
}

export interface CompareMetricScore {
  report_id: string;
  score: number;
  diff: number;
}

export type CompareMetricIcon =
  | 'water'
  | 'moon'
  | 'medical'
  | 'people'
  | 'sound'
  | (string & {});

export interface CompareMetric {
  type: RiskTypeWire;
  label: string;
  icon: CompareMetricIcon;
  scores: CompareMetricScore[];
  best_report_id: string;
}

export interface CompareRecommendation {
  title: string;
  content: string;
  recommended_report_id: string;
  basis: string;
}

export interface CompareData {
  reports: CompareReportItem[];
  metric_comparison: CompareMetric[];
  recommendation: CompareRecommendation;
}

export type CompareAddressSource = 'SEARCH' | 'MAP';

export interface CompareAddressInput {
  address: string;
  road_addr?: string;
  jibun_addr?: string;
  lat: number;
  lng: number;
  dong_code?: string;
  source: CompareAddressSource;
}

export interface CreateComparePayload {
  addresses: CompareAddressInput[];
}

export interface CompareSlot {
  candidate: AddressCandidate;
  dongCode?: string;
}

export interface CompareReadyResult extends CompareData {
  status: 'READY';
}

export interface CompareProcessingResult {
  status: 'PROCESSING';
  task_id: string;
}

export type CreateCompareResult = CompareReadyResult | CompareProcessingResult;

export interface CompareStatusProcessingData {
  status: 'PROCESSING';
  progress: number;
  current_step: string;
  completed_addresses: number;
}

export interface CompareStatusCompletedData {
  status: 'COMPLETED';
  progress: number;
  data: CompareData;
}

export type CompareStatusResult =
  | CompareStatusProcessingData
  | CompareStatusCompletedData;

export type CompareErrorCode =
  | 'INVALID_INPUT_VALUE'
  | 'INVALID_COMPARISON_COUNT'
  | 'OUT_OF_SERVICE_AREA'
  | 'INVALID_TOKEN'
  | 'EXPIRED_TOKEN'
  | 'TASK_NOT_FOUND'
  | 'COMPARISON_FAILED'
  | 'INTERNAL_SERVER_ERROR';

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
  isCustomized: boolean;
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

export type GradeLabel =
  | '안심'
  | '양호'
  | '주의'
  | '경고'
  | '위험'
  | '충분'
  | '보통'
  | '부족'
  | (string & {});

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

export type FloodDefenseKey =
  | 'elevation'
  | 'pump_capacity'
  | 'impervious_ratio'
  | (string & {});

export interface FloodDefenseMetric {
  key: FloodDefenseKey;
  label: string;
  value: number;
  display_value: string;
  sub_value: number | null;
  sub_display_value: string | null;
  score: number;
  status: GradeLabel;
}

export interface FloodDefense {
  title: string;
  score: number;
  status: GradeLabel;
  gu_average: number;
  percentile_label: string;
  metrics: FloodDefenseMetric[];
}

export interface FloodHistoryYear {
  year: number;
  count: number;
}

export interface FloodHistoryEvent {
  year: number;
  label: string;
  type: string;
  area_m2?: number;
  depth_cm?: number;
  lat?: number;
  lng?: number;
}

export interface FloodHistory {
  title: string;
  period: string;
  total_count: number;
  display_total: string;
  gu_average: number;
  average_label: string;
  years: FloodHistoryYear[];
  events: FloodHistoryEvent[];
  has_nearby_history?: boolean;
  nearby_count?: number;
}

export interface FloodVisualization {
  type: 'map' | (string & {});
  center: { lat: number; lng: number };
  layers: FloodVisualizationLayer[];
  flood_defense?: FloodDefense | null;
  flood_history?: FloodHistory | null;
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

export interface SecurityCctvChart {
  title?: string;
  cctv_count?: number;
  radius_m?: number;
  years: number[];
  counts: number[];
  growth_rate: number;
  growth_label: string;
}

export interface SecurityStreetLightChart {
  title: string;
  status: GradeLabel;
  nearby_count: number;
  radius_m: number;
  density: number;
  density_label: string;
  safe_spot_count: number;
  safe_spot_label: string;
  avg_safe_bonus_score: number;
}

export interface SecurityPoliceChart {
  title: string;
  name: string;
  distance_m: number;
  distance_label: string;
  travel_label: string;
}

export interface SecurityInfraChart {
  cctv?: SecurityCctvChart | null;
  street_light?: SecurityStreetLightChart | null;
  police?: SecurityPoliceChart | null;
}

export interface CrimeChartSummary {
  total_occurrence: number;
  occurrence_diff_from_seoul_avg: number;
  clearance_rate: number;
  seoul_clearance_rate: number;
  rank: number;
  rank_total: number;
  safe_percentile: number;
}

export type CrimeType = 'murder' | 'robbery' | 'rape' | 'theft' | 'violence' | (string & {});

export interface CrimeChartItem {
  type: CrimeType;
  label: string;
  occurrence: number;
  clearance_rate: number;
  bar_value: number;
  status: GradeLabel;
  display_occurrence: string;
  display_clearance_rate: string;
}

export interface CrimeChart {
  title: string;
  subtitle: string;
  scope: string;
  gu_name: string;
  display_region_name: string;
  years: number[];
  summary: CrimeChartSummary;
  items: CrimeChartItem[];
}

export interface SecurityVisualization {
  type: 'map' | (string & {});
  center: { lat: number; lng: number };
  layers: SecurityVisualizationLayer[];
  security_infra_chart?: SecurityInfraChart | null;
  crime_chart?: CrimeChart | null;
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

export type NearestMedicalType =
  | 'general_hospital'
  | 'hospital'
  | 'clinic'
  | 'pharmacy'
  | (string & {});

export interface NearestMedicalItem {
  type: NearestMedicalType;
  label: string;
  name: string;
  distance_m: number;
  distance_label: string;
  travel_label: string;
}

export interface NearestMedicalChart {
  title: string;
  items: NearestMedicalItem[];
}

export interface NightDensityTimeSlot {
  hour: string;
  count: number;
  clinic_count: number;
  pharmacy_count: number;
  status: GradeLabel;
}

export interface NightDensityChart {
  title: string;
  radius_m: number;
  density: number;
  density_label: string;
  gu_average: number;
  gu_average_label: string;
  time_slots: NightDensityTimeSlot[];
}

export interface HospitalAccessNearest {
  name: string;
  distance_m: number;
  distance_label: string;
}

export interface HospitalAccessChart {
  title: string;
  radius_m: number;
  hospital_count: number;
  display_count: string;
  access_score: number;
  status: GradeLabel;
  nearest_hospital: HospitalAccessNearest;
}

export type MedicalWorkforceKey = 'nurse' | 'specialist' | 'total' | (string & {});

export interface MedicalWorkforceItem {
  key: MedicalWorkforceKey;
  label: string;
  value: number;
  display_value: string;
  gu_average: number;
  gu_average_label: string;
  diff_from_average: number;
  diff_label: string;
  score: number;
  status: GradeLabel;
}

export interface MedicalWorkforceChart {
  title: string;
  scope: string;
  gu_name: string;
  items: MedicalWorkforceItem[];
}

export interface MedicalVisualization {
  type: 'map' | (string & {});
  center: { lat: number; lng: number };
  layers: MedicalVisualizationLayer[];
  nearest_medical_chart?: NearestMedicalChart | null;
  night_density_chart?: NightDensityChart | null;
  hospital_access_chart?: HospitalAccessChart | null;
  medical_workforce_chart?: MedicalWorkforceChart | null;
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

export type NoiseSourceItemKey =
  | 'traffic'
  | 'complaint'
  | 'pub'
  | 'measurement'
  | (string & {});

export interface NoiseSourceItem {
  key: NoiseSourceItemKey;
  label: string;
  display_value: string;
  unit?: string | null;
  status: GradeLabel;
  description?: string | null;
  distance_label?: string | null;
  meta?: Record<string, string | number | boolean | null | undefined>;
}

export interface NoiseSourceChart {
  title?: string;
  items: NoiseSourceItem[];
}

export interface NoiseHourlyChartSummary {
  peak?: string | null;
  night_average_label?: string | null;
}

export interface NoiseHourlyChart {
  title: string;
  subtitle?: string | null;
  station?: string | null;
  distance_label?: string | null;
  unit?: string | null;
  labels: string[];
  values: number[];
  lden_values?: number[] | null;
  statuses?: GradeLabel[] | null;
  summary?: NoiseHourlyChartSummary | null;
}

export interface NoiseVisualization {
  type: 'map_chart' | (string & {});
  center: { lat: number; lng: number };
  chart: NoiseVisualizationChart;
  layers: NoiseVisualizationLayer[];
  noise_source_chart?: NoiseSourceChart | null;
  noise_hourly_chart?: NoiseHourlyChart | null;
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

export interface PopulationHourlyChartSummary {
  morning_peak?: string | null;
  evening_peak?: string | null;
  night?: string | null;
}

export interface PopulationHourlyChart {
  title: string;
  scope?: string | null;
  unit?: string | null;
  labels: string[];
  values: number[];
  statuses?: GradeLabel[] | null;
  summary?: PopulationHourlyChartSummary | null;
}

export interface NearbyTransportSubway {
  station_name: string;
  line_name?: string | null;
  distance_label?: string | null;
  travel_label?: string | null;
  status?: GradeLabel | null;
  daily_passengers_label?: string | null;
  avg_congestion_label?: string | null;
  peak_congestion_label?: string | null;
}

export interface NearbyTransportBus {
  stop_name: string;
  stop_type?: string | null;
  distance_label?: string | null;
  travel_label?: string | null;
  status?: GradeLabel | null;
  daily_avg_usage_label?: string | null;
  congestion_score_label?: string | null;
}

export interface NearbyTransportChart {
  subway?: NearbyTransportSubway | null;
  bus?: NearbyTransportBus | null;
}

export interface BusHourlyChartSummary {
  peak?: string | null;
}

export interface BusHourlyChart {
  title: string;
  radius_m?: number | null;
  unit?: string | null;
  labels: string[];
  values: number[];
  stop_count?: number | null;
  summary?: BusHourlyChartSummary | null;
}

export interface CongestionVisualization {
  type: 'chart' | (string & {});
  chart: CongestionVisualizationChart;
  layers: CongestionVisualizationLayer[];
  population_hourly_chart?: PopulationHourlyChart | null;
  nearby_transport_chart?: NearbyTransportChart | null;
  bus_hourly_chart?: BusHourlyChart | null;
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
