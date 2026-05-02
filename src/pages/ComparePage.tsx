import { Plus } from 'lucide-react';
import { ScoreGauge } from '../components/ScoreGauge';
import { Button, Card, Header, IconButton } from '../components/ui';
import type { CompareResult, Screen } from '../types/domain';

export function ComparePage({ compare, navigate }: { compare: CompareResult; navigate: (screen: Screen) => void }) {
  return (
    <div className="screen compare-screen">
      <Header
        title="주소 비교"
        onBack={() => navigate('home')}
        action={
          <IconButton label="주소 추가">
            <Plus size={18} />
          </IconButton>
        }
      />

      <div className="compare-cards">
        {[compare.left, compare.right].map((report, index) => (
          <Card key={report.reportId} className="compare-score-card">
            <span>{index === 0 ? 'A' : 'B'}</span>
            <h2>{report.address.dong} {report.address.roadAddress.split(' ').slice(-1)[0]}</h2>
            <small>{report.address.gu} · 도보권</small>
            <ScoreGauge score={report.totalScore} grade={report.totalGrade} variant="circle" compact />
            <strong>{index === 0 ? '의료·침수 강점' : '안심 동네'}</strong>
          </Card>
        ))}
      </div>

      <h2 className="subhead">항목별 비교</h2>
      <Card className="compare-table">
        {compare.left.risks.map((leftRisk) => {
          const rightRisk = compare.right.risks.find((risk) => risk.type === leftRisk.type)!;
          const diff = rightRisk.score - leftRisk.score;
          return (
            <div className="compare-row" key={leftRisk.type}>
              <strong>{leftRisk.score}</strong>
              <span className={diff > 0 ? 'diff positive' : 'diff'}>{diff > 0 ? `+${diff}` : diff}</span>
              <span>{leftRisk.label}</span>
              <strong>{rightRisk.score}</strong>
            </div>
          );
        })}
      </Card>

      <Card className="recommend-card">
        <span>AI 추천</span>
        <p>{compare.recommendation}</p>
      </Card>

      <Button onClick={() => navigate('search')}>다른 주소 분석하기</Button>
    </div>
  );
}
