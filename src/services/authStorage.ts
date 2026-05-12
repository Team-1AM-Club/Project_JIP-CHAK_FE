const ACCESS_TOKEN_KEY = 'jipchak.accessToken';
const REFRESH_TOKEN_KEY = 'jipchak.refreshToken';

interface TokenPair {
  access_token?: string;
  refresh_token?: string;
  accessToken?: string;
  refreshToken?: string;
}

export const authStorage = {
  getAccessToken() {
    return window.localStorage.getItem(ACCESS_TOKEN_KEY);
  },

  getRefreshToken() {
    return window.localStorage.getItem(REFRESH_TOKEN_KEY);
  },

  saveTokens(tokens: TokenPair) {
    const accessToken = tokens.access_token ?? tokens.accessToken;
    const refreshToken = tokens.refresh_token ?? tokens.refreshToken;

    if (accessToken) {
      window.localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    }

    if (refreshToken) {
      window.localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    }
  },

  clear() {
    window.localStorage.removeItem(ACCESS_TOKEN_KEY);
    window.localStorage.removeItem(REFRESH_TOKEN_KEY);
  },
};
