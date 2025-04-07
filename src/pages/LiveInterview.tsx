
import React, { useState } from 'react';

// 면접 질문 목록 (실제로는 API에서 가져올 수 있음)
const interviewQuestions = [
  "본인의 강점과 약점에 대해 말씀해주세요.",
  "지원하신 직무에 지원한 이유가 무엇인가요?",
  "팀 프로젝트에서 갈등 상황을 해결한 경험이 있나요?",
  "직무와 관련된 기술적 경험에 대해 설명해주세요.",
  "향후 5년 후의 자신의 모습은 어떻게 되어 있을 것 같나요?",
  "이전 업무나 학업에서 실패한 경험과 그로부터 배운 점은 무엇인가요?",
  "우리 회사에 지원한 이유는 무엇인가요?",
  "스트레스 상황에서 어떻게 대처하시나요?",
  "본인의 리더십 스타일은 어떤가요?",
  "마지막으로 하고 싶은 질문이 있으신가요?"
];

type InterviewCategory = '일반' | '직무' | '기술' | '인성';

interface InterviewOption {
  id: string;
  name: string;
  description: string;
  duration: number;
  questions: number;
  categories: InterviewCategory[];
}

const interviewOptions: InterviewOption[] = [
  {
    id: 'basic',
    name: '기본 면접',
    description: '일반적인 면접 질문으로 구성된 짧은 면접입니다.',
    duration: 10,
    questions: 5,
    categories: ['일반', '인성']
  },
  {
    id: 'job',
    name: '직무 면접',
    description: '직무 관련 질문으로 구성된 중간 길이의 면접입니다.',
    duration: 15,
    questions: 7,
    categories: ['직무', '기술', '일반']
  },
  {
    id: 'full',
    name: '종합 면접',
    description: '모든 카테고리를 포함한 심층 면접입니다.',
    duration: 25,
    questions: 10,
    categories: ['일반', '직무', '기술', '인성']
  }
];

const LiveInterview: React.FC = () => {
  const [selectedOption, setSelectedOption] = useState<InterviewOption | null>(null);
  const [interviewState, setInterviewState] = useState<'setup' | 'ready' | 'inProgress' | 'completed'>('setup');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [answers, setAnswers] = useState<{question: string, videoUrl: string}[]>([]);
  const [feedback, setFeedback] = useState<{
    overallScore: number;
    categoryScores: {category: string, score: number}[];
    strengths: string[];
    improvements: string[];
    detailedFeedback: {question: string, feedback: string}[];
  } | null>(null);

  const startInterview = () => {
    setInterviewState('inProgress');
    setCurrentQuestionIndex(0);
    // In a real app, we would initialize recording setup here
  };

  const startRecording = () => {
    setIsRecording(true);
    // In a real app, we would start recording here
  };

  const stopRecording = () => {
    setIsRecording(false);
    
    // Simulate saving answer
    if (selectedOption) {
      const newAnswers = [...answers];
      newAnswers.push({
        question: interviewQuestions[currentQuestionIndex],
        videoUrl: 'https://example.com/video.mp4' // Placeholder
      });
      setAnswers(newAnswers);
      
      // Move to the next question or end the interview
      if (currentQuestionIndex < selectedOption.questions - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
      } else {
        completeInterview();
      }
    }
  };

  const completeInterview = () => {
    setInterviewState('completed');
    
    // Simulate API call to get feedback
    setTimeout(() => {
      setFeedback({
        overallScore: 82,
        categoryScores: [
          {category: '답변 품질', score: 85},
          {category: '바디랭귀지', score: 78},
          {category: '목소리 톤', score: 88},
          {category: '전문성', score: 79}
        ],
        strengths: [
          "명확하고 구조적인 답변 제공",
          "질문 의도를 정확히 파악하는 능력",
          "적절한 목소리 톤과 발음"
        ],
        improvements: [
          "일부 질문에서 구체적인 사례 추가 필요",
          "시선 처리 개선 - 카메라를 더 응시할 것",
          "답변 시 불필요한 반복 줄이기"
        ],
        detailedFeedback: [
          {
            question: "본인의 강점과 약점에 대해 말씀해주세요.",
            feedback: "강점을 설명할 때 구체적인 사례를 잘 제시하셨습니다. 다만 약점을 언급할 때 이를 극복하기 위한 노력에 대해 더 자세히 설명하면 좋겠습니다."
          },
          {
            question: "지원하신 직무에 지원한 이유가 무엇인가요?",
            feedback: "직무에 대한 이해도가 높고 열정이 잘 전달되었습니다. 회사의 특성과 연결지어 설명하면 더욱 설득력 있을 것입니다."
          },
          {
            question: "팀 프로젝트에서 갈등 상황을 해결한 경험이 있나요?",
            feedback: "갈등 상황과 해결 과정을 구체적으로 설명했으나, 결과와 배운 점에 대한 언급이 부족했습니다. STAR 기법을 활용하여 더 완성도 있는 답변을 구성하세요."
          }
        ]
      });
    }, 2000);
  };

  const resetInterview = () => {
    setInterviewState('setup');
    setSelectedOption(null);
    setCurrentQuestionIndex(0);
    setAnswers([]);
    setFeedback(null);
  };

  return (
    <div className="pt-24 pb-16 min-h-screen">
      <div className="container mx-auto max-w-5xl px-4">
        <div className="text-center mb-12 animate-fade-in">
          <h1 className="text-3xl font-bold tracking-tight mb-4">실시간 면접 시뮬레이션</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            실제 면접과 유사한 환경에서 AI 면접관과 실시간으로 면접을 진행하고 
            상세한 피드백을 받아보세요.
          </p>
        </div>

        {interviewState === 'setup' && (
          <div className="glass rounded-xl p-8 animate-slide-in">
            <h2 className="text-xl font-medium mb-6">면접 유형 선택</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {interviewOptions.map((option) => (
                <button
                  key={option.id}
                  onClick={() => setSelectedOption(option)}
                  className={`text-left p-5 rounded-xl transition-all duration-200 ${
                    selectedOption?.id === option.id 
                      ? 'bg-primary text-white shadow-md' 
                      : 'bg-white/70 hover:bg-white/90'
                  }`}
                >
                  <h3 className="font-medium text-lg mb-2">{option.name}</h3>
                  <p className={`text-sm mb-4 ${selectedOption?.id === option.id ? 'text-white/80' : 'text-muted-foreground'}`}>
                    {option.description}
                  </p>
                  
                  <div className="flex justify-between text-sm">
                    <span className={selectedOption?.id === option.id ? 'text-white/90' : ''}>
                      {option.duration}분
                    </span>
                    <span className={selectedOption?.id === option.id ? 'text-white/90' : ''}>
                      {option.questions}개 질문
                    </span>
                  </div>
                  
                  <div className="mt-3 flex flex-wrap gap-2">
                    {option.categories.map((category) => (
                      <span 
                        key={category} 
                        className={`px-2 py-1 rounded-full text-xs ${
                          selectedOption?.id === option.id 
                            ? 'bg-white/20 text-white' 
                            : 'bg-primary/10 text-primary'
                        }`}
                      >
                        {category}
                      </span>
                    ))}
                  </div>
                </button>
              ))}
            </div>
            
            <div className="flex justify-center">
              <button
                onClick={() => selectedOption && setInterviewState('ready')}
                disabled={!selectedOption}
                className={`btn-bounce px-8 py-3 rounded-lg font-medium shadow-sm ${
                  selectedOption 
                    ? 'bg-primary hover:bg-primary/90 text-white' 
                    : 'bg-secondary text-muted-foreground cursor-not-allowed'
                }`}
              >
                면접 시작하기
              </button>
            </div>
          </div>
        )}

        {interviewState === 'ready' && (
          <div className="glass rounded-xl p-8 animate-fade-in">
            <h2 className="text-xl font-medium mb-6 text-center">면접 준비</h2>
            
            <div className="text-center mb-8">
              <div className="mb-6">
                <div className="w-20 h-20 rounded-full bg-primary/10 text-primary flex items-center justify-center text-3xl mx-auto">
                  🎙️
                </div>
              </div>
              
              <p className="text-lg mb-2">
                {selectedOption?.name} ({selectedOption?.duration}분)
              </p>
              <p className="text-muted-foreground mb-4">
                {selectedOption?.questions}개 질문에 답변하게 됩니다.
              </p>
              
              <div className="max-w-md mx-auto bg-white/60 rounded-lg p-4 mb-8">
                <h3 className="font-medium mb-2">면접 진행 방법</h3>
                <ul className="text-sm text-left space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-primary font-medium">1.</span>
                    <span>질문이 화면에 표시됩니다.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary font-medium">2.</span>
                    <span>'답변 시작' 버튼을 클릭하여 녹화를 시작합니다.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary font-medium">3.</span>
                    <span>답변을 마친 후 '답변 완료' 버튼을 클릭합니다.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary font-medium">4.</span>
                    <span>모든 질문에 답변 후 AI 분석 결과를 확인합니다.</span>
                  </li>
                </ul>
              </div>
            </div>
            
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => setInterviewState('setup')}
                className="btn-bounce bg-secondary hover:bg-secondary/80 text-foreground px-6 py-3 rounded-lg font-medium"
              >
                뒤로 가기
              </button>
              
              <button
                onClick={startInterview}
                className="btn-bounce bg-primary hover:bg-primary/90 text-white px-8 py-3 rounded-lg font-medium shadow-sm"
              >
                면접 시작
              </button>
            </div>
          </div>
        )}

        {interviewState === 'inProgress' && (
          <div className="glass rounded-xl p-8 animate-fade-in">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-medium">진행 중인 면접</h2>
              <div className="text-sm font-medium">
                질문 {currentQuestionIndex + 1} / {selectedOption?.questions}
              </div>
            </div>
            
            <div className="mb-8">
              <div className="bg-white/60 rounded-xl p-6 mb-6">
                <div className="text-sm text-muted-foreground mb-2">현재 질문:</div>
                <div className="text-lg font-medium">
                  {interviewQuestions[currentQuestionIndex]}
                </div>
              </div>
              
              <div className="aspect-video bg-black/5 rounded-lg mb-6 flex items-center justify-center">
                {isRecording ? (
                  <div className="flex flex-col items-center text-muted-foreground">
                    <div className="w-4 h-4 rounded-full bg-red-500 animate-pulse-subtle mb-2"></div>
                    <span>녹화 중...</span>
                  </div>
                ) : (
                  <div className="text-muted-foreground">
                    '답변 시작' 버튼을 클릭하여 녹화를 시작하세요
                  </div>
                )}
              </div>
              
              <div className="flex justify-center space-x-4">
                {!isRecording ? (
                  <button
                    onClick={startRecording}
                    className="btn-bounce bg-primary hover:bg-primary/90 text-white px-8 py-3 rounded-lg font-medium shadow-sm"
                  >
                    답변 시작
                  </button>
                ) : (
                  <button
                    onClick={stopRecording}
                    className="btn-bounce bg-destructive hover:bg-destructive/90 text-white px-8 py-3 rounded-lg font-medium shadow-sm"
                  >
                    답변 완료
                  </button>
                )}
              </div>
            </div>
            
            <div className="bg-white/40 rounded-lg p-4">
              <h3 className="font-medium mb-3 text-sm">답변 팁:</h3>
              <ul className="text-sm space-y-1.5 text-muted-foreground">
                <li>• 구체적인 사례를 통해 역량을 증명하세요.</li>
                <li>• 카메라를 자연스럽게 응시하세요.</li>
                <li>• 명확하고 간결하게 답변하세요.</li>
                <li>• STAR 기법(상황-임무-행동-결과)을 활용하세요.</li>
              </ul>
            </div>
          </div>
        )}

        {interviewState === 'completed' && (
          <div className="animate-fade-in">
            <div className="glass rounded-xl p-8 mb-8">
              <div className="text-center mb-6">
                <div className="inline-block bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium mb-4">
                  면접 완료
                </div>
                <h2 className="text-2xl font-bold mb-2">면접 분석 결과</h2>
                <p className="text-muted-foreground">
                  AI가 분석한 면접 결과를 확인하세요.
                </p>
              </div>
              
              {feedback ? (
                <div className="space-y-8">
                  <div className="flex justify-center">
                    <div className="relative w-32 h-32">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-2xl font-bold">{feedback.overallScore}</div>
                      </div>
                      <svg className="w-full h-full" viewBox="0 0 36 36">
                        <circle cx="18" cy="18" r="16" fill="none" stroke="#e6e6e6" strokeWidth="2" />
                        <circle 
                          cx="18" cy="18" r="16" fill="none" stroke="#3b82f6" strokeWidth="2"
                          strokeDasharray={`${(feedback.overallScore / 100) * 100} 100`}
                          transform="rotate(-90 18 18)"
                          style={{transition: 'all 0.5s ease'}}
                        />
                      </svg>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-medium mb-3">카테고리별 점수</h3>
                      <div className="space-y-3">
                        {feedback.categoryScores.map((item, index) => (
                          <div key={index}>
                            <div className="flex justify-between text-sm mb-1">
                              <span>{item.category}</span>
                              <span>{item.score}/100</span>
                            </div>
                            <div className="w-full bg-secondary rounded-full h-2">
                              <div 
                                className="bg-primary h-2 rounded-full"
                                style={{width: `${item.score}%`, transition: 'all 0.5s ease'}}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-4">
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
                  </div>
                  
                  <div>
                    <h3 className="font-medium mb-4">질문별 피드백</h3>
                    <div className="space-y-4">
                      {feedback.detailedFeedback.map((item, index) => (
                        <div key={index} className="bg-white/70 rounded-lg p-4">
                          <div className="font-medium mb-2">{item.question}</div>
                          <p className="text-sm text-muted-foreground">{item.feedback}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="pt-4 flex justify-center">
                    <button 
                      onClick={resetInterview}
                      className="btn-bounce bg-primary hover:bg-primary/90 text-white px-8 py-3 rounded-lg font-medium shadow-sm"
                    >
                      새로운 면접 시작하기
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <div className="w-10 h-10 border-t-2 border-primary border-solid rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-muted-foreground">면접 결과 분석 중...</p>
                  </div>
                </div>
              )}
            </div>
            
            <div className="glass rounded-xl p-8 animate-slide-up">
              <h2 className="text-xl font-medium mb-6 text-center">면접 대비 리소스</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white/50 p-5 rounded-lg">
                  <div className="text-primary text-xl font-medium mb-3">STAR 기법</div>
                  <p className="text-sm mb-3">
                    구조화된 답변을 위한 효과적인 방법입니다.
                  </p>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li><span className="font-medium text-foreground">Situation:</span> 상황 설명</li>
                    <li><span className="font-medium text-foreground">Task:</span> 주어진 과제</li>
                    <li><span className="font-medium text-foreground">Action:</span> 취한 행동</li>
                    <li><span className="font-medium text-foreground">Result:</span> 결과 및 배운 점</li>
                  </ul>
                </div>
                
                <div className="bg-white/50 p-5 rounded-lg">
                  <div className="text-primary text-xl font-medium mb-3">자주 나오는 질문</div>
                  <ul className="space-y-2 text-sm">
                    <li>• 자신의 강점과 약점은?</li>
                    <li>• 지원 동기는 무엇인가요?</li>
                    <li>• 팀워크 경험에 대해 말씀해주세요.</li>
                    <li>• 목표와 포부는 무엇인가요?</li>
                    <li>• 실패 경험과 극복 방법은?</li>
                  </ul>
                </div>
                
                <div className="bg-white/50 p-5 rounded-lg">
                  <div className="text-primary text-xl font-medium mb-3">면접 준비 팁</div>
                  <ul className="space-y-2 text-sm">
                    <li>• 회사와 직무에 대한 철저한 조사</li>
                    <li>• 자신의 경험을 구체적인 사례로 준비</li>
                    <li>• 질문에 대해 간결하고 명확한 답변 구성</li>
                    <li>• 적절한 바디랭귀지 연습</li>
                    <li>• 긍정적인 마인드셋 유지하기</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LiveInterview;
