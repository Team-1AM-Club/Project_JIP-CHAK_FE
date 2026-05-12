import type { AuthLoginData, LoginRequest } from '../../types/domain';
import { apiRequest } from './apiClient';
import { apiEndpoints } from './endpoints';

export const authApi = {
  login(payload: LoginRequest) {
    return apiRequest<AuthLoginData>(apiEndpoints.auth.login, {
      method: 'POST',
      skipAuth: true,
      body: JSON.stringify(payload),
    });
  },

  logout(token: string, refreshToken: string | null) {
    return apiRequest<void>(apiEndpoints.auth.logout, {
      method: 'POST',
      token,
      body: JSON.stringify({ refresh_token: refreshToken ?? '' }),
    });
  },

  reissue(refreshToken: string) {
    return apiRequest<AuthLoginData>(apiEndpoints.auth.reissue, {
      method: 'POST',
      skipAuth: true,
      body: JSON.stringify({ refresh_token: refreshToken }),
    });
  },
};
