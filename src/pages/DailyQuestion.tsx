import React, { useState, useEffect } from 'react';
import { apiGet, apiPost } from '@/services/api';
import { authService } from '@/services/auth';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

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
  const [needsCategorySetup, setNeedsCategorySetup] = useState(false);
  const [todayQuestionExists, setTodayQuestionExists] = useState(false);

  useEffect(() => {
    checkCategoryAndFetchQuestion();
  }, []);

  const checkCategoryAndFetchQuestion = async () => {
    try {
      setIsInitialLoading(true);
      setError(null);
      
      const savedCategory = localStorage.getItem('userCategory');
      if (savedCategory) {
        setCurrentCategory(savedCategory);
        setHasExistingCategory(true);
      }
      
      await fetchTodayQuestion();
      
    } catch (error: any) {
      console.error('초기 로딩 실패:', error);
    } finally {
      setIsInitialLoading(false);
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
        tags: response.tags || ["면접", "준비"]
      });

      setTodayQuestionExists(true);
      setNeedsCategorySetup(false);
      setHasExistingCategory(true);

      if (response.hasAnswered) {
        setIsSubmitted(true);
        fetchFeedback();
      }
      
    } catch (error: any) {
      console.error('오늘의 질문 조회 실패:', error);
      
      if (error.message && (error.message.includes('카테고리') || error.message.includes('403'))) {
        setError('관심 분야를 먼저 설정해주세요.');
        setNeedsCategorySetup(true);
        setShowCategoryModal(true);
        setHasExistingCategory(false);
        setCurrentCategory(null);
        setTodayQuestionExists(false);
        localStorage.removeItem('userCategory');
        return;
      }
      
      setError('오늘의 질문을 불러오는데 실패했습니다. 다시 시도해주세요.');
      throw error;
    }
  };

  const setCategory = async (category: CategoryData['category']) => {
    try {
      setIsCategoryLoading(true);
      setError(null);
      
      console.log('카테고리 설정 시도 (POST):', {
        category,
        isLoggedIn: authService.isLoggedIn(),
        hasExisting: hasExistingCategory,
        needsSetup: needsCategorySetup
      });

      if (!authService.isLoggedIn()) {
        setError('로그인이 필요합니다. 다시 로그인해주세요.');
        window.location.href = '/';
        return;
      }
      
      await apiPost('/api/v1/daily/category', { category });
      
      console.log('카테고리 설정 성공 (POST)');
      
      setCurrentCategory(category);
      setHasExistingCategory(true);
      setNeedsCategorySetup(false);
      localStorage.setItem('userCategory', category);
      setShowCategoryModal(false);
      
      await fetchTodayQuestion();
      
      console.log('카테고리 설정 완료, 질문 페이지로 이동');
      
    } catch (error: any) {
      console.error('카테고리 설정 실패 (POST):', error);
      
      if (error.message && error.message.includes('403')) {
        setError('인증이 필요합니다. 다시 로그인해주세요.');
        authService.logout();
        window.location.href = '/';
        return;
      }
      
      if (error.message && (error.message.includes('이미 카테고리가 등록') || error.message.includes('이미 존재'))) {
        console.log('이미 카테고리 존재, PATCH로 재시도');
        setHasExistingCategory(true);
        setNeedsCategorySetup(false);
        await updateCategory(category);
        return;
      }
      
      setError(`카테고리 설정에 실패했습니다: ${error.message}`);
    } finally {
      setIsCategoryLoading(false);
    }
  };

  const updateCategory = async (category: CategoryData['category']) => {
    try {
      setIsCategoryLoading(true);
      setError(null);
      
      console.log('카테고리 업데이트 시도 (PATCH):', {
        category,
        currentCategory,
        token: authService.getToken()?.substring(0, 20) + '...'
      });
      
      if (!authService.isLoggedIn()) {
        setError('로그인이 필요합니다. 다시 로그인해주세요.');
        window.location.href = '/';
        return;
      }

      const token = authService.getToken();
      const response = await fetch(`${API_BASE_URL}/api/v1/daily/category`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: JSON.stringify({ category })
      });

      console.log('카테고리 업데이트 응답 (PATCH):', response.status);

      if (response.status === 403) {
        setError('인증이 만료되었습니다. 다시 로그인해주세요.');
        authService.logout();
        window.location.href = '/';
        return;
      }

      if (!response.ok) {
        const errorText = await response.text();
        console.error('PATCH 응답 에러:', errorText);
        throw new Error(`카테고리 업데이트 실패: ${response.status} ${errorText}`);
      }

      console.log('카테고리 업데이트 성공 (PATCH)');
      
      setCurrentCategory(category);
      setHasExistingCategory(true);
      setNeedsCategorySetup(false);
      localStorage.setItem('userCategory', category);
      setShowCategoryModal(false);
      
      if (!todayQuestionExists) {
        console.log('오늘 질문이 없어서 새로 조회');
        await fetchTodayQuestion();
      } else {
        console.log('오늘 질문이 이미 존재하므로 조회하지 않음');
      }
      
    } catch (error: any) {
      console.error('카테고리 업데이트 실패 (PATCH):', error);
      
      if (error.message && error.message.includes('403')) {
        setError('인증이 만료되었습니다. 다시 로그인해주세요.');
        authService.logout();
        window.location.href = '/';
        return;
      }
      
      setError('카테고리 업데이트에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsCategoryLoading(false);
    }
  };

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

  const fetchFeedback = async () => {
    try {
      const response = await apiGet('/api/v1/daily/feedback');
      
      console.log('피드백 응답 데이터:', response);
      
      setFeedback({
        userAnswer: response.modelAnswer || answer,
        modelAnswer: response.answer || "모범 답안을 불러올 수 없습니다.",
        attemptCount: response.attemptCount || 1
      });
      
    } catch (error) {
      console.error('피드백 조회 실패:', error);
      setError('피드백을 불러오는데 실패했습니다.');
      
      setFeedback({
        userAnswer: answer,
        modelAnswer: "모범 답안을 불러올 수 없습니다.",
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

  const handleCategorySelect = (category: CategoryData['category']) => {
    console.log('카테고리 선택:', {
      category,
      hasExisting: hasExistingCategory,
      currentCategory,
      needsSetup: needsCategorySetup
    });

    if (needsCategorySetup) {
      console.log('최초 카테고리 설정 (POST)');
      setCategory(category);
    } else if (hasExistingCategory && currentCategory) {
      console.log('카테고리 변경 (PATCH)');
      updateCategory(category);
    } else {
      console.log('상태 불명확, POST 시도');
      setCategory(category);
    }
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

  const handleCategoryChangeClick = () => {
    setShowCategoryModal(true);
  };

  if (isInitialLoading) {
    return (
      <div className="pt-24 pb-16 min-h-screen">
        <div className="container mx-auto max-w-4xl px-4">
          <div className="text-center mb-12">
            <h1 className="text-3xl font-bold tracking-tight mb-4">오늘의 면접 질문</h1>
            <p className="text-muted-foreground">설정을 확인하는 중...</p>
          </div>
          <div className="glass rounded-xl p-8 text-center">
            <div className="animate-spin h-8 w-8 border-b-2 border-primary mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  if (needsCategorySetup && !question) {
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
                  <span>카테고리 설정 중... 잠시 후 질문 페이지로 이동합니다.</span>
                </div>
              </div>
            )}
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {(['BACKEND', 'FRONTEND', 'DEVOPS', 'CS'] as const).map((category) => (
                <button
                  key={category}
                  onClick={() => handleCategorySelect(category)}
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

  if (!question && !needsCategorySetup) {
    return (
      <div className="pt-24 pb-16 min-h-screen">
        <div className="container mx-auto max-w-4xl px-4">
          <div className="text-center mb-12">
            <h1 className="text-3xl font-bold tracking-tight mb-4">오늘의 면접 질문</h1>
          </div>
          <div className="glass rounded-xl p-8 text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <button 
              onClick={checkCategoryAndFetchQuestion}
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

        <div className="glass rounded-xl p-6 mb-8 animate-slide-in">
          <div className="flex flex-col md:flex-row md:items-center justify-between">
            <div className="mb-4 md:mb-0">
              <h2 className="text-lg font-medium mb-2">현재 관심 분야</h2>
              {currentCategory && (
                <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full">
                  <span className="font-medium">{getCategoryDisplayText(currentCategory)}</span>
                </div>
              )}
            </div>
            <div className="flex flex-col items-start md:items-end gap-2">
              <button
                onClick={handleCategoryChangeClick}
                className="text-sm text-primary hover:underline"
              >
                관심 분야 변경하기
              </button>
              {todayQuestionExists && (
                <p className="text-xs text-muted-foreground">
                  오늘 질문은 이미 생성되어 카테고리 변경이 내일부터 반영됩니다
                </p>
              )}
            </div>
          </div>
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
              <div className="space-y-6">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-green-700">
                    <span className="text-lg">답변 완료</span>
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
        )}

        {feedback && (
          <div className="glass rounded-xl p-8 animate-slide-in">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
              <span className="text-primary">AI 피드백</span>
            </h3>
            
            <div className="space-y-6">
              <div>
                <h4 className="font-medium mb-3 text-primary">제출한 답변</h4>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-gray-700 leading-relaxed">
                    {feedback.userAnswer || "답변을 불러올 수 없습니다."}
                  </p>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-3 text-primary">모범 답안</h4>
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-gray-700 leading-relaxed">
                    {feedback.modelAnswer || "모범 답안을 불러올 수 없습니다."}
                  </p>
                </div>
              </div>

              <div className="text-sm text-muted-foreground">
                답변 횟수: {feedback.attemptCount}회
              </div>
            </div>
          </div>
        )}

        {showCategoryModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-8 max-w-md w-full mx-4">
              <h2 className="text-xl font-bold mb-4 text-center">
                관심 분야 변경
              </h2>
              <p className="text-muted-foreground text-center mb-6">
                새로운 관심 분야를 선택해주세요.
                {todayQuestionExists && (
                  <span className="block text-xs text-amber-600 mt-2">
                    오늘 질문은 이미 생성되어 변경사항이 내일부터 적용됩니다.
                  </span>
                )}
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
                  <span>변경 중...</span>
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