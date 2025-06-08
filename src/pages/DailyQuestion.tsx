
import React, { useState } from 'react';

// 가상의 오늘의 질문 데이터
const todayQuestion = {
  id: 'q123',
  question: "본인의 전문 분야에서 가장 어려웠던 문제를 해결한 경험에 대해 설명해주세요. 어떤 접근 방식을 취했고, 그 결과는 어땠나요?",
  category: "문제 해결 능력",
  difficultyLevel: "중급",
  tags: ["경험", "문제 해결", "성과"]
};

// 가상의 모범 답안
const exampleAnswer = `
제 이전 프로젝트에서 레거시 코드의 성능 문제로 사용자 경험이 저하되는 심각한 문제가 있었습니다. 시스템은 증가하는 데이터 양을 처리하는 데 어려움을 겪고 있었고, 응답 시간이 크게 늘어났습니다.

이 문제를 해결하기 위해 다음과 같은 단계적 접근법을 취했습니다:

1. 먼저, 성능 병목 현상을 정확히 식별하기 위해 프로파일링 도구를 활용해 시스템을 분석했습니다.
2. 분석 결과, 데이터베이스 쿼리 최적화와 캐싱 시스템 도입이 필요하다고 판단했습니다.
3. 팀원들과 협력하여 데이터베이스 인덱싱을 개선하고, Redis를 활용한 캐싱 레이어를 구현했습니다.
4. 점진적으로 변경사항을 적용하고 각 단계마다 성능 테스트를 진행했습니다.

결과적으로 시스템 응답 시간을 70% 단축할 수 있었고, 사용자 경험이 크게 향상되었습니다. 이 프로젝트를 통해 레거시 시스템 개선 방법론과 성능 최적화 기술에 대한 깊은 이해를 얻을 수 있었습니다. 또한 문제 해결을 위한 체계적인 접근 방식의 중요성을 배웠습니다.
`;

const DailyQuestion: React.FC = () => {
  const [answer, setAnswer] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState<{
    score: number;
    strengths: string[];
    improvements: string[];
    detailedFeedback: string;
  } | null>(null);
  const [showExample, setShowExample] = useState(false);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!answer.trim()) return;
    
    setIsLoading(true);
    
    // 가상의 API 호출 시뮬레이션
    setTimeout(() => {
      setFeedback({
        score: 75,
        strengths: [
          "문제 상황을 명확하게 설명함",
          "해결 과정을 단계별로 제시함",
          "결과를 수치화하여 보여줌"
        ],
        improvements: [
          "구체적인 기술적 세부사항 추가 필요",
          "팀 협업에 대한 자신의 역할 강조 필요",
          "문제 해결 과정에서 마주친 어려움과 극복 방법 설명 필요"
        ],
        detailedFeedback: `
답변에서 문제 상황과 해결 과정, 결과를 기본적인 STAR 기법에 맞춰 설명한 점이 좋습니다. 특히 결과를 '70% 단축'과 같이 수치화한 것은 면접관에게 구체적인 성과를 보여주는 좋은 방법입니다.

개선이 필요한 부분으로는, 문제 해결 과정에서 사용한 기술에 대해 더 구체적으로 설명하면 좋겠습니다. 예를 들어, 어떤 프로파일링 도구를 사용했는지, 데이터베이스 인덱싱을 어떻게 개선했는지 등의 세부 정보를 추가하면 기술적 역량을 더 잘 보여줄 수 있습니다.

또한, 팀 프로젝트였다면 팀 내에서 자신의 역할과 기여도를 더 명확히 설명하는 것이 중요합니다. '내가 어떤 결정을 주도했는지', '어떤 부분에서 창의적인 해결책을 제시했는지' 등을 강조하면 리더십과 창의성을 보여줄 수 있습니다.

마지막으로, 문제 해결 과정에서 마주친 어려움이나 예상치 못한 장애물, 그리고 이를 어떻게 극복했는지에 대한 이야기를 추가하면 역경 극복 능력과 문제 해결 능력을 보여줄 수 있습니다.

전반적으로 기본 구조는 잘 갖추었으나, 위의 요소들을 추가하여 답변의 깊이와 설득력을 높이면 더 효과적인 답변이 될 것입니다.
        `
      });
      setIsSubmitted(true);
      setIsLoading(false);
    }, 1500);
  };
  
  const resetQuestion = () => {
    setAnswer('');
    setIsSubmitted(false);
    setFeedback(null);
    setShowExample(false);
  };
  
  return (
    <div className="pt-24 pb-16 min-h-screen">
      <div className="container mx-auto max-w-4xl px-4">
        <div className="text-center mb-12 animate-fade-in">
          <h1 className="text-3xl font-bold tracking-tight mb-4">오늘의 면접 질문</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            매일 새로운 면접 질문에 답변하고 AI의 피드백을 받아보세요.
            꾸준한 연습이 면접 실력 향상의 지름길입니다.
          </p>
        </div>

        <div className="glass rounded-xl p-8 animate-slide-in">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
            <h2 className="text-xl font-medium">오늘의 질문</h2>
            <div className="flex flex-wrap gap-2 mt-2 md:mt-0">
              <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-medium">
                {todayQuestion.category}
              </span>
              <span className="bg-secondary text-muted-foreground px-3 py-1 rounded-full text-xs font-medium">
                {todayQuestion.difficultyLevel}
              </span>
              {todayQuestion.tags.map((tag, index) => (
                <span 
                  key={index} 
                  className="bg-white/60 text-muted-foreground px-3 py-1 rounded-full text-xs"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
          
          <div className="bg-white/60 rounded-lg p-5 mb-8">
            <p className="text-lg">{todayQuestion.question}</p>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label htmlFor="answer" className="block text-sm font-medium mb-2">
                나의 답변:
              </label>
              <textarea
                id="answer"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                disabled={isSubmitted || isLoading}
                placeholder="이 질문에 대한 답변을 작성해보세요..."
                className="w-full h-40 p-4 rounded-lg border border-input bg-white/80 placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-80"
              />
              
              <div className="mt-2 text-xs text-muted-foreground">
                {answer.length > 0 ? `${answer.length}자 입력됨` : '답변을 입력하세요'}
              </div>
            </div>
            
            <div className="flex flex-wrap gap-3">
              {!isSubmitted && !isLoading && (
                <>
                  <button
                    type="submit"
                    disabled={!answer.trim()}
                    className={`btn-bounce px-6 py-2 rounded-lg font-medium shadow-sm ${
                      answer.trim() 
                        ? 'bg-primary hover:bg-primary/90 text-white' 
                        : 'bg-primary/50 text-white/80 cursor-not-allowed'
                    }`}
                  >
                    답변 제출하기
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => setShowExample(!showExample)}
                    className="btn-bounce bg-secondary hover:bg-secondary/80 text-foreground px-6 py-2 rounded-lg font-medium"
                  >
                    {showExample ? '모범 답안 숨기기' : '모범 답안 보기'}
                  </button>
                </>
              )}
              
              {isLoading && (
                <button
                  disabled
                  className="bg-primary/70 text-white px-6 py-2 rounded-lg font-medium shadow-sm opacity-70 flex items-center"
                >
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
                  피드백 생성 중...
                </button>
              )}
              
              {isSubmitted && feedback && (
                <button
                  type="button"
                  onClick={resetQuestion}
                  className="btn-bounce bg-primary hover:bg-primary/90 text-white px-6 py-2 rounded-lg font-medium shadow-sm"
                >
                  새로운 답변 작성하기
                </button>
              )}
            </div>
          </form>
        </div>
        
        {showExample && !isSubmitted && (
          <div className="glass rounded-xl p-8 mt-8 animate-slide-up">
            <h2 className="text-xl font-medium mb-6">모범 답안 예시</h2>
            <div className="bg-white/60 rounded-lg p-5">
              <p className="whitespace-pre-line text-sm">{exampleAnswer}</p>
            </div>
            <div className="mt-6">
              <div className="text-sm text-muted-foreground">
                * 이 모범 답안은 참고용입니다. 자신만의 경험과 스타일로 답변을 작성하세요.
              </div>
            </div>
          </div>
        )}
        
        {isSubmitted && feedback && (
          <div className="glass rounded-xl p-8 mt-8 animate-slide-up">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-medium">AI 피드백</h2>
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                feedback.score >= 90 ? 'bg-green-100 text-green-800' :
                feedback.score >= 80 ? 'bg-blue-100 text-blue-800' :
                feedback.score >= 70 ? 'bg-amber-100 text-amber-800' :
                'bg-red-100 text-red-800'
              }`}>
                점수: {feedback.score}/100
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-green-50 rounded-lg p-4">
                <h3 className="font-medium text-green-700 mb-2">잘한 점</h3>
                <ul className="text-sm space-y-2">
                  {feedback.strengths.map((strength, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-green-500 mt-0.5">✓</span>
                      <span>{strength}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="bg-amber-50 rounded-lg p-4">
                <h3 className="font-medium text-amber-700 mb-2">개선할 점</h3>
                <ul className="text-sm space-y-2">
                  {feedback.improvements.map((improvement, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-amber-500 mt-0.5">!</span>
                      <span>{improvement}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            
            <div>
              <h3 className="font-medium mb-3">상세 피드백</h3>
              <div className="bg-white/60 rounded-lg p-5">
                <p className="whitespace-pre-line text-sm">
                  {feedback.detailedFeedback}
                </p>
              </div>
            </div>
            
            <div className="mt-8 flex justify-center">
              <button
                type="button"
                onClick={() => setShowExample(!showExample)}
                className="btn-bounce bg-secondary hover:bg-secondary/80 text-foreground px-6 py-2 rounded-lg font-medium"
              >
                {showExample ? '모범 답안 숨기기' : '모범 답안 보기'}
              </button>
            </div>
          </div>
        )}
        
        <div className="glass rounded-xl p-8 mt-8 animate-slide-up">
          <h2 className="text-xl font-medium mb-6 text-center">면접 답변 작성 가이드</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white/50 p-5 rounded-lg">
              <div className="text-primary text-xl font-medium mb-3">STAR 기법</div>
              <p className="text-sm mb-3">
                구조화된 답변을 위한 효과적인 방법입니다.
              </p>
              <ul className="space-y-2 text-sm">
                <li><span className="font-medium">Situation:</span> 상황 설명</li>
                <li><span className="font-medium">Task:</span> 목표/과제</li>
                <li><span className="font-medium">Action:</span> 행동</li>
                <li><span className="font-medium">Result:</span> 결과/배움</li>
              </ul>
            </div>
            
            <div className="bg-white/50 p-5 rounded-lg">
              <div className="text-primary text-xl font-medium mb-3">답변 구성 요소</div>
              <ul className="space-y-2 text-sm">
                <li>• 명확한 상황 설정</li>
                <li>• 구체적인 사례와 수치</li>
                <li>• 개인의 역할과 기여 강조</li>
                <li>• 배운 점과 성장 포인트</li>
                <li>• 회사/직무 연관성</li>
              </ul>
            </div>
            
            <div className="bg-white/50 p-5 rounded-lg">
              <div className="text-primary text-xl font-medium mb-3">피해야 할 요소</div>
              <ul className="space-y-2 text-sm">
                <li>• 과도한 일반화/추상적 표현</li>
                <li>• 부정적 어조와 표현</li>
                <li>• 불필요한 반복과 장황함</li>
                <li>• 준비되지 않은 듯한 모호함</li>
                <li>• 거짓/과장된 경험</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DailyQuestion;
