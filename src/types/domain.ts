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

export type Screen =
  | 'login'
  | 'onboarding'
  | 'saved'
  | 'home'
  | 'search'
  | 'map'
  | 'compare'
  | 'my';
