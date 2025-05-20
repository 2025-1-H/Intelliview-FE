import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Check, Play, Mic, MicOff, ListCheck } from "lucide-react";
import LiveInterviewSetup from "@/pages/LiveInterviewSetup"; // 경로는 실제 파일 위치에 맞게 수정


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

// 기본 면접 옵션 (하나만 사용)
const defaultInterviewOption: InterviewOption = {
  id: 'standard',
  name: '실시간 면접',
  description: '총 7개의 질문에 답변하며 영상을 녹화합니다',
  duration: 15,
  questions: 7,
  categories: ['일반', '직무', '기술', '인성']
};

const LiveInterview: React.FC = () => {
  const [interviewState, setInterviewState] = useState<'setup' | 'ready' | 'inProgress' | 'completed' | 'feedbackList'>('setup');
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
  
  // 피드백 히스토리 (예시 데이터)
  const feedbackHistory = [
    {
      id: 1,
      date: '2025-05-03',
      interviewType: '표준 면접',
      score: 82,
      questions: 7
    },
    {
      id: 2,
      date: '2025-05-01',
      interviewType: '표준 면접',
      score: 75,
      questions: 7
    },
    {
      id: 3,
      date: '2025-04-28',
      interviewType: '표준 면접',
      score: 68,
      questions: 7
    }
  ];

  const startInterview = () => {
    setInterviewState('inProgress');
    setCurrentQuestionIndex(0);
  };

  const startRecording = () => {
    setIsRecording(true);
  };

  const stopRecording = () => {
    setIsRecording(false);
    
    // Simulate saving answer
    const newAnswers = [...answers];
    newAnswers.push({
      question: interviewQuestions[currentQuestionIndex],
      videoUrl: 'https://example.com/video.mp4' // Placeholder
    });
    setAnswers(newAnswers);
    
    // Move to the next question or end the interview
    if (currentQuestionIndex < defaultInterviewOption.questions - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      completeInterview();
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
    setCurrentQuestionIndex(0);
    setAnswers([]);
    setFeedback(null);
  };

  const showFeedbackList = () => {
    setInterviewState('feedbackList');
  };

  const renderSetupView = () => (
    <LiveInterviewSetup onStartInterview={() => setInterviewState('ready')} />
  );
  // const renderSetupView = () => (
  //   <div className="max-w-4xl mx-auto py-12">
  //     <div className="text-center mb-10">
  //       <h1 className="text-3xl font-bold mb-4">실시간 면접</h1>
  //       <p className="text-muted-foreground max-w-2xl mx-auto">
  //         실제 면접과 유사한 환경에서 AI 면접관과 실시간으로 면접을 진행하고 
  //         상세한 피드백을 받아보세요.
  //       </p>
  //     </div>
      
  //     <div className="mb-12">
  //       <h2 className="font-bold text-xl mb-4 text-center">
  //         [실시간 면접은 이렇게 진행돼요 👇]
  //       </h2>
        
  //       <div className="flex flex-col md:flex-row justify-center gap-6 mt-8">
  //         <div className="flex-1 flex flex-col items-center text-center">
  //           <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold mb-3">1</div>
  //           <p className="font-medium text-sm">면접을 시작합니다.</p>
  //         </div>
  //         <div className="flex-1 flex flex-col items-center text-center">
  //           <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold mb-3">2</div>
  //           <p className="font-medium text-sm">총 7개의 질문에 답변하며 영상을 녹화합니다.</p>
  //         </div>
  //         <div className="flex-1 flex flex-col items-center text-center">
  //           <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold mb-3">3</div>
  //           <p className="font-medium text-sm">면접이 끝나면 AI 리포트가 자동 생성됩니다.</p>
  //         </div>
  //       </div>
  //     </div>

  //     <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm mb-8">
  //       <div className="flex flex-col md:flex-row justify-between items-center gap-4">
  //         <div>
  //           <h3 className="font-medium text-lg">{defaultInterviewOption.name}</h3>
  //           <p className="text-sm text-muted-foreground mt-1 mb-3">
  //             {defaultInterviewOption.description}
  //           </p>
            
  //           <div className="flex flex-wrap gap-2 mb-4">
  //             {defaultInterviewOption.categories.map((category) => (
  //               <span 
  //                 key={category} 
  //                 className="px-2 py-1 rounded-full text-xs bg-primary/10 text-primary"
  //               >
  //                 {category}
  //               </span>
  //             ))}
  //           </div>
            
  //           <div className="flex gap-4 text-sm text-muted-foreground">
  //             <span>소요시간: {defaultInterviewOption.duration}분</span>
  //             <span>질문 수: {defaultInterviewOption.questions}개</span>
  //           </div>
  //         </div>
          
  //         <div className="flex gap-3">
  //           <Button
  //             variant="outline"
  //             onClick={showFeedbackList}
  //             className="px-4 flex items-center gap-2"
  //           >
  //             <ListCheck size={16} />
  //             <span>피드백 목록</span>
  //           </Button>
            
  //           <Button
  //             onClick={() => setInterviewState('ready')}
  //             className="px-6"
  //           >
  //             면접 시작
  //           </Button>
  //         </div>
  //       </div>
  //     </div>
  //   </div>
  // );

  const renderFeedbackListView = () => (
    <div className="max-w-4xl mx-auto py-12">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">피드백 목록</h2>
        <Button variant="outline" onClick={() => setInterviewState('setup')}>돌아가기</Button>
      </div>
      
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="grid grid-cols-5 bg-gray-50 p-4 border-b border-gray-100 font-medium text-sm">
          <div>날짜</div>
          <div>면접 유형</div>
          <div>점수</div>
          <div>질문 수</div>
          <div></div>
        </div>
        
        {feedbackHistory.map((item) => (
          <div key={item.id} className="grid grid-cols-5 p-4 border-b border-gray-100 text-sm hover:bg-gray-50">
            <div>{item.date}</div>
            <div>{item.interviewType}</div>
            <div>
              <span className="inline-flex items-center">
                <span className={`mr-1 h-2 w-2 rounded-full ${
                  item.score >= 80 ? 'bg-green-500' : 
                  item.score >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                }`}></span>
                {item.score}점
              </span>
            </div>
            <div>{item.questions}개</div>
            <div>
              <Button variant="ghost" size="sm">상세보기</Button>
            </div>
          </div>
        ))}
      </div>
      
      {feedbackHistory.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <p>아직 면접 기록이 없습니다.</p>
          <Button 
            variant="outline" 
            onClick={() => setInterviewState('setup')} 
            className="mt-4"
          >
            첫 면접 시작하기
          </Button>
        </div>
      )}
    </div>
  );

  const renderReadyView = () => (
    <div className="max-w-2xl mx-auto py-12">
      <div className="text-center mb-10 space-y-4">
        <h2 className="text-2xl font-bold">면접 준비</h2>
        <div className="mb-4">
          <div className="w-20 h-20 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-3xl mx-auto">
            <Play size={32} />
          </div>
        </div>
        
        <p className="text-lg font-medium">
          {defaultInterviewOption.name} ({defaultInterviewOption.duration}분)
        </p>
        <p className="text-muted-foreground">
          {defaultInterviewOption.questions}개 질문에 답변하게 됩니다.
        </p>
      </div>
      
      <div className="bg-white rounded-lg p-6 shadow-sm mb-10">
        <h3 className="font-medium text-lg mb-4">면접 진행 방법</h3>
        <ul className="space-y-4">
          <li className="flex gap-4">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-medium shrink-0">1</div>
            <div>
              <p>질문이 화면에 표시됩니다.</p>
            </div>
          </li>
          <li className="flex gap-4">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-medium shrink-0">2</div>
            <div>
              <p>'답변 시작' 버튼을 클릭하여 녹화를 시작합니다.</p>
            </div>
          </li>
          <li className="flex gap-4">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-medium shrink-0">3</div>
            <div>
              <p>답변을 마친 후 '답변 완료' 버튼을 클릭합니다.</p>
            </div>
          </li>
          <li className="flex gap-4">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-medium shrink-0">4</div>
            <div>
              <p>모든 질문에 답변 후 AI 분석 결과를 확인합니다.</p>
            </div>
          </li>
        </ul>
      </div>
      
      <div className="flex justify-center gap-4">
        <Button
          variant="outline"
          onClick={() => setInterviewState('setup')}
          className="px-6"
        >
          뒤로 가기
        </Button>
        
        <Button
          onClick={startInterview}
          className="px-8"
        >
          면접 시작
        </Button>
      </div>
    </div>
  );

  // ... keep existing code (renderInProgressView and renderCompletedView functions)

  // Render the appropriate view based on the current state
  const renderContent = () => {
    switch (interviewState) {
      case 'setup':
        return renderSetupView();
      case 'ready':
        return renderReadyView();
      // case 'inProgress':
      //   return renderInProgressView();
      // case 'completed':
      //   return renderCompletedView();
      case 'feedbackList':
        return renderFeedbackListView();
      default:
        return null;
    }
  };

  return renderContent();
};

export default LiveInterview;
