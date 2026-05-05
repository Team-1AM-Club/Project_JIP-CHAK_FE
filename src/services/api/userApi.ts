import type { UserProfile, UserProfileType, UserSettings } from '../../types/domain';
import { apiRequest } from './apiClient';
import { apiEndpoints } from './endpoints';

export const userApi = {
  getMyProfile(token: string) {
    return apiRequest<UserProfile>(apiEndpoints.users.myProfile, { token });
  },

  updateMyProfile(token: string, payload: Partial<UserProfile>) {
    return apiRequest<UserProfile>(apiEndpoints.users.myProfile, {
      method: 'PATCH',
      token,
      body: JSON.stringify(payload),
    });
  },

  updateWeights(token: string, profileType: UserProfileType) {
    return apiRequest<UserProfile>(apiEndpoints.users.weights, {
      method: 'PATCH',
      token,
      body: JSON.stringify({ profileType }),
    });
  },

  getSettings(token: string) {
    return apiRequest<UserSettings>(apiEndpoints.users.settings, { token });
  },

  updateSettings(token: string, payload: Partial<UserSettings>) {
    return apiRequest<UserSettings>(apiEndpoints.users.settings, {
      method: 'PATCH',
      token,
      body: JSON.stringify(payload),
    });
  },
};
