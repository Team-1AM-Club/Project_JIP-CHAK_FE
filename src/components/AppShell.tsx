import type { ReactNode } from 'react';
import { BottomNav } from './ui';
import { ErrorBoundary } from './ErrorBoundary';
import type { Screen } from '../types/domain';

export function AppShell({
  children,
  active,
  navigate,
  bottomNav = false,
}: {
  children: ReactNode;
  active: Screen;
  navigate: (screen: Screen) => void;
  bottomNav?: boolean;
}) {
  return (
    <main className="app-shell">
      <section className={`mobile-frame ${bottomNav ? 'has-bottom-nav' : ''}`}>
        <ErrorBoundary>{children}</ErrorBoundary>
        {bottomNav && <BottomNav active={active} navigate={navigate} />}
      </section>
    </main>
  );
}
