import { useCallback, useEffect, useRef, useState } from 'react';
import { AppShell } from './components/AppShell';
import type { ResolvedMapAddress } from './components/NaverMap';
import { ComparePage } from './pages/ComparePage';
import { HomePage } from './pages/HomePage';
import { LoadingPage } from './pages/LoadingPage';
import { LoginPage } from './pages/LoginPage';
import { MapSelectPage } from './pages/MapSelectPage';
import { MyPage } from './pages/MyPage';
import { Onboarding } from './pages/Onboarding';
import { ReportPage } from './pages/ReportPage';
import { SavedPage } from './pages/SavedPage';
import { SearchPage } from './pages/SearchPage';
import { WeightSettingsPage } from './pages/WeightSettingsPage';
import { ApiError, addressApi, authApi, bookmarkApi, reportApi, userApi } from './services/api';
import { authStorage } from './services/authStorage';
import {
  buildAuthorizeUrl,
  getProviderFromCallbackPath,
  getRedirectUri,
  oauthSession,
  providerToWire,
} from './services/oauth';
import type {
  AddressCandidate,
  AccountWithdrawalResult,
  BookmarkProperty,
  CompareResult,
  Grade,
  GradeLabel,
  RecentAddressSummary,
  SavedReportPreview,
  ScoreStatus,
  Screen,
  SocialProvider,
  UserProfileType,
} from './types/domain';

function App() {
  const [screen, setScreen] = useState<Screen>('login');
  const [accessToken, setAccessToken] = useState<string | null>(() => authStorage.getAccessToken());
  const [onboardingStep, setOnboardingStep] = useState(0);
  const [profileType, setProfileType] = useState<UserProfileType>('SINGLE');
  const [selectedAddress, setSelectedAddress] = useState<AddressCandidate | null>(null);
  const [compareTargets, setCompareTargets] = useState<AddressCandidate[]>([]);
  const [currentCompare, setCurrentCompare] = useState<CompareResult | null>(null);
  const [recentAddresses, setRecentAddresses] = useState<RecentAddressSummary[]>([]);
  const [savedReports, setSavedReports] = useState<SavedReportPreview[]>([]);
  const [compareLoading, setCompareLoading] = useState(false);
  const [compareError, setCompareError] = useState('');
  const [loginError, setLoginError] = useState('');
  const [pendingTaskId, setPendingTaskId] = useState<string | null>(null);
  const [pendingTaskEta, setPendingTaskEta] = useState<number | null>(null);
  const [pendingDongName, setPendingDongName] = useState<string | null>(null);
  const [pendingAnalysisAddress, setPendingAnalysisAddress] = useState<string | null>(null);
  const [currentReportId, setCurrentReportId] = useState<string | null>(null);
  const [isCreatingReport, setIsCreatingReport] = useState(false);
  const [createReportError, setCreateReportError] = useState('');
  const [selectedDongCode, setSelectedDongCode] = useState<string | null>(null);
  const [bookmarkPendingId, setBookmarkPendingId] = useState<string | null>(null);
  const [savedListError, setSavedListError] = useState('');
  const mapSearchTimerRef = useRef<number | null>(null);

  useEffect(() => {
    const callbackProvider = getProviderFromCallbackPath(window.location.pathname);
    if (callbackProvider) {
      handleOAuthCallback(callbackProvider);
      return;
    }

    const storedAccessToken = authStorage.getAccessToken();
    const refreshToken = authStorage.getRefreshToken();

    if (storedAccessToken) {
      setAccessToken(storedAccessToken);
      setScreen('home');
      return;
    }

    if (!refreshToken) {
      return;
    }

    authApi
      .reissue(refreshToken)
      .then((data) => {
        authStorage.saveTokens(data);
        setAccessToken(data.access_token);
        setScreen('home');
      })
      .catch(() => {
        authStorage.clear();
      });
  }, []);

  const handleOAuthCallback = async (provider: SocialProvider) => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    const state = params.get('state');
    const errorParam = params.get('error');

    window.history.replaceState({}, '', '/');

    if (errorParam || !code) {
      oauthSession.clear();
      setLoginError(errorParam ? '소셜 로그인이 취소되었습니다.' : '로그인 정보를 확인할 수 없습니다.');
      setScreen('login');
      return;
    }

    const expectedState = oauthSession.recallState();

    if (provider === 'NAVER' && expectedState && state !== expectedState) {
      oauthSession.clear();
      setLoginError('로그인 인증 정보가 일치하지 않습니다. 다시 시도해주세요.');
      setScreen('login');
      return;
    }

    try {
      const data = await authApi.login({
        provider: providerToWire(provider),
        code,
        redirect_uri: getRedirectUri(provider),
        ...(state ? { state } : {}),
      });

      authStorage.saveTokens(data);
      setAccessToken(data.access_token);
      oauthSession.clear();
      navigate(data.is_new_user ? 'onboarding' : 'home');
    } catch (error) {
      oauthSession.clear();
      setLoginError(messageForLoginError(error));
      setScreen('login');
    }
  };

  useEffect(() => {
    if (!accessToken) {
      setSavedReports([]);
      return;
    }

    let ignore = false;

    bookmarkApi
      .getProperties({}, accessToken)
      .then((data) => {
        if (!ignore) {
          setSavedReports(data.content.map(bookmarkPropertyToSavedPreview));
        }
      })
      .catch(() => {
        if (!ignore) {
          setSavedReports([]);
        }
      });

    return () => {
      ignore = true;
    };
  }, [accessToken]);

  useEffect(() => {
    if (screen !== 'compare') {
      return;
    }

    setCompareError('');

    if (compareTargets.length < 2) {
      setCurrentCompare(null);
      return;
    }

    setCompareLoading(true);
    addressApi
      .compare(compareTargets[0].id, compareTargets[1].id, accessToken)
      .then(setCurrentCompare)
      .catch(() => {
        setCurrentCompare(null);
        setCompareError('주소 비교 API 연결에 실패했습니다.');
      })
      .finally(() => {
        setCompareLoading(false);
      });
  }, [screen, compareTargets, accessToken]);

  const navigate = (next: Screen) => {
    setScreen(next);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLogin = async (provider: SocialProvider) => {
    setLoginError('');
    const authorizeUrl = buildAuthorizeUrl(provider);
    window.location.assign(authorizeUrl);
  };

  const completeOnboarding = async () => {
    if (onboardingStep < 3) {
      setOnboardingStep((step) => step + 1);
      return;
    }

    if (accessToken) {
      try {
        await userApi.updateProfileType(accessToken, profileType);
      } catch {
        // 가중치 저장 실패가 홈 진입을 막지는 않습니다.
      }
    }

    navigate('home');
  };

  const selectAddress = (address: AddressCandidate) => {
    setSelectedAddress(address);
    setSelectedDongCode(null);
    setCompareTargets((current) => {
      const withoutDuplicate = current.filter((item) => item.id !== address.id);
      return [address, ...withoutDuplicate].slice(0, 2);
    });
    navigate('map');
  };

  const searchAddresses = useCallback((query: string) => addressApi.search(query, accessToken), [accessToken]);

  const resolveMapAddress = useCallback(
    async (lat: number, lng: number) => {
      setSelectedAddress(createCoordinateAddress(lat, lng));
      setSelectedDongCode(null);

      if (mapSearchTimerRef.current) {
        window.clearTimeout(mapSearchTimerRef.current);
      }

      mapSearchTimerRef.current = window.setTimeout(async () => {
        try {
          const [candidate] = await addressApi.mapSearch(lat, lng, accessToken);

          if (candidate) {
            setSelectedAddress(candidate);
          }
        } catch {
          // 좌표 fallback을 이미 표시했으므로 지도 검색 실패는 화면 전환을 막지 않습니다.
        } finally {
          mapSearchTimerRef.current = null;
        }
      }, 350);
    },
    [accessToken],
  );

  const openMapFromSearch = async () => {
    if (!navigator.geolocation) {
      navigate('map');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        void resolveMapAddress(position.coords.latitude, position.coords.longitude);
        navigate('map');
      },
      () => {
        setSelectedAddress(null);
        navigate('map');
      },
    );
  };

  const pickLocationOnMap = (lat: number, lng: number) => {
    void resolveMapAddress(lat, lng);
  };

  const handleAddressResolved = useCallback((result: ResolvedMapAddress) => {
    const fallbackRoad = result.roadAddress || result.jibunAddress;
    if (!fallbackRoad) {
      return;
    }

    setSelectedAddress({
      id: `coord_${result.lat.toFixed(6)}_${result.lng.toFixed(6)}`,
      roadAddress: result.roadAddress || result.jibunAddress,
      detailAddress: result.jibunAddress || result.roadAddress,
      dong: result.dong || '선택 위치',
      gu: result.gu || '서울',
      lat: result.lat,
      lng: result.lng,
    });
    setSelectedDongCode(result.dongCode ?? null);
  }, []);

  const confirmSelectedAddress = async () => {
    if (!selectedAddress || isCreatingReport) {
      return;
    }

    if (!isInsideSeoul(selectedAddress.lat, selectedAddress.lng)) {
      setCreateReportError('서울시 내 위치만 분석할 수 있어요. 서울 안의 다른 위치를 선택해 주세요.');
      return;
    }

    const hasResolvedRoad =
      selectedAddress.roadAddress &&
      selectedAddress.roadAddress !== '지도에서 선택한 위치';
    const hasResolvedJibun =
      selectedAddress.detailAddress && !selectedAddress.detailAddress.startsWith('위도 ');

    if (!hasResolvedRoad && !hasResolvedJibun) {
      setCreateReportError('주소를 불러오고 있어요. 잠시 후 다시 시도해 주세요.');
      return;
    }

    setIsCreatingReport(true);
    setCreateReportError('');

    const payloadAddress = (hasResolvedRoad
      ? selectedAddress.roadAddress
      : selectedAddress.detailAddress) as string;

    try {
      const result = await reportApi.create(
        {
          address: payloadAddress,
          ...(hasResolvedRoad ? { road_addr: selectedAddress.roadAddress } : {}),
          ...(hasResolvedJibun ? { jibun_addr: selectedAddress.detailAddress } : {}),
          lat: selectedAddress.lat,
          lng: selectedAddress.lng,
          ...(selectedDongCode ? { dong_code: selectedDongCode } : {}),
          source: 'MAP',
        },
        accessToken,
      );

      setPendingAnalysisAddress(result.address ?? payloadAddress);
      setPendingDongName(result.dong_name ?? null);

      if (result.status === 'READY') {
        setPendingTaskId(null);
        setPendingTaskEta(null);
        setCurrentReportId(result.report_id);
      } else {
        setPendingTaskId(result.task_id);
        setPendingTaskEta(result.estimated_seconds ?? null);
        setCurrentReportId(null);
      }

      navigate('loading');
    } catch (e) {
      setCreateReportError(messageForCreateError(e));
    } finally {
      setIsCreatingReport(false);
    }
  };

  const handleAnalysisCompleted = (reportId: string) => {
    setCurrentReportId(reportId);
    setPendingTaskId(null);
    setPendingTaskEta(null);
    navigate('report');
  };

  const handleReportBack = () => {
    setCurrentReportId(null);
    navigate('home');
  };

  const handleToggleSavedBookmark = async (id: string) => {
    if (!accessToken || bookmarkPendingId) {
      return;
    }

    const previous = savedReports;
    setBookmarkPendingId(id);
    setSavedListError('');
    setSavedReports(previous.filter((item) => item.id !== id));

    try {
      await bookmarkApi.deleteProperty(id, accessToken);
    } catch (e) {
      if (e instanceof ApiError && e.code === 'PROPERTY_NOT_BOOKMARKED') {
        // 서버 상태가 이미 해제됨 — 낙관적 제거 유지
      } else {
        setSavedReports(previous);
        setSavedListError(messageForDeleteBookmarkError(e));
      }
    } finally {
      setBookmarkPendingId(null);
    }
  };

  const handleAnalysisCancelled = () => {
    setPendingTaskId(null);
    setPendingTaskEta(null);
    setCurrentReportId(null);
    setPendingAnalysisAddress(null);
    setPendingDongName(null);
    navigate('map');
  };

  const resetSessionState = () => {
    setAccessToken(null);
    setOnboardingStep(0);
    setSelectedAddress(null);
    setCompareTargets([]);
    setCurrentCompare(null);
    setRecentAddresses([]);
    setSavedReports([]);
    setPendingTaskId(null);
    setPendingTaskEta(null);
    setPendingDongName(null);
    setPendingAnalysisAddress(null);
    setCurrentReportId(null);
    setCreateReportError('');
  };

  const clearClientSession = () => {
    authStorage.clear();
    oauthSession.clear();
    window.localStorage.removeItem('jipchak.profileType');
    document.cookie.split(';').forEach((cookie) => {
      const cookieName = cookie.split('=')[0]?.trim();

      if (cookieName) {
        document.cookie = `${cookieName}=; Max-Age=0; path=/`;
      }
    });
  };

  const handleLogout = async () => {
    if (accessToken) {
      try {
        await authApi.logout(accessToken, authStorage.getRefreshToken());
      } catch {
        // 서버 로그아웃 실패 시에도 로컬 세션은 정리합니다.
      }
    }

    authStorage.clear();
    setAccessToken(null);
    setOnboardingStep(0);
    setSelectedAddress(null);
    setSelectedDongCode(null);
    setCompareTargets([]);
    setCurrentCompare(null);
    setRecentAddresses([]);
    setSavedReports([]);
    setPendingTaskId(null);
    setPendingTaskEta(null);
    setPendingDongName(null);
    setPendingAnalysisAddress(null);
    setCurrentReportId(null);
    setCreateReportError('');
    setBookmarkPendingId(null);
    setSavedListError('');
    navigate('login');
  };

  const handleWithdraw = async (): Promise<AccountWithdrawalResult> => {
    if (!accessToken) {
      clearClientSession();
      resetSessionState();
      return {
        userName: '사용자',
        deletedAt: new Date().toISOString(),
      };
    }

    const result = await userApi.deleteMe(accessToken);
    clearClientSession();
    resetSessionState();

    return result;
  };

  const handleWithdrawalComplete = () => {
    window.location.assign('/');
  };

  const bottomNav = screen === 'saved' || screen === 'home' || screen === 'my';

  return (
    <AppShell active={screen} navigate={navigate} bottomNav={bottomNav}>
      {screen === 'login' && <LoginPage onLogin={handleLogin} externalErrorMessage={loginError} />}
      {screen === 'onboarding' && (
        <Onboarding
          step={onboardingStep}
          profileType={profileType}
          setProfileType={setProfileType}
          next={completeOnboarding}
        />
      )}
      {screen === 'saved' && (
        <SavedPage
          savedReports={savedReports}
          onToggleBookmark={handleToggleSavedBookmark}
          pendingBookmarkId={bookmarkPendingId}
          errorMessage={savedListError}
        />
      )}
      {screen === 'home' && (
        <HomePage navigate={navigate} recentAddresses={recentAddresses} savedReports={savedReports} />
      )}
      {screen === 'search' && (
        <SearchPage
          selectAddress={selectAddress}
          onBack={() => navigate('home')}
          openMap={openMapFromSearch}
          searchAddresses={searchAddresses}
        />
      )}
      {screen === 'map' && (
        <MapSelectPage
          address={selectedAddress}
          onBack={() => navigate('search')}
          confirm={confirmSelectedAddress}
          onPickLocation={pickLocationOnMap}
          onAddressResolved={handleAddressResolved}
          isSubmitting={isCreatingReport}
          errorMessage={createReportError}
        />
      )}
      {screen === 'loading' && (
        <LoadingPage
          taskId={pendingTaskId}
          reportId={currentReportId}
          token={accessToken}
          estimatedSeconds={pendingTaskEta}
          dongName={pendingDongName}
          address={pendingAnalysisAddress}
          onCompleted={handleAnalysisCompleted}
          onCancel={handleAnalysisCancelled}
        />
      )}
      {screen === 'report' && currentReportId && (
        <ReportPage
          reportId={currentReportId}
          token={accessToken}
          onBack={handleReportBack}
        />
      )}
      {screen === 'compare' && (
        <ComparePage
          compare={currentCompare}
          isLoading={compareLoading}
          errorMessage={compareError}
          navigate={navigate}
        />
      )}
      {screen === 'weights' && (
        <WeightSettingsPage token={accessToken} onBack={() => navigate('my')} />
      )}
      {screen === 'my' && (
        <MyPage
          token={accessToken}
          onLogout={handleLogout}
          onWithdraw={handleWithdraw}
          onWithdrawalComplete={handleWithdrawalComplete}
          onOpenWeightSettings={() => navigate('weights')}
        />
      )}
    </AppShell>
  );
}

function bookmarkPropertyToSavedPreview(item: BookmarkProperty): SavedReportPreview {
  return {
    id: String(item.property_id),
    reportId: String(item.report_id),
    address: item.address,
    detail: item.description,
    score: item.score,
    grade: gradeFromLabel(item.grade) ?? gradeFromScoreStatus(item.score_status),
    savedAtLabel: item.saved_at,
    isBookmarked: item.bookmarked,
  };
}

function gradeFromLabel(label: GradeLabel | undefined): Grade | undefined {
  switch (label) {
    case '안심':
      return 'SAFE';
    case '양호':
      return 'NORMAL';
    case '주의':
      return 'CAUTION';
    case '경고':
    case '위험':
      return 'DANGER';
    default:
      return undefined;
  }
}

function gradeFromScoreStatus(status: ScoreStatus | undefined): Grade | undefined {
  switch (status) {
    case 'SAFE':
      return 'SAFE';
    case 'CAUTION':
      return 'CAUTION';
    case 'RISK':
      return 'DANGER';
    default:
      return undefined;
  }
}

function createCoordinateAddress(lat: number, lng: number): AddressCandidate {
  return {
    id: `coord_${lat.toFixed(6)}_${lng.toFixed(6)}`,
    roadAddress: '지도에서 선택한 위치',
    detailAddress: `위도 ${lat.toFixed(6)} · 경도 ${lng.toFixed(6)}`,
    dong: '선택 위치',
    gu: '서울',
    lat,
    lng,
  };
}

const SEOUL_BBOX = {
  minLat: 37.413,
  maxLat: 37.715,
  minLng: 126.734,
  maxLng: 127.269,
};

function isInsideSeoul(lat: number, lng: number) {
  return (
    Number.isFinite(lat) &&
    Number.isFinite(lng) &&
    lat >= SEOUL_BBOX.minLat &&
    lat <= SEOUL_BBOX.maxLat &&
    lng >= SEOUL_BBOX.minLng &&
    lng <= SEOUL_BBOX.maxLng
  );
}

function messageForLoginError(error: unknown): string {
  if (error instanceof ApiError) {
    const serverMessage = error.message && !error.message.startsWith('API request failed')
      ? error.message
      : undefined;

    if (serverMessage) {
      return serverMessage;
    }

    if (error.status === 400) {
      return '로그인 정보를 확인할 수 없습니다. 다시 시도해주세요.';
    }
  }

  return '로그인 처리 중 오류가 발생했습니다. 다시 시도해주세요.';
}

function messageForDeleteBookmarkError(error: unknown): string {
  if (!(error instanceof ApiError)) {
    return '저장 해제 중 오류가 발생했어요. 잠시 후 다시 시도해 주세요.';
  }

  switch (error.code) {
    case 'PROPERTY_NOT_BOOKMARKED':
      return '이미 저장이 해제된 매물이에요.';
    case 'INVALID_TOKEN':
    case 'EXPIRED_TOKEN':
      return '로그인이 만료됐어요. 다시 로그인해 주세요.';
    default:
      return error.message || '저장 해제 중 오류가 발생했어요. 잠시 후 다시 시도해 주세요.';
  }
}

function messageForCreateError(error: unknown): string {
  if (!(error instanceof ApiError)) {
    return '분석 요청 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.';
  }

  const serverMessage = error.message && !error.message.startsWith('API request failed')
    ? error.message
    : undefined;

  switch (error.code) {
    case 'INVALID_INPUT_VALUE':
      return serverMessage ?? '주소 정보가 올바르지 않습니다. 다시 선택해 주세요.';
    case 'INVALID_LOCATION':
      return serverMessage ?? '분석할 수 없는 위치입니다. 다른 위치를 선택해 주세요.';
    case 'OUT_OF_SERVICE_AREA':
      return serverMessage ?? '서울시 내 주소만 분석할 수 있어요.';
    case 'INVALID_TOKEN':
      return serverMessage ?? '로그인이 만료됐어요. 다시 로그인해 주세요.';
    case 'EXTERNAL_API_ERROR':
      return serverMessage ?? '외부 데이터 조회에 실패했습니다. 잠시 후 다시 시도해 주세요.';
    case 'ANALYSIS_FAILED':
      return serverMessage ?? '분석 처리 중 오류가 발생했습니다. 다시 시도해 주세요.';
    default:
      if (serverMessage && error.code) {
        return `${serverMessage} (${error.code})`;
      }
      if (serverMessage) {
        return serverMessage;
      }
      return '분석 요청 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.';
  }
}

export default App;
