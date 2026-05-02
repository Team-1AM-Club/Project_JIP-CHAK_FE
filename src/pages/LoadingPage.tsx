import { CheckCircle2, Circle, Home } from 'lucide-react';
import type { CSSProperties } from 'react';
import { useEffect, useState } from 'react';
import type { AddressCandidate } from '../types/domain';

const steps = [
  '서울시 침수예측 데이터 조회',
  '경찰청 야간 안전지수 산출',
  '의료 접근성 반경 분석',
  '생활 혼잡도 시뮬레이션',
  '소음 데이터 매칭',
];

export function LoadingPage({ address, done }: { address: AddressCandidate; done: () => void }) {
  const [progress, setProgress] = useState(12);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setProgress((value) => Math.min(value + 18, 100));
    }, 260);
    const end = window.setTimeout(done, 1450);

    return () => {
      window.clearInterval(timer);
      window.clearTimeout(end);
    };
  }, [done]);

  return (
    <div className="screen loading-screen">
      <div className="loading-gauge" style={{ '--progress': `${progress}%` } as CSSProperties}>
        <Home size={54} />
      </div>
      <h1>{address.roadAddress.replace('서울 ', '')}을<br />분석하고 있어요</h1>
      <p>서울시 공공데이터 12종을 비교 중 · 약 6초 소요</p>
      <div className="loading-list">
        {steps.map((step, index) => {
          const complete = progress > (index + 1) * 18;
          return (
            <div key={step} className={complete ? 'complete' : ''}>
              {complete ? <CheckCircle2 size={18} /> : <Circle size={18} />}
              <span>{step}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
