import { useEffect, useState } from 'react';
import { AppShell } from './components/AppShell';
import { addresses, compareResult, mainReport, riskDetails, savedReports as initialSaved } from './data/mockData';
import { ComparePage } from './pages/ComparePage';
import { HomePage } from './pages/HomePage';
import { LoadingPage } from './pages/LoadingPage';
import { MapSelectPage } from './pages/MapSelectPage';
import { MyPage } from './pages/MyPage';
import { Onboarding } from './pages/Onboarding';
import { ReportPage } from './pages/ReportPage';
import { RiskDetailPage } from './pages/RiskDetailPage';
import { SavedPage } from './pages/SavedPage';
import { SearchPage } from './pages/SearchPage';
import { mockService } from './services/mockService';
import type { AddressCandidate, ReportSummary, RiskType, Screen, UserProfileType } from './types/domain';

function App() {
  const [screen, setScreen] = useState<Screen>('onboarding');
  const [onboardingStep, setOnboardingStep] = useState(0);
  const [profileType, setProfileType] = useState<UserProfileType>('SINGLE');
  const [selectedAddress, setSelectedAddress] = useState<AddressCandidate>(addresses[0]);
  const [currentReport, setCurrentReport] = useState<ReportSummary>(mainReport);
  const [selectedRisk, setSelectedRisk] = useState<RiskType>('FLOOD');
  const [homeData, setHomeData] = useState({ recentReports: initialSaved.slice(0, 3), savedReports: initialSaved.slice(0, 2) });

  useEffect(() => {
    mockService.getHome().then(setHomeData);
  }, []);

  const navigate = (next: Screen) => {
    setScreen(next);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const completeOnboarding = () => {
    if (onboardingStep < 3) {
      setOnboardingStep((step) => step + 1);
      return;
    }
    navigate('home');
  };

  const selectAddress = (address: AddressCandidate) => {
    setSelectedAddress(address);
    navigate('map');
  };

  const startAnalysis = async () => {
    navigate('loading');
    const report = await mockService.createReport(selectedAddress.id, profileType);
    setCurrentReport(report);
  };

  const openDetail = (type: RiskType) => {
    setSelectedRisk(type);
    navigate('detail');
  };

  const bottomNav = screen === 'home' || screen === 'saved' || screen === 'my';

  return (
    <AppShell active={screen} navigate={navigate} bottomNav={bottomNav}>
      {screen === 'onboarding' && (
        <Onboarding
          step={onboardingStep}
          profileType={profileType}
          setProfileType={setProfileType}
          next={completeOnboarding}
        />
      )}
      {screen === 'home' && (
        <HomePage recentReports={homeData.recentReports} savedReports={homeData.savedReports} navigate={navigate} />
      )}
      {screen === 'search' && (
        <SearchPage
          candidates={addresses}
          selectAddress={selectAddress}
          onBack={() => navigate('home')}
          openMap={() => navigate('map')}
        />
      )}
      {screen === 'map' && (
        <MapSelectPage address={selectedAddress} onBack={() => navigate('search')} analyze={startAnalysis} />
      )}
      {screen === 'loading' && <LoadingPage address={selectedAddress} done={() => navigate('report')} />}
      {screen === 'report' && <ReportPage report={currentReport} navigate={navigate} openDetail={openDetail} />}
      {screen === 'detail' && (
        <RiskDetailPage detail={riskDetails[selectedRisk]} address={currentReport.address} onBack={() => navigate('report')} />
      )}
      {screen === 'compare' && <ComparePage compare={compareResult} navigate={navigate} />}
      {screen === 'saved' && <SavedPage savedReports={initialSaved} navigate={navigate} />}
      {screen === 'my' && <MyPage />}
    </AppShell>
  );
}

export default App;
