import { RotateCcw } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Button, Card, Header } from '../components/ui';
import { ApiError, userApi } from '../services/api';
import type { RiskWeights, UserProfileType, UserWeightProfile } from '../types/domain';

const weightItems: Array<{
  key: keyof RiskWeights;
  label: string;
  description: string;
}> = [
  { key: 'security', label: '치안', description: 'CCTV, 경찰서, 안전 시설 반영' },
  { key: 'noise', label: '소음', description: '도로, 철도, 생활 소음 반영' },
  { key: 'medical', label: '의료', description: '병원, 약국, 응급 접근성 반영' },
  { key: 'flood', label: '침수', description: '침수 이력과 지형 위험 반영' },
  { key: 'congestion', label: '혼잡', description: '교통과 생활 밀집도 반영' },
];

const presetWeights: Record<UserProfileType, RiskWeights> = {
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

const fallbackProfile: UserWeightProfile = {
  profileType: 'SINGLE',
  profileTypeName: '청년 1인 가구',
  profileTypeDescription: '안전·소음 가중치 프리셋 적용 중',
  isCustomized: false,
  weights: presetWeights.SINGLE,
};

export function WeightSettingsPage({
  token,
  onBack,
}: {
  token: string | null;
  onBack: () => void;
}) {
  const [profile, setProfile] = useState<UserWeightProfile>(fallbackProfile);
  const [weights, setWeights] = useState<RiskWeights>(fallbackProfile.weights);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  const total = useMemo(
    () => weightItems.reduce((sum, item) => sum + weights[item.key], 0),
    [weights],
  );
  const canSave = total === 100 && !isLoading && !isSaving;
  const modeLabel = profile.isCustomized ? '개인 가중치 적용중' : profile.profileTypeDescription;

  useEffect(() => {
    if (!token) {
      setStatusMessage('로그인 토큰이 없어 기본 프리셋을 표시합니다.');
      return;
    }

    let ignore = false;
    setIsLoading(true);
    setStatusMessage('');

    userApi
      .getWeightProfile(token)
      .then((nextProfile) => {
        if (ignore) {
          return;
        }

        setProfile(nextProfile);
        setWeights(nextProfile.weights);
      })
      .catch((error) => {
        if (ignore) {
          return;
        }

        setStatusMessage(messageForWeightError(error));
      })
      .finally(() => {
        if (!ignore) {
          setIsLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, [token]);

  const updateWeight = (key: keyof RiskWeights, value: number) => {
    setWeights((current) => ({
      ...current,
      [key]: value,
    }));
    setStatusMessage('');
  };

  const resetToPreset = () => {
    const nextWeights = presetWeights[profile.profileType];
    setWeights(nextWeights);
    setStatusMessage('프리셋 가중치로 되돌렸습니다. 저장을 눌러 적용해주세요.');
  };

  const saveWeights = async () => {
    if (!token || !canSave) {
      return;
    }

    setIsSaving(true);
    setStatusMessage('');

    try {
      const savedWeights = await userApi.updateWeights(token, weights);
      setWeights(savedWeights);
      setProfile((current) => ({ ...current, isCustomized: true, weights: savedWeights }));
      setStatusMessage('가중치가 저장되었습니다.');
    } catch (error) {
      setStatusMessage(messageForWeightError(error));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="screen weight-settings-screen">
      <Header title="가중치 설정" onBack={onBack} action={<span />} />

      <Card className="weight-profile-card">
        <span>{profile.profileTypeName}</span>
        <h1>{modeLabel}</h1>
        <p>현재 총합 {total}%</p>
      </Card>

      <Card className="weight-editor-card">
        {weightItems.map((item) => (
          <label className="weight-slider-row" key={item.key}>
            <span className="weight-slider-head">
              <strong>{item.label}</strong>
              <em>{weights[item.key]}%</em>
            </span>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={weights[item.key]}
              onChange={(event) => updateWeight(item.key, Number(event.target.value))}
            />
            <small>{item.description}</small>
          </label>
        ))}
      </Card>

      <div className={`weight-total-card ${total === 100 ? 'valid' : 'invalid'}`}>
        <strong>{total === 100 ? '저장 가능한 설정입니다.' : `현재 합계 ${total}%`}</strong>
        <span>
          {total === 100
            ? '이 비율로 리포트 위험 점수에 반영됩니다.'
            : '가중치 총합이 100%가 되도록 조정해주세요.'}
        </span>
      </div>

      {statusMessage && <p className="inline-status">{statusMessage}</p>}

      <div className="weight-actions">
        <Button variant="secondary" onClick={resetToPreset} disabled={isLoading || isSaving}>
          <RotateCcw size={16} />
          프리셋으로 되돌리기
        </Button>
        <Button onClick={saveWeights} disabled={!canSave}>
          {isSaving ? '저장 중' : '저장하기'}
        </Button>
      </div>
    </div>
  );
}

function messageForWeightError(error: unknown) {
  if (error instanceof ApiError) {
    return error.message && !error.message.startsWith('API request failed')
      ? error.message
      : '가중치 정보를 불러오지 못했습니다.';
  }

  return '가중치 정보를 불러오지 못했습니다.';
}
