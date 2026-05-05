import type { AuthTokenResponse, LoginRequest } from '../../types/domain';
import { apiRequest } from './apiClient';
import { apiEndpoints } from './endpoints';

export const authApi = {
  login(payload: LoginRequest) {
    return apiRequest<AuthTokenResponse>(apiEndpoints.auth.login, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  logout(token: string) {
    return apiRequest<void>(apiEndpoints.auth.logout, {
      method: 'POST',
      token,
    });
  },

  reissue(refreshToken: string) {
    return apiRequest<AuthTokenResponse>(apiEndpoints.auth.reissue, {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    });
  },
};
