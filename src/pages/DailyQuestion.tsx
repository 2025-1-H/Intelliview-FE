import React, { useState, useEffect } from 'react';
import { apiGet, apiPost, apiPut } from '@/services/api';
import { authService } from '@/services/auth';

const API_BASE_URL = 'http://test.intelliview.site';

interface QuestionData {
  questionId: number;
  questionText: string;
  category?: string;
  difficultyLevel?: string;
  tags?: string[];
}

interface FeedbackData {
  modelAnswer: string;
  userAnswer: string;
  attemptCount: number;
}

interface CategoryData {
  category: 'BACKEND' | 'FRONTEND' | 'DEVOPS' | 'CS';
}

const DailyQuestion: React.FC = () => {
  const [question, setQuestion] = useState<QuestionData | null>(null);
  const [answer, setAnswer] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [currentCategory, setCurrentCategory] = useState<string | null>(null);
  const [isCategoryLoading, setIsCategoryLoading] = useState(false);
  const [hasExistingCategory, setHasExistingCategory] = useState(false);

  // 컴포넌트 마운트 시 오늘의 질문 조회
  useEffect(() => {
    fetchTodayQuestion();
    getCurrentCategory();
  }, []);

  // GET /api/v1/daily/question - 오늘의 질문 조회
  const fetchTodayQuestion = async () => {
    try {
      setIsInitialLoading(true);
      setError(null);
      
      const response = await apiGet('/api/v1/daily/question');
      
      setQuestion({
        questionId: response.questionId,
        questionText: response.questionText,
        category: response.category || "일반",
        difficultyLevel: response.difficultyLevel || "중급",
        tags: response.tags || ["면접", "준비"]
      });

      // 기존에 답변했는지 확인 (만약 답변이 있다면 상태 업데이트)
      if (response.hasAnswered) {
        setIsSubmitted(true);
        fetchFeedback();
      }
      
    } catch (error: any) {
      console.error('오늘의 질문 조회 실패:', error);
      
      // 카테고리 미설정 에러인 경우
      if (error.message && error.message.includes('카테고리')) {
        setError('먼저 관심 분야 카테고리를 설정해주세요.');
        setShowCategoryModal(true);
        setHasExistingCategory(false);
        return;
      }
      
      setError('오늘의 질문을 불러오는데 실패했습니다. 다시 시도해주세요.');
      
      // 에러 발생 시 가상 데이터로 대체 (개발 중에만)
      setQuestion({
        questionId: 0,
        questionText: "본인의 전문 분야에서 가장 어려웠던 문제를 해결한 경험에 대해 설명해주세요. 어떤 접근 방식을 취했고, 그 결과는 어땠나요?",
        category: "문제 해결 능력",
        difficultyLevel: "중급",
        tags: ["경험", "문제 해결", "성과"]
      });
    } finally {
      setIsInitialLoading(false);
    }
  };

  // GET 현재 사용자 카테고리 조회
  const getCurrentCategory = async () => {
    try {
      const savedCategory = localStorage.getItem('userCategory');
      if (savedCategory) {
        setCurrentCategory(savedCategory);
        setHasExistingCategory(true);
      }
    } catch (error) {
      console.error('카테고리 조회 실패:', error);
    }
  };

  // POST /api/v1/daily/category - 카테고리 설정 (최초)
  const setCategory = async (category: CategoryData['category']) => {
    try {
      setIsCategoryLoading(true);
      setError(null);
      
      console.log('🔍 카테고리 설정 시도:', {
        category,
        isLoggedIn: authService.isLoggedIn(),
        token: authService.getToken()?.substring(0, 20) + '...'
      });

      if (!authService.isLoggedIn()) {
        setError('로그인이 필요합니다. 다시 로그인해주세요.');
        window.location.href = '/';
        return;
      }
      
      await apiPost('/api/v1/daily/category', { category });
      
      setCurrentCategory(category);
      setHasExistingCategory(true);
      localStorage.setItem('userCategory', category);
      setShowCategoryModal(false);
      
      fetchTodayQuestion();
      
    } catch (error: any) {
      console.error('카테고리 설정 실패:', error);
      
      if (error.message && error.message.includes('403')) {
        setError('인증이 필요합니다. 다시 로그인해주세요.');
        authService.logout();
        window.location.href = '/';
        return;
      }
      
      if (error.message && error.message.includes('이미 카테고리가 등록')) {
        // 이미 카테고리가 등록되어 있다면 PATCH로 변경
        setHasExistingCategory(true);
        updateCategory(category);
      } else {
        setError('카테고리 설정에 실패했습니다. 다시 시도해주세요.');
      }
    } finally {
      setIsCategoryLoading(false);
    }
  };

  // PATCH /api/v1/daily/category - 카테고리 수정
  const updateCategory = async (category: CategoryData['category']) => {
    try {
      setIsCategoryLoading(true);
      setError(null);
      
      if (!authService.isLoggedIn()) {
        setError('로그인이 필요합니다. 다시 로그인해주세요.');
        window.location.href = '/';
        return;
      }

      console.log('🔄 카테고리 업데이트 시도:', {
        category,
        token: authService.getToken()?.substring(0, 20) + '...'
      });
      
      const token = authService.getToken();
      const response = await fetch(`${API_BASE_URL}/api/v1/daily/category`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: JSON.stringify({ category })
      });

      console.log('📡 카테고리 업데이트 응답:', response.status);

      if (response.status === 403) {
        setError('인증이 만료되었습니다. 다시 로그인해주세요.');
        authService.logout();
        window.location.href = '/';
        return;
      }

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`카테고리 업데이트 실패: ${response.status} ${errorText}`);
      }
      
      setCurrentCategory(category);
      localStorage.setItem('userCategory', category);
      setShowCategoryModal(false);
      
      fetchTodayQuestion();
      
    } catch (error: any) {
      console.error('카테고리 업데이트 실패:', error);
      setError('카테고리 업데이트에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsCategoryLoading(false);
    }
  };

  // POST /api/v1/daily/question - 답변 제출
  const submitAnswer = async () => {
    if (!answer.trim()) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      await apiPost('/api/v1/daily/question', {
        answer: answer.trim()
      });
      
      setIsSubmitted(true);
      
      await fetchFeedback();
      
    } catch (error) {
      console.error('답변 제출 실패:', error);
      setError('답변 제출에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  // GET /api/v1/daily/feedback - 피드백 조회
  const fetchFeedback = async () => {
    try {
      const response = await apiGet('/api/v1/daily/feedback');
      
      setFeedback({
        modelAnswer: response.modelAnswer,
        userAnswer: response.userAnswer,
        attemptCount: response.attemptCount
      });
      
    } catch (error) {
      console.error('피드백 조회 실패:', error);
      setError('피드백을 불러오는데 실패했습니다.');
      
      setFeedback({
        modelAnswer: "모범 답안을 불러올 수 없습니다.",
        userAnswer: answer,
        attemptCount: 1
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitAnswer();
  };
  
  const resetQuestion = () => {
    setAnswer('');
    setIsSubmitted(false);
    setFeedback(null);
    setError(null);
    fetchTodayQuestion();
  };

  // 카테고리 선택 핸들러 - POST/PATCH 자동 판별
  const handleCategorySelect = (category: CategoryData['category']) => {
    if (hasExistingCategory || currentCategory) {
      // 이미 카테고리가 있으면 PATCH 사용
      updateCategory(category);
    } else {
      // 카테고리가 없으면 POST 사용
      setCategory(category);
    }
  };

  // 카테고리 표시 텍스트
  const getCategoryDisplayText = (category: string) => {
    const categoryMap: { [key: string]: string } = {
      'BACKEND': '백엔드',
      'FRONTEND': '프론트엔드', 
      'DEVOPS': '데브옵스',
      'CS': 'CS 기초'
    };
    return categoryMap[category] || category;
  };

  // 카테고리 변경 버튼 클릭
  const handleCategoryChangeClick = () => {
    setShowCategoryModal(true);
  };

  // 초기 로딩 상태
  if (isInitialLoading) {
    return (
      <div className="pt-24 pb-16 min-h-screen">
        <div className="container mx-auto max-w-4xl px-4">
          <div className="text-center mb-12">
            <h1 className="text-3xl font-bold tracking-tight mb-4">오늘의 면접 질문</h1>
            <p className="text-muted-foreground">질문을 불러오는 중...</p>
          </div>
          <div className="glass rounded-xl p-8 text-center">
            <div className="animate-spin h-8 w-8 border-b-2 border-primary mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  // 에러 상태 (질문을 불러오지 못한 경우)
  if (!question) {
    return (
      <div className="pt-24 pb-16 min-h-screen">
        <div className="container mx-auto max-w-4xl px-4">
          <div className="text-center mb-12">
            <h1 className="text-3xl font-bold tracking-tight mb-4">오늘의 면접 질문</h1>
          </div>
          <div className="glass rounded-xl p-8 text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <button 
              onClick={fetchTodayQuestion}
              className="btn-bounce bg-primary hover:bg-primary/90 text-white px-6 py-2 rounded-lg font-medium"
            >
              다시 시도
            </button>
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

        {/* 카테고리 선택 섹션 */}
        <div className="glass rounded-xl p-6 mb-8 animate-slide-in">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
            <h2 className="text-lg font-medium mb-4 md:mb-0">관심 분야 설정</h2>
            <div className="flex items-center gap-4">
              {currentCategory && (
                <span className="text-sm text-muted-foreground">
                  현재: <span className="font-medium text-primary">{getCategoryDisplayText(currentCategory)}</span>
                </span>
              )}
              {currentCategory && (
                <button
                  onClick={handleCategoryChangeClick}
                  className="text-sm text-primary hover:underline"
                >
                  변경하기
                </button>
              )}
            </div>
          </div>
          
          {!currentCategory && (
            <>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {(['BACKEND', 'FRONTEND', 'DEVOPS', 'CS'] as const).map((category) => (
                  <button
                    key={category}
                    onClick={() => handleCategorySelect(category)}
                    disabled={isCategoryLoading}
                    className={`p-4 rounded-lg border-2 transition-all duration-200 border-gray-200 hover:border-primary hover:bg-primary/5 ${isCategoryLoading ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'}`}
                  >
                    <div className="font-medium text-sm">{getCategoryDisplayText(category)}</div>
                  </button>
                ))}
              </div>
              
              {isCategoryLoading && (
                <div className="flex items-center justify-center gap-2 text-muted-foreground mt-4">
                  <div className="animate-spin h-4 w-4 border-b-2 border-primary"></div>
                  <span>카테고리 설정 중...</span>
                </div>
              )}
              
              <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-sm text-amber-800">
                  💡 관심 분야를 선택하면 해당 분야에 맞는 면접 질문을 받을 수 있어요!
                </p>
              </div>
            </>
          )}

          {currentCategory && !showCategoryModal && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-800">
                ✅ <strong>{getCategoryDisplayText(currentCategory)}</strong> 분야로 설정되어 있습니다. 
                해당 분야에 맞는 질문을 받게 됩니다.
              </p>
            </div>
          )}
        </div>

        {/* 질문 카드 */}
        <div className="glass rounded-xl p-8 mb-8 animate-slide-in">
          <div className="mb-6">
            <h2 className="text-2xl font-bold leading-relaxed">
              {question.questionText}
            </h2>
          </div>

          {!isSubmitted ? (
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
                  disabled={isLoading || !answer.trim()}
                  className="w-full btn-bounce bg-primary hover:bg-primary/90 text-white py-3 rounded-lg font-medium disabled:opacity-50"
                >
                  {isLoading ? '제출 중...' : '답변 제출'}
                </button>
              </div>
            </form>
          ) : (
            // 제출 완료 상태
            <div className="space-y-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-2 text-green-700">
                  <span className="text-lg">✅</span>
                  <span className="font-medium">답변이 제출되었습니다!</span>
                </div>
                <p className="text-sm text-green-600 mt-1">
                  AI가 답변을 분석하고 피드백을 제공해드립니다.
                </p>
              </div>
              
              <button
                onClick={resetQuestion}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-lg font-medium"
              >
                새로운 질문으로 다시 연습하기
              </button>
            </div>
          )}

          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}
        </div>

        {/* 피드백 섹션 */}
        {feedback && (
          <div className="glass rounded-xl p-8 animate-slide-in">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
              <span className="text-primary">🤖</span>
              AI 피드백
            </h3>
            
            <div className="space-y-6">
              <div>
                <h4 className="font-medium mb-3 text-primary">📝 제출한 답변</h4>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-gray-700 leading-relaxed">{feedback.userAnswer}</p>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-3 text-primary">⭐ 모범 답안</h4>
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-gray-700 leading-relaxed">{feedback.modelAnswer}</p>
                </div>
              </div>

              <div className="text-sm text-muted-foreground">
                답변 횟수: {feedback.attemptCount}회
              </div>
            </div>
          </div>
        )}

        {/* 카테고리 설정 모달 */}
        {showCategoryModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-8 max-w-md w-full mx-4">
              <h2 className="text-xl font-bold mb-4 text-center">
                {currentCategory ? '관심 분야 변경' : '관심 분야 설정'}
              </h2>
              <p className="text-muted-foreground text-center mb-6">
                {currentCategory 
                  ? '새로운 관심 분야를 선택해주세요.' 
                  : '질문을 받을 관심 분야를 선택해주세요.'}
              </p>
              
              <div className="grid grid-cols-2 gap-3 mb-6">
                {(['BACKEND', 'FRONTEND', 'DEVOPS', 'CS'] as const).map((category) => (
                  <button
                    key={category}
                    onClick={() => handleCategorySelect(category)}
                    disabled={isCategoryLoading}
                    className={`p-4 rounded-lg border-2 transition-colors ${
                      currentCategory === category
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-gray-200 hover:border-primary hover:bg-primary/5'
                    } ${isCategoryLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <div className="font-medium">{getCategoryDisplayText(category)}</div>
                  </button>
                ))}
              </div>
              
              {isCategoryLoading && (
                <div className="flex items-center justify-center gap-2 text-muted-foreground mb-4">
                  <div className="animate-spin h-4 w-4 border-b-2 border-primary"></div>
                  <span>설정 중...</span>
                </div>
              )}
              
              <div className="flex gap-3">
                <button
                  onClick={() => setShowCategoryModal(false)}
                  disabled={isCategoryLoading}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                >
                  취소
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DailyQuestion;