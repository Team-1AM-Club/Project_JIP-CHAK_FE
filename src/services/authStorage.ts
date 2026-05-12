const ACCESS_TOKEN_KEY = 'jipchak.accessToken';
const REFRESH_TOKEN_KEY = 'jipchak.refreshToken';

interface TokenPair {
  access_token: string;
  refresh_token: string;
}

export const authStorage = {
  getAccessToken() {
    return window.localStorage.getItem(ACCESS_TOKEN_KEY);
  },

  getRefreshToken() {
    return window.localStorage.getItem(REFRESH_TOKEN_KEY);
  },

  saveTokens(tokens: TokenPair) {
    window.localStorage.setItem(ACCESS_TOKEN_KEY, tokens.access_token);
    window.localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refresh_token);
  },

  clear() {
    window.localStorage.removeItem(ACCESS_TOKEN_KEY);
    window.localStorage.removeItem(REFRESH_TOKEN_KEY);
  },
};
