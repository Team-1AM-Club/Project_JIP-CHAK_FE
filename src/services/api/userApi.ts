import type {
  AccountWithdrawalResult,
  RiskWeights,
  UserProfile,
  UserProfileType,
  UserSettings,
  UserWeightProfile,
} from '../../types/domain';
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

  async getWeightProfile(token: string) {
    const response = await apiRequest<unknown>(apiEndpoints.users.myProfile, { token });

    return normalizeUserWeightProfile(response);
  },

  async updateWeights(token: string, weights: RiskWeights) {
    const response = await apiRequest<unknown>(apiEndpoints.users.weights, {
      method: 'PATCH',
      token,
      body: JSON.stringify(weights),
    });

    return normalizeWeights(response);
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

  async deleteMe(token: string) {
    const response = await apiRequest<unknown>(apiEndpoints.users.me, {
      method: 'DELETE',
      token,
    });

    return normalizeWithdrawalResult(response);
  },
};

function normalizeUserProfile(response: unknown): UserProfile {
  const root = objectValue(response);
  const record = optionalObjectValue(root.profile) ?? optionalObjectValue(root.user) ?? root;
  const currentUserType = optionalObjectValue(root.current_user_type);
  const typeSource =
    root.profileType ??
    root.user_type ??
    root.user_type_id ??
    currentUserType?.user_type_id ??
    currentUserType?.user_type ??
    record.profileType ??
    record.user_type ??
    record.user_type_id;
  const nickname = stringValue(record.nickname ?? record.name ?? record.email ?? '사용자') || '사용자';

  return {
    id: stringValue(record.id ?? record.user_id ?? record.userId ?? 'user'),
    nickname,
    profileType: profileType(typeSource),
  };
}

function normalizeUserWeightProfile(response: unknown): UserWeightProfile {
  const root = objectValue(response);
  const currentUserType = optionalObjectValue(root.current_user_type) ?? optionalObjectValue(root.user_type) ?? {};
  const type = profileType(currentUserType.user_type_id ?? currentUserType.user_type ?? root.user_type_id ?? root.profileType);

  return {
    profileType: type,
    profileTypeName: stringValue(currentUserType.user_type_name ?? currentUserType.name) || profileTypeName(type),
    profileTypeDescription:
      stringValue(currentUserType.user_type_desc ?? currentUserType.description) || profileTypeDescription(type),
    isCustomized: booleanValue(currentUserType.is_customized ?? root.is_customized, false),
    weights: normalizeWeights(root.weights),
  };
}

function normalizeSettings(response: unknown): UserSettings {
  const root = objectValue(response);
  const record = optionalObjectValue(root.settings) ?? root;

  return {
    notificationsEnabled: booleanValue(record.notificationsEnabled ?? record.noti_enabled, true),
    darkMode: darkMode(record.darkMode ?? record.dark_mode),
  };
}

function normalizeWeights(response: unknown): RiskWeights {
  const root = objectValue(response);
  const weights = optionalObjectValue(root.weights) ?? optionalObjectValue(root.data) ?? root;

  return {
    security: numberValue(weights.security, 30),
    noise: numberValue(weights.noise, 25),
    medical: numberValue(weights.medical, 15),
    flood: numberValue(weights.flood, 15),
    congestion: numberValue(weights.congestion, 15),
  };
}

function normalizeWithdrawalResult(response: unknown): AccountWithdrawalResult {
  const root = objectValue(response);
  const record = optionalObjectValue(root.user) ?? optionalObjectValue(root.account) ?? root;

  return {
    userName: stringValue(
      root.user_name ??
        root.userName ??
        root.name ??
        root.nickname ??
        record.user_name ??
        record.userName ??
        record.name ??
        record.nickname ??
        '사용자',
    ) || '사용자',
    deletedAt: stringValue(
      root.deleted_at ??
        root.deletedAt ??
        root.withdrawn_at ??
        root.withdrawnAt ??
        root.deleted_time ??
        record.deleted_at ??
        record.deletedAt ??
        record.withdrawn_at ??
        record.withdrawnAt ??
        record.deleted_time ??
        new Date().toISOString(),
    ),
  };
}

function userTypeId(profileType: UserProfileType) {
  return {
    SINGLE: 1,
    COUPLE: 2,
    FAMILY: 3,
  }[profileType];
}

function profileTypeName(profileType: UserProfileType) {
  return {
    SINGLE: '청년 1인 가구',
    COUPLE: '신혼부부',
    FAMILY: '부모 동거 가구',
  }[profileType];
}

function profileTypeDescription(profileType: UserProfileType) {
  return {
    SINGLE: '안전·소음 가중치 적용 중',
    COUPLE: '의료·안전·교통 가중치 적용 중',
    FAMILY: '안전·의료 가중치 적용 중',
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

function numberValue(value: unknown, fallback: number) {
  const number = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function stringValue(value: unknown) {
  return typeof value === 'string' ? value : value == null ? '' : String(value);
}

function objectValue(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
}

function optionalObjectValue(value: unknown): Record<string, unknown> | undefined {
  return value && typeof value === 'object' && !Array.isArray(value) ? (value as Record<string, unknown>) : undefined;
}
