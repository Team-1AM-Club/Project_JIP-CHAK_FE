const ACCESS_KEY = 'jipchak.accessToken';
const REFRESH_KEY = 'jipchak.refreshToken';

export interface StoredTokens {
  accessToken: string;
  refreshToken?: string;
}

export const tokenStorage = {
  getAccess(): string | null {
    return sessionStorage.getItem(ACCESS_KEY);
  },
  getRefresh(): string | null {
    return sessionStorage.getItem(REFRESH_KEY);
  },
  set({ accessToken, refreshToken }: StoredTokens): void {
    sessionStorage.setItem(ACCESS_KEY, accessToken);
    if (refreshToken) {
      sessionStorage.setItem(REFRESH_KEY, refreshToken);
    }
  },
  clear(): void {
    sessionStorage.removeItem(ACCESS_KEY);
    sessionStorage.removeItem(REFRESH_KEY);
  },
};
