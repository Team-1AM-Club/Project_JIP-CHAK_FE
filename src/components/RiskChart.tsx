import type { RiskScore } from '../types/domain';

export function RiskRadar({ risks }: { risks: RiskScore[] }) {
  const points = risks
    .map((risk, index) => {
      const angle = -90 + index * (360 / risks.length);
      const radius = 11 + risk.score * 0.34;
      const x = 50 + Math.cos((angle * Math.PI) / 180) * radius;
      const y = 50 + Math.sin((angle * Math.PI) / 180) * radius;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <div className="radar-wrap">
      <svg viewBox="0 0 100 100" className="radar" role="img" aria-label="5대 리스크 레이더 차트">
        <polygon points="50,8 90,38 75,88 25,88 10,38" className="radar-grid" />
        <polygon points={points} className="radar-area" />
        {risks.map((risk, index) => {
          const angle = -90 + index * (360 / risks.length);
          const x = 50 + Math.cos((angle * Math.PI) / 180) * 38;
          const y = 50 + Math.sin((angle * Math.PI) / 180) * 38;
          return <circle key={risk.type} cx={x} cy={y} r="1.7" className="radar-dot" />;
        })}
      </svg>
      <strong className="radar-score">73</strong>
    </div>
  );
}

export function MiniTrend({ values }: { values: number[] }) {
  const points = values
    .map((value, index) => {
      const x = (index / Math.max(values.length - 1, 1)) * 100;
      const y = 100 - value;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <svg viewBox="0 0 100 100" className="mini-trend" aria-label="추세 그래프">
      <polyline points={points} />
    </svg>
  );
}
