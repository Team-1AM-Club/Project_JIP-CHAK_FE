import type { AddressCandidate, CompareResult } from '../../types/domain';
import { apiRequest } from './apiClient';
import { apiEndpoints } from './endpoints';

export const addressApi = {
  search(query: string) {
    return apiRequest<AddressCandidate[]>(apiEndpoints.addresses.search, {
      query: { query },
    });
  },

  mapSearch(lat: number, lng: number) {
    return apiRequest<AddressCandidate[]>(apiEndpoints.addresses.mapSearch, {
      query: { lat, lng },
    });
  },

  compare(leftAddressId: string, rightAddressId: string) {
    return apiRequest<CompareResult>(apiEndpoints.addresses.compare, {
      query: { leftAddressId, rightAddressId },
    });
  },
};
