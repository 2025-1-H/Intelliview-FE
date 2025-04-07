
import React, { useState } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, addMonths, subMonths, isSameDay, isToday } from 'date-fns';
import { ko } from 'date-fns/locale';

// 가상의 연습 기록 데이터
const mockPracticeData = [
  { date: new Date(2023, 5, 1), questionCount: 3, averageScore: 78 },
  { date: new Date(2023, 5, 2), questionCount: 5, averageScore: 82 },
  { date: new Date(2023, 5, 4), questionCount: 2, averageScore: 75 },
  { date: new Date(2023, 5, 7), questionCount: 4, averageScore: 88 },
  { date: new Date(2023, 5, 10), questionCount: 1, averageScore: 68 },
  { date: new Date(2023, 5, 15), questionCount: 6, averageScore: 92 },
  { date: new Date(2023, 5, 18), questionCount: 3, averageScore: 85 },
  { date: new Date(2023, 5, 20), questionCount: 2, averageScore: 79 },
  { date: new Date(2023, 5, 22), questionCount: 4, averageScore: 86 },
  { date: new Date(2023, 5, 28), questionCount: 5, averageScore: 90 },
];

// 선택한 날짜의 상세 데이터
const mockDetailData = {
  '2023-06-01': {
    date: new Date(2023, 5, 1),
    questions: [
      { 
        question: "자신의 강점과 약점에 대해 말씀해주세요.",
        answer: "저의 강점은 문제 해결 능력입니다. 복잡한 문제를 분석하고 효율적인 해결책을 찾는 것에 능숙합니다. 약점은 완벽주의 성향이 있어 때로는 세부사항에 너무 집중하여 시간 관리에 어려움을 겪는 경우가 있습니다. 이를 개선하기 위해 우선순위를 명확히 설정하고 시간 관리 도구를 활용하고 있습니다.",
        score: 85,
        feedback: "강점과 약점을 균형 있게 제시했으며, 약점에 대한 개선 노력을 언급한 점이 좋습니다. 더 구체적인 사례를 추가하면 설득력이 높아질 것입니다."
      },
      { 
        question: "이전 업무나 프로젝트에서의 성과를 설명해주세요.",
        answer: "가장 최근 프로젝트에서 팀 리더로서 새로운 고객 관리 시스템을 도입했습니다. 이 과정에서 팀원들과 협력하여 기존 시스템의 문제점을 분석하고, 사용자 요구사항을 수집했습니다. 결과적으로 고객 응대 시간을 30% 단축하고 사용자 만족도를 15% 향상시켰습니다.",
        score: 78,
        feedback: "성과를 수치화하여 제시한 점이 좋습니다. 프로젝트 중 발생한 어려움과 이를 어떻게 극복했는지에 대한 설명을 추가하면 좋겠습니다."
      },
      { 
        question: "스트레스 상황에서 어떻게 대처하시나요?",
        answer: "스트레스 상황에서는 먼저 문제를 객관적으로 파악하고 우선순위를 설정합니다. 호흡 조절과 같은 간단한 마음 조절 기법을 사용하며, 필요한 경우 동료나 상사와 솔직하게 소통하여 도움을 구합니다. 또한 규칙적인 운동을 통해 평소 스트레스 관리에 신경 쓰고 있습니다.",
        score: 72,
        feedback: "스트레스 관리에 대한 일반적인 접근법을 잘 설명했습니다. 실제 업무 상황에서의 구체적인 사례를 통해 답변의 신뢰성을 높이는 것이 좋겠습니다."
      }
    ],
    averageScore: 78
  },
  '2023-06-15': {
    date: new Date(2023, 5, 15),
    questions: [
      { 
        question: "본 직무에 지원한 이유가 무엇인가요?",
        answer: "귀사의 혁신적인 프로젝트와 성장 가능성에 큰 매력을 느꼈습니다. 특히 데이터 분석과 고객 경험 개선에 중점을 둔 귀사의 접근 방식이 제 역량과 관심사와 일치합니다. 또한, 귀사의 협업 문화와 지속적인 학습 환경이 제 경력 발전에 이상적이라고 생각합니다.",
        score: 92,
        feedback: "회사와 직무에 대한 이해도가 높고, 자신의 역량과 연결시켜 설명한 점이 우수합니다. 해당 직무에서의 구체적인 기여 방안을 추가하면 더 좋을 것입니다."
      },
      { 
        question: "팀 프로젝트에서 갈등 상황을 해결한 경험이 있나요?",
        answer: "이전 프로젝트에서 팀원 간 접근 방식 차이로 갈등이 있었습니다. 각자 의견을 명확히 표현할 수 있는 회의를 주선하고, 양측의 관점을 이해하려고 노력했습니다. 결과적으로 두 접근법의 장점을 결합한 하이브리드 방식을 도입하여 더 나은 결과를 얻을 수 있었습니다.",
        score: 88,
        feedback: "갈등 상황과 해결 과정을 구체적으로 설명했습니다. STAR 기법을 더 명확히 적용하여 상황-과제-행동-결과를 체계적으로 구성하면 좋겠습니다."
      },
      { 
        question: "향후 5년 후의 자신의 모습은 어떻게 되어 있을 것 같나요?",
        answer: "5년 후에는 해당 분야의 전문가로 성장하여 팀을 이끌고 있는 모습을 그리고 있습니다. 지속적인 학습과 프로젝트 경험을 통해 기술적 역량을 강화하고, 리더십 기술을 발전시켜 조직의 성장에 기여하고 싶습니다. 또한 관련 자격증 취득과 산업 네트워킹을 통해 전문성을 높일 계획입니다.",
        score: 95,
        feedback: "구체적인 목표와 그에 도달하기 위한 계획을 잘 제시했습니다. 회사 내에서의 성장과 기여 방안을 연결시켜 설명한 점이 매우 좋습니다."
      },
      { 
        question: "가장 도전적이었던 업무 경험과 그 결과는 무엇인가요?",
        answer: "이전 직장에서 레거시 시스템을 새로운 플랫폼으로 마이그레이션하는 프로젝트가 가장 도전적이었습니다. 기술적 어려움과 짧은 기한이 문제였지만, 철저한 계획과 팀원들과의 효율적인 협업으로 기한 내에 성공적으로 완료했습니다. 이 경험을 통해 복잡한 문제 해결 능력과 프로젝트 관리 스킬을 크게 향상시킬 수 있었습니다.",
        score: 90,
        feedback: "도전적인 상황과 해결 과정을 명확히 설명했습니다. 구체적인 기술적 어려움과 이를 극복한 방법에 대해 더 자세히 언급하면 기술적 역량을 더 잘 보여줄 수 있을 것입니다."
      },
      { 
        question: "업무에서 우선순위를 어떻게 결정하나요?",
        answer: "업무 우선순위는 프로젝트의 중요도와 마감일을 기준으로 결정합니다. 먼저 긴급하고 중요한 업무를 최우선으로 하며, 팀 목표와의 연관성, 리소스 가용성, 선행 업무 여부도 고려합니다. 매일 아침 할 일 목록을 검토하고 필요시 팀원 및 상사와 조율하여 우선순위를 조정합니다.",
        score: 85,
        feedback: "우선순위 결정 기준을 체계적으로 설명했습니다. 실제 업무 상황에서 적용한 구체적인 사례를 추가하면 더욱 설득력 있는 답변이 될 것입니다."
      },
      { 
        question: "현재 산업 트렌드에 대한 견해를 말씀해주세요.",
        answer: "현재 산업은 디지털 전환, AI 도입, 데이터 기반 의사결정으로 빠르게 변화하고 있습니다. 특히 코로나19 이후 원격 협업 도구와 클라우드 서비스의 중요성이 증가했으며, 사용자 경험과 개인화 서비스가 경쟁 우위 요소로 부각되고 있습니다. 이러한 변화에 적응하기 위해 꾸준히 새로운 기술을 습득하고 있습니다.",
        score: 93,
        feedback: "산업 트렌드에 대한 이해도가 높고 체계적으로 설명했습니다. 이러한 트렌드가 지원 직무와 회사에 어떤 영향을 미치는지, 본인이 어떻게 기여할 수 있는지 연결하면 더 좋은 답변이 될 것입니다."
      }
    ],
    averageScore: 92
  }
};

const Calendar: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedPractice, setSelectedPractice] = useState<any>(null);
  
  // 현재 표시중인 달의 모든 날짜 계산
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const startDate = monthStart;
  const endDate = monthEnd;
  
  const dateFormat = "yyyy.MM";
  const days = eachDayOfInterval({ start: startDate, end: endDate });
  
  // 달력 네비게이션
  const prevMonth = () => {
    setCurrentDate(subMonths(currentDate, 1));
  };
  
  const nextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
  };
  
  // 날짜별 연습 데이터 조회
  const getPracticeForDate = (date: Date) => {
    return mockPracticeData.find(practice => 
      isSameDay(practice.date, date)
    );
  };
  
  // 날짜 선택 처리
  const handleDateClick = (day: Date) => {
    const formattedDate = format(day, 'yyyy-MM-dd');
    setSelectedDate(formattedDate);
    
    // 선택한 날짜의 상세 데이터 가져오기
    if (mockDetailData[formattedDate as keyof typeof mockDetailData]) {
      setSelectedPractice(mockDetailData[formattedDate as keyof typeof mockDetailData]);
    } else {
      setSelectedPractice(null);
    }
  };
  
  return (
    <div className="pt-24 pb-16 min-h-screen">
      <div className="container mx-auto max-w-5xl px-4">
        <div className="text-center mb-12 animate-fade-in">
          <h1 className="text-3xl font-bold tracking-tight mb-4">면접 연습 캘린더</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            매일의 면접 준비 기록을 확인하고 지속적인 향상을 위한 통계를 확인하세요.
            꾸준한 연습이 성공적인 면접의 열쇠입니다.
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 캘린더 */}
          <div className="lg:col-span-2 glass rounded-xl p-6 animate-slide-in">
            <div className="flex justify-between items-center mb-6">
              <button 
                onClick={prevMonth}
                className="p-2 rounded-full hover:bg-secondary transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </button>
              
              <h2 className="text-xl font-medium">
                {format(currentDate, dateFormat, { locale: ko })}
              </h2>
              
              <button 
                onClick={nextMonth}
                className="p-2 rounded-full hover:bg-secondary transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
            
            <div className="grid grid-cols-7 gap-1 mb-2">
              {['일', '월', '화', '수', '목', '금', '토'].map(day => (
                <div key={day} className="text-center py-2 text-sm font-medium">
                  {day}
                </div>
              ))}
            </div>
            
            <div className="grid grid-cols-7 gap-1">
              {Array(getDay(monthStart))
                .fill(null)
                .map((_, index) => (
                  <div key={`empty-${index}`} className="p-2" />
                ))}
              
              {days.map((day, i) => {
                const practice = getPracticeForDate(day);
                const formattedDate = format(day, 'yyyy-MM-dd');
                const isSelected = selectedDate === formattedDate;
                const isTodayDate = isToday(day);
                
                return (
                  <button
                    key={i}
                    onClick={() => handleDateClick(day)}
                    className={`aspect-square rounded-lg flex flex-col items-center justify-center p-1 transition-all ${
                      isSelected 
                        ? 'bg-primary text-white' 
                        : isTodayDate 
                          ? 'bg-primary/10 text-primary' 
                          : practice 
                            ? 'bg-white hover:bg-white/80' 
                            : 'hover:bg-secondary'
                    }`}
                  >
                    <div className={`text-sm ${isSelected ? 'font-medium' : ''}`}>
                      {format(day, 'd')}
                    </div>
                    
                    {practice && (
                      <div className={`text-xs mt-1 ${isSelected ? 'text-white/80' : 'text-muted-foreground'}`}>
                        {practice.questionCount}문제
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
            
            <div className="flex justify-center space-x-6 mt-8">
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-white mr-2"></div>
                <span className="text-sm text-muted-foreground">연습 있음</span>
              </div>
              
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-primary/10 mr-2"></div>
                <span className="text-sm text-muted-foreground">오늘</span>
              </div>
              
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-primary mr-2"></div>
                <span className="text-sm text-muted-foreground">선택됨</span>
              </div>
            </div>
          </div>
          
          {/* 통계 및 요약 */}
          <div className="glass rounded-xl p-6 animate-slide-in" style={{ animationDelay: '100ms' }}>
            <h2 className="text-xl font-medium mb-4">통계 & 요약</h2>
            
            <div className="space-y-6">
              <div className="bg-white/60 rounded-lg p-4">
                <h3 className="font-medium mb-2 text-sm">이번 달 연습 현황</h3>
                <div className="flex justify-between items-center">
                  <div className="text-3xl font-bold">{mockPracticeData.length}</div>
                  <div className="text-sm text-muted-foreground">총 연습일</div>
                </div>
                <div className="mt-4 flex justify-between text-sm">
                  <div>
                    <div className="font-medium">{mockPracticeData.reduce((acc, curr) => acc + curr.questionCount, 0)}</div>
                    <div className="text-muted-foreground">총 문제 수</div>
                  </div>
                  <div>
                    <div className="font-medium">
                      {Math.round(mockPracticeData.reduce((acc, curr) => acc + curr.averageScore, 0) / mockPracticeData.length)}
                    </div>
                    <div className="text-muted-foreground">평균 점수</div>
                  </div>
                  <div>
                    <div className="font-medium">
                      {Math.max(...mockPracticeData.map(p => p.averageScore))}
                    </div>
                    <div className="text-muted-foreground">최고 점수</div>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="font-medium mb-3 text-sm">가장 최근 연습</h3>
                <div className="space-y-3">
                  {mockPracticeData.slice(-3).reverse().map((practice, index) => (
                    <button
                      key={index}
                      onClick={() => handleDateClick(practice.date)}
                      className="w-full text-left bg-white/60 hover:bg-white/80 rounded-lg p-3 transition-all"
                    >
                      <div className="flex justify-between items-center">
                        <div className="text-sm font-medium">
                          {format(practice.date, 'MM월 dd일')}
                        </div>
                        <div className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                          {practice.averageScore}점
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {practice.questionCount}개 문제 연습
                      </div>
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <h3 className="font-medium mb-3 text-sm">최근 개선 필요 영역</h3>
                <div className="bg-white/40 rounded-lg p-4">
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <span className="text-amber-500 mt-0.5">!</span>
                      <span>구체적인 사례 제시 부족</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-amber-500 mt-0.5">!</span>
                      <span>질문 의도 파악 미흡</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-amber-500 mt-0.5">!</span>
                      <span>답변 구조화 필요</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* 선택된 날짜의 상세 정보 */}
        {selectedPractice && (
          <div className="glass rounded-xl p-6 mt-8 animate-scale-in">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-medium">
                {format(selectedPractice.date, 'yyyy년 MM월 dd일')} 연습 기록
              </h2>
              <div className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium">
                평균 {selectedPractice.averageScore}점
              </div>
            </div>
            
            <div className="space-y-6">
              {selectedPractice.questions.map((item: any, index: number) => (
                <div key={index} className="bg-white/60 rounded-lg p-5">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-medium">{item.question}</h3>
                    <div className={`text-sm px-2 py-0.5 rounded-full ${
                      item.score >= 90 ? 'bg-green-100 text-green-800' :
                      item.score >= 80 ? 'bg-blue-100 text-blue-800' :
                      item.score >= 70 ? 'bg-amber-100 text-amber-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {item.score}점
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <div className="text-xs text-muted-foreground mb-1">나의 답변:</div>
                    <p className="text-sm bg-white/50 rounded-lg p-3">{item.answer}</p>
                  </div>
                  
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">AI 피드백:</div>
                    <p className="text-sm bg-primary/5 rounded-lg p-3">{item.feedback}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Calendar;
