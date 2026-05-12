import type { SocialProvider, SocialProviderWire } from '../types/domain';

const REDIRECT_PATHS: Record<SocialProvider, string> = {
  KAKAO: '/auth/kakao/callback',
  GOOGLE: '/auth/callback',
  NAVER: '/auth/naver/callback',
};

const STATE_STORAGE_KEY = 'jipchak.oauth.state';

interface ProviderConfig {
  authorizeUrl: string;
  clientId: string | undefined;
  scope?: string;
  needsState: boolean;
}

const providerConfig: Record<SocialProvider, ProviderConfig> = {
  KAKAO: {
    authorizeUrl: 'https://kauth.kakao.com/oauth/authorize',
    clientId: import.meta.env.VITE_KAKAO_CLIENT_ID,
    needsState: false,
  },
  GOOGLE: {
    authorizeUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
    clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID,
    scope: 'openid email profile',
    needsState: false,
  },
  NAVER: {
    authorizeUrl: 'https://nid.naver.com/oauth2.0/authorize',
    clientId: import.meta.env.VITE_NAVER_CLIENT_ID,
    needsState: true,
  },
};

export function getRedirectUri(provider: SocialProvider): string {
  return `${window.location.origin}${REDIRECT_PATHS[provider]}`;
}

export function providerToWire(provider: SocialProvider): SocialProviderWire {
  return provider.toLowerCase() as SocialProviderWire;
}

export function getProviderFromCallbackPath(pathname: string): SocialProvider | null {
  const entry = (Object.entries(REDIRECT_PATHS) as Array<[SocialProvider, string]>)
    .find(([, path]) => path === pathname);
  return entry ? entry[0] : null;
}

export function buildAuthorizeUrl(provider: SocialProvider): string {
  const config = providerConfig[provider];

  if (!config.clientId) {
    throw new Error(`${provider} OAuth client ID가 설정되지 않았습니다. .env의 VITE_${provider}_CLIENT_ID를 채워주세요.`);
  }

  const params = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: getRedirectUri(provider),
    response_type: 'code',
  });

  if (config.scope) {
    params.set('scope', config.scope);
  }

  if (config.needsState) {
    const state = crypto.randomUUID();
    window.sessionStorage.setItem(STATE_STORAGE_KEY, state);
    params.set('state', state);
  }

  return `${config.authorizeUrl}?${params.toString()}`;
}

export const oauthSession = {
  recallState(): string | null {
    return window.sessionStorage.getItem(STATE_STORAGE_KEY);
  },
  clear() {
    window.sessionStorage.removeItem(STATE_STORAGE_KEY);
  },
};
