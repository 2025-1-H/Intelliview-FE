import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Check, Play, Mic, MicOff, ListCheck } from "lucide-react";
import LiveInterviewSetup from "@/pages/LiveInterviewSetup"; // 경로는 실제 파일 위치에 맞게 수정
import { useNavigate } from "react-router-dom";


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
  description: '총 5개의 질문에 답변하며 영상을 녹화합니다',
  duration: 15,
  questions: 5,
  categories: ['일반', '직무', '기술', '인성']
};

const LiveInterviewReady: React.FC = () => {
  const [interviewState, setInterviewState] = useState<'setup' | 'ready' | 'inProgress' | 'feedbackList'>('setup');
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
  };

const [showNextButton, setShowNextButton] = useState(false);
const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);
const videoRef = useRef<HTMLVideoElement | null>(null);


useEffect(() => {
  if (videoRef.current && mediaStream) {
    videoRef.current.srcObject = mediaStream;
  }
}, [mediaStream]);


const startRecording = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    setMediaStream(stream);

    const recorder = new MediaRecorder(stream);
    setMediaRecorder(recorder);

    const chunks: Blob[] = [];

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        chunks.push(e.data);
      }
    };

    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: 'video/webm' });
      const videoUrl = URL.createObjectURL(blob);

      // 예시: 저장
      setAnswers((prev) => [
        ...prev,
        {
          question: interviewQuestions[currentQuestionIndex],
          videoUrl
        }
      ]);

      setRecordedChunks([]); // 초기화
    };

    recorder.start();
    setIsRecording(true);

    setTimeout(() => {
      setShowNextButton(true);
    }, 5000);
  } catch (error) {
    console.error("녹화 시작 실패:", error);
  }
};


  const goToNextQuestion = () => {
  if (currentQuestionIndex < defaultInterviewOption.questions - 1) {
    setCurrentQuestionIndex(prev => prev + 1);
    setShowNextButton(false);
    setTimeout(() => setShowNextButton(true), 5000); // 다음 질문도 5초 타이머
  } else {
    return null;
  }
};

  const stopRecording = () => {
  if (mediaRecorder && mediaRecorder.state !== 'inactive') {
    mediaRecorder.stop();
  }

  if (mediaStream) {
    mediaStream.getTracks().forEach((track) => track.stop());
    setMediaStream(null);
  }
  if (videoRef.current) {
  videoRef.current.srcObject = null; // 연결 해제
}
  setIsRecording(false);


}

  const renderSetupView = () => (
    <LiveInterviewSetup onStartInterview={() => setInterviewState('ready')} />
  );


  const renderReadyView = () => (
    <div className="max-w-2xl mx-auto py-12">
      <div className="text-center mb-10 space-y-4">
        <h2 className="text-2xl font-bold mt-10">면접 준비</h2>
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

const renderInProgressView = () => (
  <div className="max-w-6xl mx-auto py-12 px-6 grid grid-cols-1 gap-8">
    <div className="max-w-3xl mx-auto mt-20 py-12 px-4">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">실시간 면접</h1>
        <p className="text-muted-foreground text-sm">
          실제 면접과 유사한 환경에서 AI 면접관과 실시간으로 면접을 진행하고 상세한 피드백을 받아보세요.
        </p>
      </div>

      <div className="flex justify-between items-center text-sm font-medium mb-4">
        <span>진행 중인 면접</span>
        <span>질문 {currentQuestionIndex+1}/{defaultInterviewOption.questions}</span>
      </div>

  <div className="relative w-full max-w-3xl mx-auto aspect-video bg-gray-100 rounded-lg overflow-hidden mb-8">

    {!isRecording ? (
      <div className="flex items-center justify-center h-full w-full">
        <p className="text-muted-foreground text-sm">
          '녹화 시작' 버튼을 클릭하여 녹화를 시작하세요
        </p>
      </div>
    ) : (
      <video
        ref={videoRef}
        autoPlay
        muted
        className="absolute top-0 left-0 w-full h-full object-cover"
      />
    )}
  </div>



    {/* 질문 or 다음 질문 버튼 */}
    <div className="mt-8">
      {isRecording && !showNextButton && (
        <div className="bg-gray-100 py-6 px-4 text-center rounded-md text-base font-medium">
          Q{currentQuestionIndex + 1}. {interviewQuestions[currentQuestionIndex]}
        </div>
      )} 


      {isRecording && showNextButton && (
        <div className="flex justify-center">
          <Button
            onClick={currentQuestionIndex === defaultInterviewOption.questions - 1 ? handleInterviewEnd : goToNextQuestion}
            className="bg-blue-500 text-white hover:bg-blue-600 px-8 py-3"
          >
            {currentQuestionIndex === defaultInterviewOption.questions - 1 ? '면접 종료' : '다음 질문'}
          </Button>
        </div>
      )}
    </div>

    {/* 최초 버튼 */}
    {!isRecording && (
      <div className="flex justify-center mt-8">
        <Button
          className="bg-blue-500 text-white hover:bg-blue-600 px-10 py-3 text-base"
          onClick={startRecording}
        >
          녹화 시작
        </Button>
      </div>
    )}
  </div>
  </div>
);

const [isGeneratingFeedback, setIsGeneratingFeedback] = useState(false);
const navigate = useNavigate(); 

const handleInterviewEnd = async () => {
  stopRecording(); // 녹화 중지

  setIsGeneratingFeedback(true); // 로딩 화면 전환

  // 예: 3초 딜레이 (혹은 await API)
  setTimeout(async () => {
    try {
      // 실제 백엔드 업로드 로직 (answers에는 질문과 videoUrl이 들어 있음)
      // 예: await uploadAnswersToBackend(answers);

      navigate('/home'); // 또는 '/feedback'
    } catch (error) {
      console.error("업로드 실패:", error);
    }
  }, 3000);
};

const renderFeedbackGeneratingView = () => (
  <div className="flex flex-col items-center justify-center h-[60vh] text-center">
    <h2 className="text-2xl font-bold mb-6">피드백 생성중입니다</h2>
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-500 mb-3"></div>
    <p className="text-muted-foreground text-sm">Loading</p>
  </div>
);


  const renderContent = () => {
    if (isGeneratingFeedback) {
    return renderFeedbackGeneratingView(); // ✅ 로딩 화면 우선
  }
    switch (interviewState) {
      case 'setup':
        return renderSetupView();
      case 'ready':
        return renderReadyView();
      case 'inProgress':
        return renderInProgressView();
      default:
        return null;
    }
  };

  return renderContent();
};

export default LiveInterviewReady;