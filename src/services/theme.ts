import type { UserSettings } from '../types/domain';

export type ThemePreference = UserSettings['darkMode'];

const THEME_STORAGE_KEY = 'jipchak.darkMode';

export function getStoredThemePreference(): ThemePreference {
  if (typeof window === 'undefined') {
    return 'SYSTEM';
  }

  return normalizeThemePreference(window.localStorage.getItem(THEME_STORAGE_KEY));
}

export function storeThemePreference(preference: ThemePreference) {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(THEME_STORAGE_KEY, preference);
}

export function applyThemePreference(preference: ThemePreference) {
  if (typeof document === 'undefined') {
    return;
  }

  const resolved = resolveThemePreference(preference);
  document.documentElement.dataset.theme = resolved === 'DARK' ? 'dark' : 'light';
  document.documentElement.style.colorScheme = resolved === 'DARK' ? 'dark' : 'light';
}

export function resolveThemePreference(preference: ThemePreference): Exclude<ThemePreference, 'SYSTEM'> {
  if (preference !== 'SYSTEM') {
    return preference;
  }

  if (typeof window !== 'undefined' && window.matchMedia?.('(prefers-color-scheme: dark)').matches) {
    return 'DARK';
  }

  return 'LIGHT';
}

function normalizeThemePreference(value: unknown): ThemePreference {
  return value === 'LIGHT' || value === 'DARK' || value === 'SYSTEM' ? value : 'SYSTEM';
}
