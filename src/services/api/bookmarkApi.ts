import type { SavedReport } from '../../types/domain';
import { apiRequest } from './apiClient';
import { apiEndpoints } from './endpoints';

export const bookmarkApi = {
  getProperties(token: string) {
    return apiRequest<SavedReport[]>(apiEndpoints.bookmarks.properties, { token });
  },

  saveProperty(token: string, reportId: string) {
    return apiRequest<SavedReport>(apiEndpoints.bookmarks.properties, {
      method: 'POST',
      token,
      body: JSON.stringify({ reportId }),
    });
  },

  deleteProperty(token: string, id: string) {
    return apiRequest<void>(apiEndpoints.bookmarks.property(id), {
      method: 'DELETE',
      token,
    });
  },
};
