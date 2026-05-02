export type UserProfileType = 'SINGLE' | 'COUPLE' | 'FAMILY';
export type RiskType = 'FLOOD' | 'SAFETY' | 'MEDICAL' | 'CONGESTION' | 'NOISE';
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
