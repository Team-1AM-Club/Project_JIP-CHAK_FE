import type { RiskType } from '../../types/domain';

export const API_BASE_PATH = '/api/v1';

export const riskEndpointByType: Record<RiskType, string> = {
  FLOOD: 'flood',
  SAFETY: 'security',
  MEDICAL: 'medical',
  NOISE: 'noise',
  CONGESTION: 'congestion',
};

export const apiEndpoints = {
  auth: {
    login: `${API_BASE_PATH}/auth/login`,
    logout: `${API_BASE_PATH}/auth/logout`,
    reissue: `${API_BASE_PATH}/auth/reissue`,
  },
  users: {
    myProfile: `${API_BASE_PATH}/users/myprofile`,
    weights: `${API_BASE_PATH}/users/weights`,
    settings: `${API_BASE_PATH}/users/settings`,
  },
  addresses: {
    search: `${API_BASE_PATH}/addresses/search`,
    mapSearch: `${API_BASE_PATH}/addresses/map-search`,
    compare: `${API_BASE_PATH}/addresses/compare`,
  },
  reports: {
    create: `${API_BASE_PATH}/reports`,
    status: (taskId: string) => `${API_BASE_PATH}/reports/status/${taskId}`,
    analysis: (reportId: string) => `${API_BASE_PATH}/reports/${reportId}/analysis`,
    riskDetail: (reportId: string, riskType: RiskType) =>
      `${API_BASE_PATH}/reports/${reportId}/${riskEndpointByType[riskType]}`,
  },
  bookmarks: {
    properties: `${API_BASE_PATH}/bookmarks/properties`,
    property: (id: string) => `${API_BASE_PATH}/bookmarks/properties/${id}`,
  },
} as const;
