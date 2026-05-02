import type {
  AddressCandidate,
  CompareResult,
  ReportSummary,
  RiskDetail,
  RiskType,
  SavedReport,
} from '../types/domain';

export const addresses: AddressCandidate[] = [
  {
    id: 'addr_001',
    roadAddress: '서울 마포구 망원동 415-1',
    detailAddress: '잔디로7길 24 · 망원역 6번 출구 도보 6분',
    dong: '망원동',
    gu: '마포구',
    lat: 37.5561,
    lng: 126.9056,
  },
  {
    id: 'addr_002',
    roadAddress: '서울 마포구 연남동 223-19',
    detailAddress: '동교로 41길 · 홍대입구역 도보 9분',
    dong: '연남동',
    gu: '마포구',
    lat: 37.562,
    lng: 126.921,
  },
  {
    id: 'addr_003',
    roadAddress: '서울 마포구 서교동 367-12',
    detailAddress: '합정역 7분 · 상권 밀집 권역',
    dong: '서교동',
    gu: '마포구',
    lat: 37.551,
    lng: 126.914,
  },
  {
    id: 'addr_004',
    roadAddress: '서울 성동구 성수동1가 13-2',
    detailAddress: '성수역 도보 4분 · 이전 조회',
    dong: '성수동1가',
    gu: '성동구',
    lat: 37.544,
    lng: 127.043,
  },
  {
    id: 'addr_005',
    roadAddress: '서울 관악구 봉천동 967',
    detailAddress: '서울대입구역 도보 9분 · 2일 전',
    dong: '봉천동',
    gu: '관악구',
    lat: 37.481,
    lng: 126.952,
  },
];

export const mainReport: ReportSummary = {
  reportId: 'rep_001',
  address: addresses[0],
  profileType: 'SINGLE',
  totalScore: 78,
  totalGrade: 'NORMAL',
  analyzedAt: '2026.04.25',
  oneLineSummary: '의료·침수는 안심이지만, 도로 소음과 주말 혼잡이 약점이에요.',
  risks: [
    {
      type: 'FLOOD',
      label: '침수',
      score: 82,
      grade: 'SAFE',
      summary: '저지대가 아니며 최근 침수 이력이 확인되지 않았습니다.',
    },
    {
      type: 'SAFETY',
      label: '야간',
      score: 71,
      grade: 'NORMAL',
      summary: '안심귀갓길 접근성은 양호하나 일부 골목은 조도가 낮습니다.',
    },
    {
      type: 'MEDICAL',
      label: '의료',
      score: 88,
      grade: 'SAFE',
      summary: '응급실과 병의원 접근성이 우수합니다.',
    },
    {
      type: 'CONGESTION',
      label: '혼잡',
      score: 64,
      grade: 'CAUTION',
      summary: '주말 한강공원 인근 생활 혼잡에 주의가 필요합니다.',
    },
    {
      type: 'NOISE',
      label: '소음',
      score: 58,
      grade: 'CAUTION',
      summary: '도로교통 중심의 외부 생활소음 영향이 있습니다.',
    },
  ],
};

export const savedReports: SavedReport[] = [
  { report: mainReport, savedAt: '오늘', tags: ['의료 강점'] },
  {
    report: { ...mainReport, reportId: 'rep_002', address: addresses[1], totalScore: 81, totalGrade: 'SAFE' },
    savedAt: '어제',
    tags: ['안심 동네'],
  },
  {
    report: { ...mainReport, reportId: 'rep_003', address: addresses[2], totalScore: 69, totalGrade: 'NORMAL' },
    savedAt: '3일 전',
    tags: ['소음 주의'],
  },
  {
    report: { ...mainReport, reportId: 'rep_004', address: addresses[3], totalScore: 64, totalGrade: 'NORMAL' },
    savedAt: '1주 전',
    tags: ['혼잡 주의'],
  },
  {
    report: { ...mainReport, reportId: 'rep_005', address: addresses[4], totalScore: 52, totalGrade: 'CAUTION' },
    savedAt: '2주 전',
    tags: ['안전 주의'],
  },
];

export const riskDetails: Record<RiskType, RiskDetail> = {
  FLOOD: {
    type: 'FLOOD',
    title: '침수 리스크 상세',
    score: 82,
    grade: 'SAFE',
    summary: '과거 침수 이력이 적고 배수펌프장 여유량이 충분합니다.',
    description: '하천 인접성과 저지대 비율을 함께 보았을 때 직접적인 침수 취약도는 낮은 편입니다.',
    metrics: [
      { label: '해발 고도', value: '12.4m', grade: 'SAFE' },
      { label: '5년 침수 이력', value: '0건', grade: 'SAFE' },
      { label: '저지대 비율', value: '8%', grade: 'CAUTION' },
      { label: '배수펌프 용량', value: '170%', grade: 'SAFE' },
      { label: '하천 직선거리', value: '420m', grade: 'CAUTION' },
    ],
    source: '서울시 침수예측, 지형 및 배수 인프라 공개 데이터 기준',
    trend: [68, 72, 75, 74, 80, 78, 82],
  },
  SAFETY: {
    type: 'SAFETY',
    title: '치안 리스크 상세',
    score: 71,
    grade: 'NORMAL',
    summary: '큰길 접근성은 좋지만 일부 골목의 야간 보조지표가 낮습니다.',
    description: '범죄 발생을 주소 단위로 예측하지 않고, 자치구 공개 통계와 CCTV·가로등 접근성을 보조지표로 해석합니다.',
    metrics: [
      { label: '5대 범죄 발생', value: '140건' },
      { label: '평균 검거율', value: '74%', grade: 'SAFE' },
      { label: '자치구 순위', value: '9/25', grade: 'NORMAL' },
      { label: 'CCTV', value: '42대 / 반경 500m', grade: 'SAFE' },
      { label: '가로등', value: '118개 / 반경 500m', grade: 'NORMAL' },
    ],
    source: '경찰청 공개 통계, 서울시 안전 인프라 공개 데이터 기준',
    trend: [62, 65, 66, 70, 68, 72, 71],
  },
  MEDICAL: {
    type: 'MEDICAL',
    title: '의료 접근성 상세',
    score: 88,
    grade: 'SAFE',
    summary: '병의원과 응급의료 접근성이 모두 좋은 권역입니다.',
    description: '도보 및 차량 이동 반경 기준으로 생활권 내 의료 시설 접근성을 산출했습니다.',
    metrics: [
      { label: '응급실 접근', value: '차량 12분', grade: 'SAFE' },
      { label: '병의원 수', value: '28곳 / 1km', grade: 'SAFE' },
      { label: '약국 접근', value: '도보 4분', grade: 'SAFE' },
      { label: '야간 진료', value: '3곳', grade: 'NORMAL' },
    ],
    source: '서울시 의료기관, 응급의료기관 공개 데이터 기준',
    trend: [80, 82, 84, 84, 86, 88, 88],
  },
  CONGESTION: {
    type: 'CONGESTION',
    title: '혼잡 리스크 상세',
    score: 64,
    grade: 'CAUTION',
    summary: '평일 출퇴근과 주말 오후 시간대 생활 혼잡이 높아집니다.',
    description: '생활인구와 대중교통 승하차 흐름을 바탕으로 시간대별 체감 혼잡 가능성을 추정했습니다.',
    metrics: [
      { label: '출근 피크', value: '09시 88명/100m²', grade: 'CAUTION' },
      { label: '퇴근 피크', value: '18시 92명/100m²', grade: 'CAUTION' },
      { label: '심야 시간', value: '22시 32명/100m²', grade: 'SAFE' },
      { label: '가까운 역', value: '망원역 480m', grade: 'NORMAL' },
    ],
    source: '서울 생활인구, 대중교통 승하차 공개 데이터 기준',
    trend: [48, 70, 88, 58, 62, 92, 64],
  },
  NOISE: {
    type: 'NOISE',
    title: '소음 리스크 상세',
    score: 58,
    grade: 'CAUTION',
    summary: '도로교통 중심의 외부 생활소음 영향이 있는 편입니다.',
    description: '건물 내부 층간소음이 아니라 주변 도로·상권·철도 등 외부 생활소음 가능성을 추정합니다.',
    metrics: [
      { label: '도로교통 영향도', value: '72', grade: 'CAUTION' },
      { label: '소음 민원', value: '58', grade: 'CAUTION' },
      { label: '유흥업소 영향', value: '41', grade: 'NORMAL' },
      { label: '열차 소음', value: '12', grade: 'SAFE' },
    ],
    source: '서울시 소음 민원, 도로 및 생활시설 공개 데이터 기준',
    trend: [55, 57, 56, 58, 59, 57, 58],
  },
};

export const compareResult: CompareResult = {
  left: mainReport,
  right: {
    ...mainReport,
    reportId: 'rep_002',
    address: addresses[1],
    totalScore: 81,
    totalGrade: 'SAFE',
    risks: mainReport.risks.map((risk) => {
      const scores: Record<RiskType, number> = {
        FLOOD: 75,
        SAFETY: 84,
        MEDICAL: 79,
        CONGESTION: 72,
        NOISE: 80,
      };
      return { ...risk, score: scores[risk.type], grade: scores[risk.type] >= 80 ? 'SAFE' : 'NORMAL' };
    }),
  },
  recommendation:
    '1인 가구 기준으로는 연남동 223-19가 야간 안전과 외부 소음 안정도에서 더 우수해 밤 늦은 귀가가 잦다면 더 적합합니다.',
};
