import { Plus } from 'lucide-react';
import { ScoreGauge } from '../components/ScoreGauge';
import { Button, Card, Header, IconButton } from '../components/ui';
import type { CompareResult, Screen } from '../types/domain';

export function ComparePage({
  compare,
  isLoading,
  errorMessage,
  navigate,
}: {
  compare: CompareResult | null;
  isLoading: boolean;
  errorMessage: string;
  navigate: (screen: Screen) => void;
}) {
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

      {isLoading && <p className="inline-status">주소 비교 API를 호출하는 중입니다...</p>}
      {errorMessage && <p className="inline-error">{errorMessage}</p>}
      {!compare && !isLoading && (
        <Card className="empty-home-card">
          <strong>비교할 주소가 없습니다</strong>
          <p>주소 검색 결과를 선택한 뒤 비교 API를 호출할 수 있습니다.</p>
        </Card>
      )}

      {compare && (
        <>
          <div className="compare-cards">
            {[compare.left, compare.right].map((report, index) => (
              <Card key={report.reportId} className="compare-score-card">
                <span>{index === 0 ? 'A' : 'B'}</span>
                <h2>
                  {report.address.dong} {report.address.roadAddress.split(' ').slice(-1)[0]}
                </h2>
                <small>{report.address.gu} · 도보권</small>
                <ScoreGauge score={report.totalScore} grade={report.totalGrade} variant="circle" compact />
                <strong>{index === 0 ? 'A 주소' : 'B 주소'}</strong>
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
            <span>추천 코멘트</span>
            <p>{compare.recommendation}</p>
          </Card>
        </>
      )}

      <Button onClick={() => navigate('search')}>주소 검색하기</Button>
    </div>
  );
}
