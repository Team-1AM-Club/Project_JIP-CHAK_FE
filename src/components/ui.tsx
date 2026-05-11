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
