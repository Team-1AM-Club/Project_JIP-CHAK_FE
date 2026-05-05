import type { UserProfile, UserProfileType, UserSettings } from '../../types/domain';
import { apiRequest } from './apiClient';
import { apiEndpoints } from './endpoints';

export const userApi = {
  getMyProfile() {
    return apiRequest<UserProfile>(apiEndpoints.users.myProfile);
  },

  updateMyProfile(payload: Partial<UserProfile>) {
    return apiRequest<UserProfile>(apiEndpoints.users.myProfile, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  },

  updateWeights(profileType: UserProfileType) {
    return apiRequest<UserProfile>(apiEndpoints.users.weights, {
      method: 'PATCH',
      body: JSON.stringify({ profileType }),
    });
  },

  getSettings() {
    return apiRequest<UserSettings>(apiEndpoints.users.settings);
  },

  updateSettings(payload: Partial<UserSettings>) {
    return apiRequest<UserSettings>(apiEndpoints.users.settings, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  },
};
