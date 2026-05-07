import type { AddressCandidate, CompareResult } from '../../types/domain';
import { apiRequest } from './apiClient';
import { apiEndpoints } from './endpoints';

export const addressApi = {
  async search(query: string) {
    const response = await apiRequest<unknown>(apiEndpoints.addresses.search, {
      query: { query },
    });

    return normalizeAddressCandidates(response);
  },

  async mapSearch(lat: number, lng: number) {
    const response = await apiRequest<unknown>(apiEndpoints.addresses.mapSearch, {
      query: { lat, lng },
    });

    return normalizeAddressCandidates(response);
  },

  compare(leftAddressId: string, rightAddressId: string) {
    return apiRequest<CompareResult>(apiEndpoints.addresses.compare, {
      query: { leftAddressId, rightAddressId },
    });
  },
};

function normalizeAddressCandidates(response: unknown): AddressCandidate[] {
  const list = Array.isArray(response)
    ? response
    : typeof response === 'object' && response !== null
      ? ((response as { addresses?: unknown[]; items?: unknown[]; results?: unknown[] }).addresses ??
        (response as { items?: unknown[] }).items ??
        (response as { results?: unknown[] }).results ??
        [])
      : [];

  return list.map((item, index) => {
    const record = item as Record<string, unknown>;
    const roadAddress = stringValue(record.roadAddress ?? record.address ?? record.addressName);
    const dong = stringValue(record.dong ?? record.dongName);
    const gu = stringValue(record.gu ?? record.guName);

    return {
      id: stringValue(record.id ?? record.addressId ?? `api_addr_${index}`),
      roadAddress,
      detailAddress: stringValue(record.detailAddress ?? record.description ?? record.placeName),
      dong,
      gu,
      lat: numberValue(record.lat ?? record.latitude),
      lng: numberValue(record.lng ?? record.lon ?? record.longitude),
    };
  });
}

function stringValue(value: unknown) {
  return typeof value === 'string' ? value : value == null ? '' : String(value);
}

function numberValue(value: unknown) {
  const number = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(number) ? number : 0;
}
