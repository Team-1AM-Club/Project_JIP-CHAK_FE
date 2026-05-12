import { Bell, ChevronRight, LogOut, Moon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Card, Header } from '../components/ui';
import { userApi } from '../services/api';
import type { RiskWeights, UserProfile, UserProfileType, UserSettings } from '../types/domain';

const profileLabel: Record<UserProfileType, string> = {
  SINGLE: '청년 1인 가구',
  COUPLE: '신혼 / 예비부부',
  FAMILY: '부모 동거 가구',
};

const profileOrder: UserProfileType[] = ['SINGLE', 'COUPLE', 'FAMILY'];
const PROFILE_TYPE_STORAGE_KEY = 'jipchak.profileType';

const profileWeightPresets: Record<UserProfileType, RiskWeights> = {
  SINGLE: {
    security: 30,
    noise: 25,
    medical: 15,
    flood: 15,
    congestion: 15,
  },
  COUPLE: {
    security: 25,
    noise: 25,
    medical: 15,
    flood: 15,
    congestion: 20,
  },
  FAMILY: {
    security: 30,
    noise: 15,
    medical: 25,
    flood: 15,
    congestion: 15,
  },
};

const profileWeightSummary: Record<UserProfileType, string> = {
  SINGLE: '안전·소음 가중치 적용 중',
  COUPLE: '소음·혼잡 가중치 적용 중',
  FAMILY: '안전·의료 가중치 적용 중',
};

export function MyPage({ token, onLogout }: { token: string | null; onLogout: () => Promise<void> }) {
  const [profile, setProfile] = useState<UserProfile>({
    id: 'local',
    nickname: '지수',
    profileType: getStoredProfileType() ?? 'SINGLE',
  });
  const [settings, setSettings] = useState<UserSettings>({
    notificationsEnabled: true,
    darkMode: 'SYSTEM',
  });
  const [statusMessage, setStatusMessage] = useState('');
  const [isUpdatingWeights, setIsUpdatingWeights] = useState(false);
  const nickname = profile.nickname || '사용자';
  const currentProfileType = profileLabel[profile.profileType] ? profile.profileType : 'SINGLE';

  useEffect(() => {
    if (!token) {
      return;
    }

    let ignore = false;

    Promise.all([userApi.getMyProfile(token), userApi.getSettings(token)])
      .then(([nextProfile, nextSettings]) => {
        if (!ignore) {
          setProfile({
            ...nextProfile,
            profileType: getStoredProfileType() ?? nextProfile.profileType,
          });
          setSettings(nextSettings);
        }
      })
      .catch(() => {
        if (!ignore) {
          setStatusMessage('사용자 정보를 불러오지 못해 기본 정보를 표시합니다.');
        }
      });

    return () => {
      ignore = true;
    };
  }, [token]);

  const updateProfileType = async () => {
    const currentIndex = profileOrder.indexOf(currentProfileType);
    const nextType = profileOrder[(currentIndex + 1) % profileOrder.length];
    const previousType = currentProfileType;

    setProfile((current) => ({ ...current, profileType: nextType }));
    storeProfileType(nextType);
    setStatusMessage('');

    if (!token) {
      return;
    }

    setIsUpdatingWeights(true);

    try {
      const nextProfile = await userApi.updateProfileType(token, nextType);
      await userApi.updateWeights(token, profileWeightPresets[nextType]);
      setProfile({ ...nextProfile, profileType: nextType });
      setStatusMessage('가중치가 재설정되었습니다.');
    } catch {
      storeProfileType(previousType);
      setProfile((current) => ({ ...current, profileType: previousType }));
      setStatusMessage('가중치 재설정 API 요청에 실패했습니다.');
    } finally {
      setIsUpdatingWeights(false);
    }
  };

  const toggleNotifications = async () => {
    const nextSettings = {
      ...settings,
      notificationsEnabled: !settings.notificationsEnabled,
    };
    setSettings(nextSettings);

    if (!token) {
      return;
    }

    try {
      const updated = await userApi.updateSettings(token, nextSettings);
      setSettings(updated);
      setStatusMessage('알림 설정이 저장되었습니다.');
    } catch {
      setStatusMessage('설정 수정 API 요청에 실패했습니다.');
    }
  };

  const cycleDarkMode = async () => {
    const nextDarkMode: UserSettings['darkMode'] = settings.darkMode === 'DARK' ? 'LIGHT' : 'DARK';
    const nextSettings = { ...settings, darkMode: nextDarkMode };
    setSettings(nextSettings);

    if (!token) {
      return;
    }

    try {
      const updated = await userApi.updateSettings(token, nextSettings);
      setSettings(updated);
      setStatusMessage('다크 모드 설정이 저장되었습니다.');
    } catch {
      setStatusMessage('설정 수정 API 요청에 실패했습니다.');
    }
  };

  const refreshProfile = async () => {
    if (!token) {
      setStatusMessage('로그인 토큰이 없어 프로필 수정 API를 호출할 수 없습니다.');
      return;
    }

    try {
      const updated = await userApi.updateMyProfile(token, {
        nickname: profile.nickname,
        profileType: profile.profileType,
      });
      setProfile(updated);
      setStatusMessage('프로필이 저장되었습니다.');
    } catch {
      setStatusMessage('프로필 수정 API 요청에 실패했습니다.');
    }
  };

  return (
    <div className="screen my-screen">
      <Header title="마이페이지" action={<span />} />

      <Card className="user-card">
        <div className="avatar">{nickname.slice(0, 1)}</div>
        <div>
          <h1>{nickname}님의 집:착</h1>
          <p>{profileLabel[currentProfileType]} · {profileWeightSummary[currentProfileType]}</p>
        </div>
        <button onClick={refreshProfile}>설정</button>
      </Card>

      {statusMessage && <p className="inline-status">{statusMessage}</p>}

      <h2 className="subhead">가구 유형</h2>
      <Card className="profile-summary">
        <div className="avatar small">1</div>
        <div>
          <strong>{profileLabel[currentProfileType]}</strong>
          <small>{profileWeightSummary[currentProfileType]}</small>
        </div>
        <button onClick={updateProfileType} disabled={isUpdatingWeights}>
          {isUpdatingWeights ? '저장 중' : '변경'}
        </button>
      </Card>

      <MenuSection
        title="앱 설정"
        notificationsEnabled={settings.notificationsEnabled}
        darkModeEnabled={settings.darkMode === 'DARK'}
        onToggleNotifications={toggleNotifications}
        onToggleDarkMode={cycleDarkMode}
        onLogout={onLogout}
      />
    </div>
  );
}

function getStoredProfileType(): UserProfileType | null {
  const value = window.localStorage.getItem(PROFILE_TYPE_STORAGE_KEY);
  return value === 'SINGLE' || value === 'COUPLE' || value === 'FAMILY' ? value : null;
}

function storeProfileType(profileType: UserProfileType) {
  window.localStorage.setItem(PROFILE_TYPE_STORAGE_KEY, profileType);
}

function MenuSection({
  title,
  notificationsEnabled,
  darkModeEnabled,
  onToggleNotifications,
  onToggleDarkMode,
  onLogout,
}: {
  title: string;
  notificationsEnabled: boolean;
  darkModeEnabled: boolean;
  onToggleNotifications: () => void | Promise<void>;
  onToggleDarkMode: () => void | Promise<void>;
  onLogout: () => void | Promise<void>;
}) {
  return (
    <>
      <h2 className="subhead">{title}</h2>
      <Card className="menu-card">
        <div className="settings-row">
          <Bell size={17} />
          <span>알림 설정</span>
          <SwitchButton checked={notificationsEnabled} label="알림 설정" onClick={onToggleNotifications} />
        </div>
        <div className="settings-row">
          <Moon size={17} />
          <span>다크 모드</span>
          <SwitchButton checked={darkModeEnabled} label="다크 모드" onClick={onToggleDarkMode} />
        </div>
        <button onClick={onLogout}>
          <LogOut size={17} />
          <span>로그아웃</span>
          <em />
          <ChevronRight size={16} />
        </button>
      </Card>
    </>
  );
}

function SwitchButton({
  checked,
  label,
  onClick,
}: {
  checked: boolean;
  label: string;
  onClick: () => void | Promise<void>;
}) {
  return (
    <button
      type="button"
      className={`setting-switch ${checked ? 'checked' : ''}`}
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={onClick}
    >
      <span />
    </button>
  );
}
