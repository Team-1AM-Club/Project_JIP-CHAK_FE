export const API_BASE_PATH = '/api/v1';

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
    me: `${API_BASE_PATH}/users/me`,
  },
  addresses: {
    search: `${API_BASE_PATH}/addresses/search`,
    mapSearch: `${API_BASE_PATH}/addresses/map-search`,
  },
  reports: {
    create: `${API_BASE_PATH}/reports`,
    status: (taskId: string) => `${API_BASE_PATH}/reports/status/${encodeURIComponent(taskId)}`,
    analysis: (reportId: string) =>
      `${API_BASE_PATH}/reports/${encodeURIComponent(reportId)}/analysis`,
    flood: (reportId: string) =>
      `${API_BASE_PATH}/reports/${encodeURIComponent(reportId)}/flood`,
    security: (reportId: string) =>
      `${API_BASE_PATH}/reports/${encodeURIComponent(reportId)}/security`,
    medical: (reportId: string) =>
      `${API_BASE_PATH}/reports/${encodeURIComponent(reportId)}/medical`,
    noise: (reportId: string) =>
      `${API_BASE_PATH}/reports/${encodeURIComponent(reportId)}/noise`,
    congestion: (reportId: string) =>
      `${API_BASE_PATH}/reports/${encodeURIComponent(reportId)}/congestion`,
    compare: `${API_BASE_PATH}/reports/compare`,
  },
  bookmarks: {
    properties: `${API_BASE_PATH}/bookmarks/properties`,
  },
} as const;
