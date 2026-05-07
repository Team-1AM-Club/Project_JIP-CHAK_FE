import type { AuthLoginResponse } from '../types/domain';

const ACCESS_TOKEN_KEY = 'jipchak.accessToken';
const REFRESH_TOKEN_KEY = 'jipchak.refreshToken';

export const authStorage = {
  getAccessToken() {
    return window.localStorage.getItem(ACCESS_TOKEN_KEY);
  },

  getRefreshToken() {
    return window.localStorage.getItem(REFRESH_TOKEN_KEY);
  },

  saveTokens(tokens: AuthLoginResponse) {
    if (typeof tokens === 'string') {
      return;
    }

    if (tokens.accessToken) {
      window.localStorage.setItem(ACCESS_TOKEN_KEY, tokens.accessToken);
    }

    if (tokens.refreshToken) {
      window.localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken);
    }
  },

  clear() {
    window.localStorage.removeItem(ACCESS_TOKEN_KEY);
    window.localStorage.removeItem(REFRESH_TOKEN_KEY);
  },
};
