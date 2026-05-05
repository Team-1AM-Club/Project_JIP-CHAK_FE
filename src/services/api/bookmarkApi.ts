import type {
  BookmarkPropertiesQuery,
  BookmarkPropertiesResponse,
  DeletePropertyResponse,
  SavePropertyRequest,
  SavePropertyResponse,
} from '../../types/domain';
import { apiRequest } from './apiClient';
import { apiEndpoints } from './endpoints';

export const bookmarkApi = {
  /**
   * 저장 매물 목록 조회.
   * 필터(status: ALL/SAFE/CAUTION/RISK) + 페이지네이션 (page/size).
   * 응답에 filter_counts(탭별 카운트) + content[] + page/size/total_elements 포함.
   */
  getProperties(params: BookmarkPropertiesQuery = {}) {
    return apiRequest<BookmarkPropertiesResponse>(apiEndpoints.bookmarks.properties, {
      query: params as Record<string, unknown>,
    });
  },

  /**
   * 매물 북마크 저장.
   * 응답은 토글 결과만 ({ property_id, report_id, bookmarked }) — 매물 상세 없음.
   * 이미 저장된 매물이면 ApiError(code='PROPERTY_ALREADY_BOOKMARKED').
   */
  saveProperty(payload: SavePropertyRequest) {
    return apiRequest<SavePropertyResponse>(apiEndpoints.bookmarks.properties, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  /**
   * 매물 북마크 해제.
   * id는 property_id (저장 해제할 매물 ID).
   * 응답은 토글 결과만 ({ property_id, bookmarked: false }).
   * 저장돼 있지 않은 매물이면 ApiError(code='PROPERTY_NOT_BOOKMARKED').
   */
  deleteProperty(id: string) {
    return apiRequest<DeletePropertyResponse>(apiEndpoints.bookmarks.property(id), {
      method: 'DELETE',
    });
  },
};
