import { RiskBadge } from './ui';
import type { Grade } from '../types/domain';
import type { CSSProperties } from 'react';

export function ScoreGauge({
  score,
  grade,
  label = '거주 안심점수',
  variant = 'arc',
  compact = false,
}: {
  score: number;
  grade: Grade;
  label?: string;
  variant?: 'arc' | 'circle' | 'mini';
  compact?: boolean;
}) {
  if (variant === 'mini') {
    return (
      <div className="mini-gauge" style={{ '--score': `${score}%` } as CSSProperties}>
        <span>{score}</span>
      </div>
    );
  }

  if (variant === 'circle') {
    return (
      <div
        className={`circle-score-gauge ${compact ? 'circle-score-gauge-compact' : ''}`}
        style={{ '--score': `${score}%` } as CSSProperties}
      >
        <div className="circle-score-center">
          {!compact && <span>{label}</span>}
          <strong>{score}</strong>
          <RiskBadge grade={grade} />
        </div>
      </div>
    );
  }

  const arcLength = Math.max(0, Math.min(score, 100));

  return (
    <div className="arc-score-gauge">
      <span className="arc-score-label">{label}</span>
      <svg viewBox="0 0 220 136" aria-label={`${label} ${score}점`}>
        <defs>
          <linearGradient id="scoreArcGradient" x1="20" y1="120" x2="200" y2="32" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="var(--color-safe)" />
            <stop offset="58%" stopColor="var(--color-watch)" />
            <stop offset="100%" stopColor="var(--color-primary)" />
          </linearGradient>
        </defs>
        <path className="arc-track" pathLength="100" d="M34 112 A76 76 0 0 1 186 112" />
        <path
          className="arc-progress"
          pathLength="100"
          strokeDasharray={`${arcLength} 100`}
          d="M34 112 A76 76 0 0 1 186 112"
        />
      </svg>
      <div className="arc-score-center">
        <strong>{score}</strong>
        <RiskBadge grade={grade} />
      </div>
    </div>
  );
}
