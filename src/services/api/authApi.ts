import type { AuthTokenResponse, LoginRequest } from '../../types/domain';
import { apiRequest } from './apiClient';
import { apiEndpoints } from './endpoints';
import { tokenStorage } from './tokenStorage';

export const authApi = {
  async login(payload: LoginRequest): Promise<AuthTokenResponse> {
    const tokens = await apiRequest<AuthTokenResponse>(apiEndpoints.auth.login, {
      method: 'POST',
      body: JSON.stringify(payload),
      skipAuth: true,
    });
    tokenStorage.set(tokens);
    return tokens;
  },

  async logout(): Promise<void> {
    try {
      await apiRequest<void>(apiEndpoints.auth.logout, { method: 'POST' });
    } finally {
      tokenStorage.clear();
    }
  },
};
