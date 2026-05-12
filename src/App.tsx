import { useCallback, useEffect, useState } from 'react';
import { AppShell } from './components/AppShell';
import { ComparePage } from './pages/ComparePage';
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { MapSelectPage } from './pages/MapSelectPage';
import { MyPage } from './pages/MyPage';
import { Onboarding } from './pages/Onboarding';
import { SearchPage } from './pages/SearchPage';
import { addressApi, authApi, userApi } from './services/api';
import { authStorage } from './services/authStorage';
import {
  buildAuthorizeUrl,
  getProviderFromCallbackPath,
  getRedirectUri,
  oauthSession,
  providerToWire,
} from './services/oauth';
import type { AddressCandidate, CompareResult, Screen, SocialProvider, UserProfileType } from './types/domain';

function App() {
  const [screen, setScreen] = useState<Screen>('login');
  const [accessToken, setAccessToken] = useState<string | null>(() => authStorage.getAccessToken());
  const [onboardingStep, setOnboardingStep] = useState(0);
  const [profileType, setProfileType] = useState<UserProfileType>('SINGLE');
  const [selectedAddress, setSelectedAddress] = useState<AddressCandidate | null>(null);
  const [compareTargets, setCompareTargets] = useState<AddressCandidate[]>([]);
  const [currentCompare, setCurrentCompare] = useState<CompareResult | null>(null);
  const [compareLoading, setCompareLoading] = useState(false);
  const [compareError, setCompareError] = useState('');
  const [loginError, setLoginError] = useState('');

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
    const errorParam = params.get('error');

    window.history.replaceState({}, '', '/');

    if (errorParam || !code) {
      oauthSession.clear();
      setLoginError(errorParam ? '소셜 로그인이 취소되었습니다.' : '로그인 정보를 확인할 수 없습니다.');
      setScreen('login');
      return;
    }

    try {
      const data = await authApi.login({
        provider: providerToWire(provider),
        code,
        redirect_uri: getRedirectUri(provider),
      });

      authStorage.saveTokens(data);
      setAccessToken(data.access_token);
      oauthSession.clear();
      navigate(data.is_new_user ? 'onboarding' : 'home');
    } catch {
      oauthSession.clear();
      setLoginError('로그인 처리 중 오류가 발생했습니다. 다시 시도해주세요.');
      setScreen('login');
    }
  };

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
      .compare(compareTargets[0].id, compareTargets[1].id)
      .then(setCurrentCompare)
      .catch(() => {
        setCurrentCompare(null);
        setCompareError('주소 비교 API 연결에 실패했습니다.');
      })
      .finally(() => {
        setCompareLoading(false);
      });
  }, [screen, compareTargets]);

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
        await userApi.updateWeights(accessToken, profileType);
      } catch {
        // 가중치 저장 실패가 홈 진입을 막지는 않습니다.
      }
    }

    navigate('home');
  };

  const selectAddress = (address: AddressCandidate) => {
    setSelectedAddress(address);
    setCompareTargets((current) => {
      const withoutDuplicate = current.filter((item) => item.id !== address.id);
      return [address, ...withoutDuplicate].slice(0, 2);
    });
    navigate('map');
  };

  const searchAddresses = useCallback((query: string) => addressApi.search(query), []);

  const openMapFromSearch = async () => {
    if (!navigator.geolocation) {
      navigate('map');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setSelectedAddress(createCoordinateAddress(position.coords.latitude, position.coords.longitude));
        navigate('map');
      },
      () => {
        setSelectedAddress(null);
        navigate('map');
      },
    );
  };

  const pickLocationOnMap = (lat: number, lng: number) => {
    setSelectedAddress(createCoordinateAddress(lat, lng));
  };

  const handleLogout = async () => {
    if (accessToken) {
      try {
        await authApi.logout(accessToken);
      } catch {
        // 서버 로그아웃 실패 시에도 로컬 세션은 정리합니다.
      }
    }

    authStorage.clear();
    setAccessToken(null);
    setOnboardingStep(0);
    setSelectedAddress(null);
    setCompareTargets([]);
    setCurrentCompare(null);
    navigate('login');
  };

  const bottomNav = screen === 'home' || screen === 'my';

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
      {screen === 'home' && <HomePage navigate={navigate} />}
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
          confirm={() => navigate('home')}
          onPickLocation={pickLocationOnMap}
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
      {screen === 'my' && <MyPage token={accessToken} onLogout={handleLogout} />}
    </AppShell>
  );
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

export default App;
