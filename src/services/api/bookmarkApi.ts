import type { SavedReport } from '../../types/domain';
import { apiRequest } from './apiClient';
import { apiEndpoints } from './endpoints';

export const bookmarkApi = {
  getProperties() {
    return apiRequest<SavedReport[]>(apiEndpoints.bookmarks.properties);
  },

  saveProperty(reportId: string) {
    return apiRequest<SavedReport>(apiEndpoints.bookmarks.properties, {
      method: 'POST',
      body: JSON.stringify({ reportId }),
    });
  },

  deleteProperty(id: string) {
    return apiRequest<void>(apiEndpoints.bookmarks.property(id), {
      method: 'DELETE',
    });
  },
};
