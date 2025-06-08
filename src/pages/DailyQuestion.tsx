import React, { useState, useEffect } from 'react';

// API 관련 타입 정의
interface QuestionResponse {
  questionId: number;
  questionText: string;
}

interface SubmitAnswerRequest {
  answer: string;
}

interface FeedbackResponse {
  answer: string;
  modelAnswer: string;
  attemptCount: number;
}

// API 기본 URL - 프록시 사용 시 상대 경로
const API_BASE_URL = import.meta.env.PROD ? 'http://test.intelliview.site' : '';

const DailyQuestion: React.FC = () => {
  const [question, setQuestion] = useState<QuestionResponse | null>(null);
  const [answer, setAnswer] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackResponse | null>(null);
  const [showExample, setShowExample] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // 오늘의 질문 가져오기
  const fetchTodayQuestion = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch(`${API_BASE_URL}/api/v1/daily/question`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // 쿠키가 있다면 포함
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data: QuestionResponse = await response.json();
      setQuestion(data);
    } catch (error) {
      console.error('질문을 가져오는데 실패했습니다:', error);
      setError('질문을 불러오는데 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // 답변 제출하기
  const submitAnswer = async (answerText: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch(`${API_BASE_URL}/api/v1/daily/question`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ answer: answerText }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.text();
      console.log('답변 제출 성공:', result);
      setIsSubmitted(true);
      
      // 답변 제출 후 피드백 가져오기
      await fetchFeedback();
    } catch (error) {
      console.error('답변 제출에 실패했습니다:', error);
      setError('답변 제출에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // 피드백 가져오기
  const fetchFeedback = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/daily/feedback`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data: FeedbackResponse = await response.json();
      setFeedback(data);
    } catch (error) {
      console.error('피드백을 가져오는데 실패했습니다:', error);
      setError('피드백을 불러오는데 실패했습니다.');
    }
  };
  
  // 컴포넌트 마운트 시 질문 가져오기
  useEffect(() => {
    fetchTodayQuestion();
  }, []);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!answer.trim()) return;
    
    submitAnswer(answer.trim());
  };
  
  const resetQuestion = () => {
    setAnswer('');
    setIsSubmitted(false);
    setFeedback(null);
    setShowExample(false);
    setError(null);
    fetchTodayQuestion(); // 새로운 질문 가져오기
  };
  
  // 로딩 상태
  if (isLoading && !question) {
    return (
      <div className="pt-24 pb-16 min-h-screen">
        <div className="container mx-auto max-w-4xl px-4">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            <span className="ml-3 text-lg">오늘의 질문을 불러오는 중...</span>
          </div>
        </div>
      </div>
    );
  }
  
  // 에러 상태
  if (error && !question) {
    return (
      <div className="pt-24 pb-16 min-h-screen">
        <div className="container mx-auto max-w-4xl px-4">
          <div className="text-center">
            <h1 className="text-3xl font-bold tracking-tight mb-4">오늘의 면접 질문</h1>
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
              <p className="text-red-600 mb-4">{error}</p>
              <button
                onClick={fetchTodayQuestion}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
              >
                다시 시도
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
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

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        <div className="glass rounded-xl p-8 animate-slide-in">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
            <h2 className="text-xl font-medium">오늘의 질문</h2>
            <div className="flex flex-wrap gap-2 mt-2 md:mt-0">
              <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-medium">
                질문 ID: {question?.questionId}
              </span>
            </div>
          </div>
          
          <div className="bg-white/60 rounded-lg p-5 mb-8">
            <p className="text-lg">{question?.questionText}</p>
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
              )}
              
              {isLoading && (
                <button
                  disabled
                  className="bg-primary/70 text-white px-6 py-2 rounded-lg font-medium shadow-sm opacity-70 flex items-center"
                >
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
                  처리 중...
                </button>
              )}
              
              {isSubmitted && feedback && (
                <button
                  type="button"
                  onClick={resetQuestion}
                  className="btn-bounce bg-primary hover:bg-primary/90 text-white px-6 py-2 rounded-lg font-medium shadow-sm"
                >
                  새로운 질문 받기
                </button>
              )}
            </div>
          </form>
        </div>
        
        {isSubmitted && feedback && (
          <div className="glass rounded-xl p-8 mt-8 animate-slide-up">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-medium">피드백</h2>
              <div className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium">
                시도 횟수: {feedback.attemptCount}회
              </div>
            </div>
            
            <div className="space-y-6">
              <div>
                <h3 className="font-medium mb-3">나의 답변</h3>
                <div className="bg-blue-50 rounded-lg p-4">
                  <p className="text-sm">{feedback.answer}</p>
                </div>
              </div>
              
              <div>
                <h3 className="font-medium mb-3">모범 답안</h3>
                <div className="bg-green-50 rounded-lg p-4">
                  <p className="text-sm">{feedback.modelAnswer}</p>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* 기존의 가이드라인 섹션은 그대로 유지 */}
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