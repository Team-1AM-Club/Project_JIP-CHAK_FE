import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { Button } from '../components/ui';
import { ApiError, reportApi } from '../services/api';

interface LoadingPageProps {
  taskId: string | null;
  reportId: string | null;
  token: string | null;
  estimatedSeconds?: number | null;
  dongName?: string | null;
  address?: string | null;
  onCompleted: (reportId: string) => void;
  onCancel: () => void;
}

type LoadingPhase = 'polling' | 'success' | 'error';

const BASE_INTERVAL_MS = 6000;
const MAX_INTERVAL_MS = 30000;

export function LoadingPage({
  taskId,
  reportId,
  token,
  estimatedSeconds = null,
  dongName,
  address,
  onCompleted,
  onCancel,
}: LoadingPageProps) {
  const initialPhase: LoadingPhase = reportId ? 'success' : taskId ? 'polling' : 'error';

  const [phase, setPhase] = useState<LoadingPhase>(initialPhase);
  const [progress, setProgress] = useState<number>(reportId ? 100 : 0);
  const [currentStep, setCurrentStep] = useState<string>('');
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [remainingSeconds, setRemainingSeconds] = useState<number | null>(estimatedSeconds);
  const [finalReportId, setFinalReportId] = useState<string | null>(reportId);
  const [errorCode, setErrorCode] = useState<string | undefined>(
    initialPhase === 'error' ? 'TASK_NOT_FOUND' : undefined,
  );
  const [errorMessage, setErrorMessage] = useState<string>(
    initialPhase === 'error' ? '분석 작업 정보를 찾을 수 없습니다.' : '',
  );

  const aliveRef = useRef(true);
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    aliveRef.current = true;
    return () => {
      aliveRef.current = false;
      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (phase !== 'polling' || !taskId) {
      return;
    }

    let cancelled = false;
    let intervalMs = BASE_INTERVAL_MS;

    const isLive = () => aliveRef.current && !cancelled;

    const scheduleNext = (delay: number) => {
      if (!isLive()) return;
      timeoutRef.current = window.setTimeout(poll, delay);
    };

    const poll = async () => {
      if (!isLive()) return;

      try {
        const env = await reportApi.getStatus(taskId, token);

        if (!isLive()) return;

        if (env.status === 'PROCESSING') {
          setProgress(env.data.progress);
          setCurrentStep(env.data.current_step);
          setCompletedSteps(env.data.completed_steps);
          setRemainingSeconds(env.data.estimated_remaining_seconds);
          intervalMs = BASE_INTERVAL_MS;
          scheduleNext(intervalMs);
          return;
        }

        setProgress(100);
        setFinalReportId(env.data.report_id);
        setPhase('success');
      } catch (e) {
        if (!isLive()) return;

        if (e instanceof ApiError) {
          if (e.status === 429 || e.code === 'TOO_MANY_REQUESTS') {
            intervalMs = Math.min(intervalMs * 2, MAX_INTERVAL_MS);
            scheduleNext(intervalMs);
            return;
          }
          setErrorCode(e.code);
          setErrorMessage(messageForStatusError(e.code));
        } else {
          setErrorCode(undefined);
          setErrorMessage('분석 상태를 확인하지 못했습니다. 잠시 후 다시 시도해 주세요.');
        }
        setPhase('error');
      }
    };

    scheduleNext(900);

    return () => {
      cancelled = true;
      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [phase, taskId, token]);

  if (phase === 'success' && finalReportId) {
    return (
      <div className="screen loading-screen">
        <div className="loading-gauge" style={progressStyle(100)}>
          <strong>완료</strong>
        </div>
        <h1>분석이 완료됐어요</h1>
        <p>{dongName ? `${dongName} ` : ''}리포트가 준비됐습니다.</p>
        <Button onClick={() => onCompleted(finalReportId)}>리포트 보기</Button>
      </div>
    );
  }

  if (phase === 'error') {
    return (
      <div className="screen loading-screen">
        <div className="loading-gauge" style={progressStyle(0)}>
          <strong>!</strong>
        </div>
        <h1>분석 중 문제가 생겼어요</h1>
        <p>{errorMessage}</p>
        {errorCode && <p className="inline-status">코드: {errorCode}</p>}
        <Button onClick={onCancel}>다시 시도</Button>
      </div>
    );
  }

  const visibleSteps = buildStepList(completedSteps, currentStep);

  return (
    <div className="screen loading-screen">
      <div className="loading-gauge" style={progressStyle(progress)}>
        <strong>{progress}%</strong>
      </div>
      <h1>지금 동네를 분석하고 있어요</h1>
      <p>
        {address ? `${address} ` : ''}
        {remainingSeconds !== null
          ? `예상 남은 시간 약 ${Math.max(0, remainingSeconds)}초`
          : '잠시만 기다려 주세요'}
      </p>
      <div className="loading-list">
        {visibleSteps.map((item, index) => (
          <div key={`${item.label}-${index}`} className={item.complete ? 'complete' : ''}>
            {item.complete ? '✓' : '•'} {item.label}
          </div>
        ))}
      </div>
    </div>
  );
}

function buildStepList(
  completed: string[],
  current: string,
): Array<{ label: string; complete: boolean }> {
  const items = completed.map((label) => ({ label, complete: true }));
  if (current && !completed.includes(current)) {
    items.push({ label: current, complete: false });
  }
  return items;
}

function progressStyle(progress: number): CSSProperties {
  const clamped = Math.max(0, Math.min(100, progress));
  return { ['--progress' as string]: `${clamped}%` } as CSSProperties;
}

function messageForStatusError(code: string | undefined) {
  switch (code) {
    case 'TASK_NOT_FOUND':
      return '분석 정보를 찾을 수 없습니다. 다시 분석해 주세요.';
    case 'OUT_OF_SERVICE_AREA':
      return '서울시 내 주소만 분석할 수 있어요.';
    case 'INVALID_COORDINATES':
    case 'INVALID_INPUT':
      return '위치 정보가 올바르지 않습니다.';
    case 'ANALYSIS_FAILED':
      return '분석 처리 중 오류가 발생했습니다. 다시 시도해 주세요.';
    case 'EXTERNAL_API_ERROR':
      return '외부 데이터 조회에 실패했습니다. 잠시 후 다시 시도해 주세요.';
    case 'UNAUTHORIZED':
      return '로그인이 만료됐어요. 다시 로그인해 주세요.';
    default:
      return '잠시 후 다시 시도해 주세요.';
  }
}
