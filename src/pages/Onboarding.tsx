import { BarChart3, Check, Home, ScrollText, Users } from 'lucide-react';
import { Button, Card } from '../components/ui';
import type { UserProfileType } from '../types/domain';

const slides = [
  {
    step: '01 / 03',
    title: '이 집,\n실제로 살기 괜찮을까?',
    body: '가격이 아닌, 매일의 삶에 영향을 주는 5가지 생활 리스크를 분석해드려요.',
    icon: Home,
  },
  {
    step: '02 / 03',
    title: '서울시 공공데이터로\n객관적인 점수를',
    body: '침수·범죄·의료·혼잡도·소음. 공식 데이터만 사용해 100점 만점 리포트로 보여줘요.',
    icon: BarChart3,
  },
  {
    step: '03 / 03',
    title: '주소를 입력하면\n5초 안에 결정할 수 있어요',
    body: '저장하고, 비교하고, 가족과 공유하며 주거 의사결정의 마지막 한 걸음을 도와요.',
    icon: ScrollText,
  },
];

const profiles: Array<{ type: UserProfileType; title: string; body: string }> = [
  { type: 'SINGLE', title: '청년 1인 가구', body: '안전·소음·의료를 우선시' },
  { type: 'COUPLE', title: '신혼 / 예비부부', body: '생활 인프라·소음 가중' },
  { type: 'FAMILY', title: '부모 동거 가구', body: '의료·안전 점수 가중' },
];

export function Onboarding({
  step,
  profileType,
  setProfileType,
  next,
}: {
  step: number;
  profileType: UserProfileType;
  setProfileType: (type: UserProfileType) => void;
  next: () => void;
}) {
  if (step >= slides.length) {
    return (
      <div key={`onboarding-${step}`} className="screen onboarding profile-screen onboarding-slide">
        <p className="eyebrow">마지막 단계</p>
        <h1>어떤 가구 형태인가요?</h1>
        <p className="lead">유형에 따라 5가지 리스크의 가중치가 자동으로 조정돼요.</p>

        <div className="profile-options">
          {profiles.map((profile) => {
            const selected = profileType === profile.type;
            return (
              <Card
                key={profile.type}
                className={`profile-card ${selected ? 'selected' : ''}`}
                onClick={() => setProfileType(profile.type)}
              >
                <span className="profile-icon">
                  <Users size={22} />
                </span>
                <span>
                  <strong>{profile.title}</strong>
                  <small>{profile.body}</small>
                </span>
                {selected && <Check size={18} className="selected-check" />}
              </Card>
            );
          })}
        </div>

        <Button className="bottom-cta" onClick={next}>
          집:착 시작하기
        </Button>
      </div>
    );
  }

  const slide = slides[step];
  const Icon = slide.icon;

  return (
    <div key={`onboarding-${step}`} className="screen onboarding onboarding-slide">
      <div className="onboarding-visual">
        <Icon size={98} strokeWidth={1.7} />
      </div>
      <p className="eyebrow">{slide.step}</p>
      <h1>
        {slide.title.split('\n').map((line) => (
          <span key={line}>{line}</span>
        ))}
      </h1>
      <p className="lead">{slide.body}</p>
      <div className="page-dots">
        {slides.map((item, index) => (
          <span key={item.step} className={index === step ? 'active' : ''} />
        ))}
      </div>
      <Button className="bottom-cta" onClick={next}>
        {step === slides.length - 1 ? '시작하기' : '다음'}
      </Button>
    </div>
  );
}
