import React, { useState, useEffect } from 'react';
import { apiPost, apiGet } from '@/services/api';
import { authService } from '@/services/auth';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

interface CategoryData {
  category: 'BACKEND' | 'FRONTEND' | 'DEVOPS' | 'CS';
}

interface QuestionData {
  questionId: number;
  questionText: string;
  category?: string;
  difficultyLevel?: string;
  tags?: string[];
  hasAnswered?: boolean;
}

interface FeedbackData {
  answer: string;
  modelAnswer: string;
  attemptCount: number;
}

const DailyQuestion: React.FC = () => {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCategoryLoading, setIsCategoryLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [question, setQuestion] = useState<QuestionData | null>(null);
  const [answer, setAnswer] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackData | null>(null);
  const [needsCategorySetup, setNeedsCategorySetup] = useState(false);
  const [isFirstTimeUser, setIsFirstTimeUser] = useState(true);

  useEffect(() => {
    initializePage();
  }, []);

  const initializePage = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // 먼저 오늘의 질문 조회 시도
      const response = await apiGet('/api/v1/daily/question');
      
      // 질문이 있다면 표시
      setQuestion({
        questionId: response.questionId,
        questionText: response.questionText,
        category: response.category || "일반",
        difficultyLevel: response.difficultyLevel || "중급",
        tags: response.tags || ["면접", "준비"],
        hasAnswered: response.hasAnswered
      });

      setIsFirstTimeUser(false); // 질문이 있다는 것은 카테고리가 이미 설정됨

      // 이미 답변했다면 피드백도 가져오기
      if (response.hasAnswered) {
        setIsAnswerSubmitted(true);
        await fetchFeedback();
      }
      
    } catch (error: any) {
      console.error('질문 조회 실패:', error);
      
      // 403 에러이면 카테고리 설정이 필요
      if (error.message && (error.message.includes('카테고리') || error.message.includes('403') || error.message.includes('Forbidden'))) {
        setNeedsCategorySetup(true);
        setIsFirstTimeUser(true); // 첫 번째 사용자
      } else {
        setError('페이지를 불러오는데 실패했습니다.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCategorySubmit = async (category: CategoryData['category']) => {
    try {
      setIsCategoryLoading(true);
      setError(null);

      if (!authService.isLoggedIn()) {
        setError('로그인이 필요합니다. 다시 로그인해주세요.');
        window.location.href = '/';
        return;
      }
      
      if (isFirstTimeUser) {
        // 첫 번째 카테고리 설정: POST 사용
        await apiPost('/api/v1/daily/category', { category });
        setIsFirstTimeUser(false);
      } else {
        // 이후 카테고리 변경: PATCH 사용
        const token = authService.getToken();
        const response = await fetch(`${API_BASE_URL}/api/v1/daily/category`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` })
          },
          body: JSON.stringify({ category })
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`카테고리 변경 실패: ${response.status} ${errorText}`);
        }
      }
      
      setSelectedCategory(category);
      setNeedsCategorySetup(false);
      
      // 카테고리 설정 후 질문 가져오기
      await fetchTodayQuestion();
      
    } catch (error: any) {
      console.error('카테고리 설정 실패:', error);
      
      if (error.message && error.message.includes('403')) {
        setError('인증이 필요합니다. 다시 로그인해주세요.');
        authService.logout();
        window.location.href = '/';
        return;
      }
      
      setError(`카테고리 설정에 실패했습니다: ${error.message}`);
    } finally {
      setIsCategoryLoading(false);
    }
  };

  const fetchTodayQuestion = async () => {
    try {
      setError(null);
      
      const response = await apiGet('/api/v1/daily/question');
      
      setQuestion({
        questionId: response.questionId,
        questionText: response.questionText,
        category: response.category || "일반",
        difficultyLevel: response.difficultyLevel || "중급",
        tags: response.tags || ["면접", "준비"],
        hasAnswered: response.hasAnswered
      });

      // 이미 답변했다면 피드백도 가져오기
      if (response.hasAnswered) {
        setIsAnswerSubmitted(true);
        await fetchFeedback();
      }
      
    } catch (error: any) {
      console.error('오늘의 질문 조회 실패:', error);
      setError('질문을 불러오는데 실패했습니다.');
    }
  };

  const handleAnswerSubmit = async () => {
    if (!answer.trim()) {
      setError('답변을 입력해주세요.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      if (!authService.isLoggedIn()) {
        setError('로그인이 필요합니다. 다시 로그인해주세요.');
        window.location.href = '/';
        return;
      }

      await apiPost('/api/v1/daily/question', {
        answer: answer.trim()
      });

      setIsAnswerSubmitted(true);
      
      // 답변 제출 후 피드백 가져오기
      await fetchFeedback();
      
    } catch (error: any) {
      console.error('답변 제출 실패:', error);
      
      if (error.message && error.message.includes('403')) {
        // 403 에러는 이미 답변했다는 의미로 처리
        setIsAnswerSubmitted(true);
        await fetchFeedback();
        return;
      }
      
      if (error.message && error.message.includes('인증')) {
        setError('인증이 필요합니다. 다시 로그인해주세요.');
        authService.logout();
        window.location.href = '/';
        return;
      }
      
      setError(`답변 제출에 실패했습니다: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const fetchFeedback = async () => {
    try {
      const response = await apiGet('/api/v1/daily/feedback');
      
      setFeedback({
        answer: response.modelAnswer || "제출한 답변을 불러올 수 없습니다.",
        modelAnswer: response.answer || "모범 답안을 불러올 수 없습니다.",
        attemptCount: response.attemptCount || 1
      });
      
    } catch (error) {
      console.error('피드백 조회 실패:', error);
      setError('피드백을 불러오는데 실패했습니다.');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleAnswerSubmit();
  };

  const getCategoryDisplayText = (category: string) => {
    const categoryMap: { [key: string]: string } = {
      'BACKEND': '백엔드',
      'FRONTEND': '프론트엔드', 
      'DEVOPS': '데브옵스',
      'CS': 'CS 기초'
    };
    return categoryMap[category] || category;
  };

  // 로딩 중
  if (isLoading) {
    return (
      <div className="pt-24 pb-16 min-h-screen">
        <div className="container mx-auto max-w-4xl px-4">
          <div className="text-center mb-12">
            <h1 className="text-3xl font-bold tracking-tight mb-4">오늘의 면접 질문</h1>
            <p className="text-muted-foreground">페이지를 불러오는 중...</p>
          </div>
          <div className="glass rounded-xl p-8 text-center">
            <div className="animate-spin h-8 w-8 border-b-2 border-primary mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  // 카테고리 설정이 필요한 경우
  if (needsCategorySetup) {
    return (
      <div className="pt-24 pb-16 min-h-screen">
        <div className="container mx-auto max-w-4xl px-4">
          <div className="text-center mb-12 animate-fade-in">
            <h1 className="text-3xl font-bold tracking-tight mb-4">관심 분야 설정</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              맞춤형 면접 질문을 받기 위해 관심 분야를 선택해주세요.
              설정 후 바로 오늘의 질문을 확인하실 수 있습니다.
            </p>
          </div>

          <div className="glass rounded-xl p-8 animate-slide-in">
            <h2 className="text-xl font-medium mb-6 text-center">관심 분야를 선택하세요</h2>
            
            {error && (
              <div className="bg-red-100 text-red-600 p-3 rounded mb-6 text-sm">
                {error}
              </div>
            )}
            
            {isCategoryLoading && (
              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center justify-center gap-2 text-blue-600">
                  <div className="animate-spin h-4 w-4 border-b-2 border-blue-600"></div>
                  <span>카테고리 설정 중... 질문을 불러오고 있습니다.</span>
                </div>
              </div>
            )}
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {(['BACKEND', 'FRONTEND', 'DEVOPS', 'CS'] as const).map((category) => (
                <button
                  key={category}
                  onClick={() => handleCategorySubmit(category)}
                  disabled={isCategoryLoading}
                  className={`p-6 rounded-lg border-2 transition-all duration-200 border-gray-200 hover:border-primary hover:bg-primary/5 ${isCategoryLoading ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'}`}
                >
                  <div className="font-medium text-lg mb-2">{getCategoryDisplayText(category)}</div>
                  <div className="text-sm text-muted-foreground">
                    {category === 'BACKEND' && '서버, 데이터베이스, API'}
                    {category === 'FRONTEND' && 'React, Vue, HTML/CSS'}
                    {category === 'DEVOPS' && '배포, CI/CD, 인프라'}
                    {category === 'CS' && '자료구조, 알고리즘, 네트워크'}
                  </div>
                </button>
              ))}
            </div>
            
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                선택한 분야에 맞는 면접 질문을 매일 받게 됩니다. 설정 완료 후 바로 오늘의 질문을 확인하세요!
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 질문 화면
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

        {question && (
          <div className="glass rounded-xl p-8 mb-8 animate-slide-in">
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-4">
                <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium">
                  {question.category}
                </span>
                <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm">
                  {question.difficultyLevel}
                </span>
              </div>
              <h2 className="text-2xl font-bold leading-relaxed">
                {question.questionText}
              </h2>
            </div>

            {!isAnswerSubmitted ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="answer" className="block text-sm font-medium mb-3">
                    답변을 작성해주세요
                  </label>
                  <textarea
                    id="answer"
                    rows={8}
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                    placeholder="구체적인 경험과 함께 답변해주세요..."
                    required
                  />
                  <div className="text-xs text-muted-foreground mt-2">
                    {answer.length}/500자 권장
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={isSubmitting || !answer.trim()}
                    className="w-full bg-primary hover:bg-primary/90 text-white py-3 rounded-lg font-medium disabled:opacity-50 transition-all"
                  >
                    {isSubmitting ? '제출 중...' : '답변 제출'}
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-blue-700">
                    <span className="text-lg">📝 이미 제출한 질문입니다</span>
                  </div>
                  <p className="text-sm text-blue-600 mt-1">
                    오늘의 질문에 대한 답변을 이미 제출하였습니다. 아래에서 AI 피드백을 확인하세요.
                  </p>
                </div>
              </div>
            )}

            {error && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}
          </div>
        )}

        {/* 피드백 섹션 - 답변 제출 후 항상 표시 */}
        {feedback && (
          <div className="glass rounded-xl p-8 animate-slide-in">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
              <span className="text-primary">🤖 AI 피드백</span>
            </h3>
            
            <div className="space-y-6">
              <div>
                <h4 className="font-medium mb-3 text-blue-700">제출한 답변</h4>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                    {feedback.answer}
                  </p>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-3 text-green-700">AI 모범답안</h4>
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                    {feedback.modelAnswer}
                  </p>
                </div>
              </div>

              <div className="text-sm text-muted-foreground">
                답변 횟수: {feedback.attemptCount}회
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DailyQuestion;