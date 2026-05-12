import type { AuthLoginData, LoginRequest } from '../../types/domain';
import { apiRequest } from './apiClient';
import { apiEndpoints } from './endpoints';

export const authApi = {
  login(payload: LoginRequest) {
    return apiRequest<AuthLoginData>(apiEndpoints.auth.login, {
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
    return apiRequest<AuthLoginData>(apiEndpoints.auth.reissue, {
      method: 'POST',
      body: JSON.stringify({ refresh_token: refreshToken }),
    });
  },
};
