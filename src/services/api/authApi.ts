import type { AuthLoginResponse, LoginRequest } from '../../types/domain';
import { apiRequest } from './apiClient';
import { apiEndpoints } from './endpoints';

export const authApi = {
  login(provider: LoginRequest['provider']) {
    return apiRequest<AuthLoginResponse>(apiEndpoints.auth.login, {
      method: 'POST',
      body: JSON.stringify({ provider }),
    });
  },

  logout(token: string) {
    return apiRequest<void>(apiEndpoints.auth.logout, {
      method: 'POST',
      token,
    });
  },

  reissue(refreshToken: string) {
    return apiRequest<AuthLoginResponse>(apiEndpoints.auth.reissue, {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    });
  },
};
