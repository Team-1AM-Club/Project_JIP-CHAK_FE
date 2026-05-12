import { ShieldCheck } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Card } from '../components/ui';
import type { SocialProvider } from '../types/domain';

const providers: Array<{
  provider: SocialProvider;
  label: string;
  imageSrc: string;
}> = [
  {
    provider: 'KAKAO',
    label: '카카오로 로그인',
    imageSrc: '/kakao_login_standardized.svg',
  },
  {
    provider: 'GOOGLE',
    label: 'Google(으)로 로그인',
    imageSrc: '/google_login_standardized.svg',
  },
  {
    provider: 'NAVER',
    label: '네이버 로그인',
    imageSrc: '/naver_login_standardized.svg',
  },
];

interface LoginPageProps {
  onLogin: (provider: SocialProvider) => Promise<void>;
  externalErrorMessage?: string;
}

export function LoginPage({ onLogin, externalErrorMessage }: LoginPageProps) {
  const [pendingProvider, setPendingProvider] = useState<SocialProvider | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [dialogMessage, setDialogMessage] = useState('');

  useEffect(() => {
    if (externalErrorMessage) {
      setDialogMessage(externalErrorMessage);
    }
  }, [externalErrorMessage]);

  const login = async (provider: SocialProvider) => {
    setPendingProvider(provider);
    setErrorMessage('');
    setDialogMessage('');

    try {
      await onLogin(provider);
    } catch (error) {
      const message = error instanceof Error
        ? error.message
        : '소셜 로그인 요청에 실패했습니다. 잠시 후 다시 시도해주세요.';
      setErrorMessage(message);
      setDialogMessage(message);
    } finally {
      setPendingProvider(null);
    }
  };

  const displayedError = errorMessage || externalErrorMessage || '';

  return (
    <div className="screen login-screen">
      <div className="login-content-group">
        <div className="login-hero">
          <div className="login-logo brand-logo" aria-label="집착 Living Risk Score" />
          <h1>좋은 집을 향한 이유 있는 집착</h1>
        </div>

        <Card className="login-card social-login-card">
          <div className="social-login-list">
            {providers.map((item) => (
              <button
                key={item.provider}
                className="social-login-button"
                aria-label={item.label}
                disabled={pendingProvider !== null}
                onClick={() => login(item.provider)}
              >
                <img src={item.imageSrc} alt="" />
                {pendingProvider === item.provider && <span className="social-login-loading">연결 중</span>}
              </button>
            ))}
          </div>
          {displayedError && <p className="login-error">{displayedError}</p>}
        </Card>
      </div>

      {dialogMessage && (
        <div className="login-error-modal-backdrop" role="presentation">
          <div className="login-error-modal" role="dialog" aria-modal="true" aria-labelledby="login-error-title">
            <h2 id="login-error-title">로그인할 수 없습니다</h2>
            <p>{dialogMessage}</p>
            <button onClick={() => setDialogMessage('')}>확인</button>
          </div>
        </div>
      )}

      <div className="login-footer">
        <ShieldCheck size={16} />
        <span>서울시 공공데이터 기반 분석 리포트</span>
      </div>
    </div>
  );
}
