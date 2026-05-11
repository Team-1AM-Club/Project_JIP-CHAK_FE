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
  provider: SocialProvider;
}

export type AuthLoginResponse =
  | string
  | {
  accessToken: string;
  refreshToken?: string;
  redirectUrl?: string;
  authorizationUrl?: string;
};

export interface UserProfile {
  id: string;
  nickname: string;
  profileType: UserProfileType;
}

export interface UserSettings {
  notificationsEnabled: boolean;
  darkMode: 'SYSTEM' | 'LIGHT' | 'DARK';
}

export type Screen =
  | 'login'
  | 'onboarding'
  | 'saved'
  | 'home'
  | 'search'
  | 'map'
  | 'compare'
  | 'my';
