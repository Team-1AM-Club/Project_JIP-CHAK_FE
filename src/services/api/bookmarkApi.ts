import type {
  BookmarkPropertiesData,
  BookmarkPropertiesQuery,
  DeletePropertyData,
  SavePropertyData,
  SavePropertyPayload,
} from '../../types/domain';
import { apiRequest } from './apiClient';
import { apiEndpoints } from './endpoints';

export const bookmarkApi = {
  getProperties(params: BookmarkPropertiesQuery = {}, token?: string | null) {
    return apiRequest<BookmarkPropertiesData>(apiEndpoints.bookmarks.properties, {
      token: token ?? undefined,
      query: {
        ...(params.status ? { status: params.status } : {}),
        ...(params.page !== undefined ? { page: params.page } : {}),
        ...(params.size !== undefined ? { size: params.size } : {}),
      },
    });
  },

  saveProperty(payload: SavePropertyPayload, token?: string | null) {
    return apiRequest<SavePropertyData>(apiEndpoints.bookmarks.properties, {
      method: 'POST',
      token: token ?? undefined,
      body: JSON.stringify(payload),
    });
  },

  deleteProperty(id: number | string, token?: string | null) {
    return apiRequest<DeletePropertyData>(`${apiEndpoints.bookmarks.properties}/${id}`, {
      method: 'DELETE',
      token: token ?? undefined,
    });
  },
};
