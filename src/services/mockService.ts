import { addresses, compareResult, mainReport, riskDetails, savedReports } from '../data/mockData';
import type { AddressCandidate, RiskType, UserProfileType } from '../types/domain';

const wait = (ms: number) => new Promise((resolve) => window.setTimeout(resolve, ms));

export const mockService = {
  async searchAddresses(query: string): Promise<AddressCandidate[]> {
    await wait(120);
    if (!query.trim()) {
      return addresses.slice(0, 4);
    }

    return addresses.filter((address) => address.roadAddress.includes(query) || address.dong.includes(query));
  },

  async createReport(addressId: string, profileType: UserProfileType) {
    await wait(300);
    const address = addresses.find((item) => item.id === addressId) ?? addresses[0];
    return {
      ...mainReport,
      address,
      profileType,
    };
  },

  async getRiskDetail(type: RiskType) {
    await wait(120);
    return riskDetails[type];
  },

  async getHome() {
    await wait(100);
    return {
      recentReports: savedReports.slice(0, 3),
      savedReports: savedReports.slice(0, 2),
    };
  },

  async getSavedReports() {
    await wait(100);
    return savedReports;
  },

  async compareReports() {
    await wait(100);
    return compareResult;
  },
};
