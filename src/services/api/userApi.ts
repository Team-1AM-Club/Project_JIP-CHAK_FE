import type { RiskWeights, UserProfile, UserProfileType, UserSettings } from '../../types/domain';
import { apiRequest } from './apiClient';
import { apiEndpoints } from './endpoints';

export const userApi = {
  async getMyProfile(token: string) {
    const response = await apiRequest<unknown>(apiEndpoints.users.myProfile, { token });

    return normalizeUserProfile(response);
  },

  async updateMyProfile(token: string, payload: Partial<UserProfile>) {
    const response = await apiRequest<unknown>(apiEndpoints.users.myProfile, {
      method: 'PATCH',
      token,
      body: JSON.stringify({ user_type_id: userTypeId(payload.profileType ?? 'SINGLE') }),
    });

    return normalizeUserProfile(response);
  },

  async updateProfileType(token: string, profileType: UserProfileType) {
    const response = await apiRequest<unknown>(apiEndpoints.users.myProfile, {
      method: 'PATCH',
      token,
      body: JSON.stringify({ user_type_id: userTypeId(profileType) }),
    });

    return normalizeUserProfile(response);
  },

  updateWeights(token: string, weights: RiskWeights) {
    return apiRequest<RiskWeights>(apiEndpoints.users.weights, {
      method: 'PATCH',
      token,
      body: JSON.stringify(weights),
    });
  },

  async getSettings(token: string) {
    const response = await apiRequest<unknown>(apiEndpoints.users.settings, { token });

    return normalizeSettings(response);
  },

  async updateSettings(token: string, payload: Partial<UserSettings>) {
    const response = await apiRequest<unknown>(apiEndpoints.users.settings, {
      method: 'PATCH',
      token,
      body: JSON.stringify({
        ...(payload.notificationsEnabled !== undefined ? { noti_enabled: payload.notificationsEnabled } : {}),
        ...(payload.darkMode !== undefined ? { dark_mode: payload.darkMode } : {}),
      }),
    });

    return normalizeSettings(response);
  },
};

function normalizeUserProfile(response: unknown): UserProfile {
  const record = response && typeof response === 'object' ? (response as Record<string, unknown>) : {};

  return {
    id: stringValue(record.id ?? record.user_id ?? record.userId ?? 'user'),
    nickname: stringValue(record.nickname ?? record.name ?? '사용자'),
    profileType: profileType(record.profileType ?? record.user_type ?? record.user_type_id),
  };
}

function normalizeSettings(response: unknown): UserSettings {
  const record = response && typeof response === 'object' ? (response as Record<string, unknown>) : {};

  return {
    notificationsEnabled: booleanValue(record.notificationsEnabled ?? record.noti_enabled, true),
    darkMode: darkMode(record.darkMode ?? record.dark_mode),
  };
}

function userTypeId(profileType: UserProfileType) {
  return {
    SINGLE: 1,
    COUPLE: 2,
    FAMILY: 3,
  }[profileType];
}

function profileType(value: unknown): UserProfileType {
  if (value === 'COUPLE' || value === 2 || value === '2') {
    return 'COUPLE';
  }

  if (value === 'FAMILY' || value === 3 || value === '3') {
    return 'FAMILY';
  }

  return 'SINGLE';
}

function darkMode(value: unknown): UserSettings['darkMode'] {
  return value === 'LIGHT' || value === 'DARK' || value === 'SYSTEM' ? value : 'SYSTEM';
}

function booleanValue(value: unknown, fallback: boolean) {
  return typeof value === 'boolean' ? value : fallback;
}

function stringValue(value: unknown) {
  return typeof value === 'string' ? value : value == null ? '' : String(value);
}
