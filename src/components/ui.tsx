import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Bell, Bookmark, ChevronLeft, Home, User } from 'lucide-react';
import type { Grade, Screen } from '../types/domain';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
}

export function Button({ children, variant = 'primary', className = '', ...props }: ButtonProps) {
  return (
    <button className={`button button-${variant} ${className}`} {...props}>
      {children}
    </button>
  );
}

export function IconButton({
  label,
  children,
  onClick,
}: {
  label: string;
  children: ReactNode;
  onClick?: () => void;
}) {
  return (
    <button className="icon-button" aria-label={label} title={label} onClick={onClick}>
      {children}
    </button>
  );
}

export function Card({
  children,
  className = '',
  onClick,
}: {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}) {
  const Element = onClick ? 'button' : 'div';

  return (
    <Element className={`card ${onClick ? 'card-button' : ''} ${className}`} onClick={onClick as never}>
      {children}
    </Element>
  );
}

export function Header({
  title,
  onBack,
  action,
}: {
  title: string;
  onBack?: () => void;
  action?: ReactNode;
}) {
  const titleOnly = !onBack && title.length > 0;
  const logoOnly = !onBack && title.length === 0;

  return (
    <header className={`screen-header ${titleOnly ? 'title-header' : ''} ${logoOnly ? 'logo-header' : ''}`}>
      {onBack ? (
        <IconButton label="뒤로가기" onClick={onBack}>
          <ChevronLeft size={20} />
        </IconButton>
      ) : titleOnly ? (
        <h1 className="screen-heading">{title}</h1>
      ) : (
        <span className="brand brand-logo home-brand-logo" aria-label="집착" />
      )}
      {onBack && <span className="screen-title">{title}</span>}
      {action ?? (
        <IconButton label="알림">
          <Bell size={18} />
        </IconButton>
      )}
    </header>
  );
}

export function BottomNav({ active, navigate }: { active: Screen; navigate: (screen: Screen) => void }) {
  const items = [
    { key: 'saved' as Screen, label: '저장', icon: Bookmark },
    { key: 'home' as Screen, label: '홈', icon: Home },
    { key: 'my' as Screen, label: '마이', icon: User },
  ];

  return (
    <nav className="bottom-nav" aria-label="하단 내비게이션">
      {items.map((item) => {
        const Icon = item.icon;
        const selected = active === item.key;
        return (
          <button
            key={item.key}
            className={`bottom-nav-item ${selected ? 'active' : ''}`}
            onClick={() => navigate(item.key)}
          >
            <Icon size={19} />
            <span>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}

export function RiskBadge({ grade }: { grade: Grade }) {
  const label = {
    SAFE: '안심',
    NORMAL: '양호',
    CAUTION: '주의',
    DANGER: '위험',
  }[grade];

  return <span className={`risk-badge grade-${grade.toLowerCase()}`}>{label}</span>;
}

export function ScorePill({ score, grade }: { score: number; grade: Grade }) {
  return <span className={`score-pill grade-${grade.toLowerCase()}`}>{score}</span>;
}

export function Spinner({ size = 28, label = '불러오는 중' }: { size?: number; label?: string }) {
  return (
    <span
      className="spinner"
      role="status"
      aria-label={label}
      style={{ width: size, height: size, borderWidth: Math.max(2, Math.round(size / 10)) }}
    />
  );
}

export function LoadingState({
  message = '불러오고 있어요…',
  size = 32,
}: {
  message?: string;
  size?: number;
}) {
  return (
    <div className="loading-state" role="status" aria-live="polite">
      <Spinner size={size} label={message} />
      <p>{message}</p>
    </div>
  );
}

export function SkeletonLine({ width = '100%' }: { width?: number | string }) {
  return <span className="skeleton-line" style={{ width }} />;
}

export function SkeletonRow() {
  return (
    <div className="skeleton-row" aria-hidden>
      <span className="skeleton-circle" />
      <div className="skeleton-row-body">
        <SkeletonLine width="70%" />
        <SkeletonLine width="45%" />
      </div>
    </div>
  );
}

export function SkeletonReportCard() {
  return (
    <div className="skeleton-report-card" aria-hidden>
      <div className="skeleton-report-top">
        <span className="skeleton-circle" />
        <span className="skeleton-pill" />
      </div>
      <SkeletonLine width="80%" />
      <SkeletonLine width="55%" />
    </div>
  );
}
