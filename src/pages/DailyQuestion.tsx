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
  const [showExample, setShowExample] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [currentCategory, setCurrentCategory] = useState<string | null>(null);
  const [isCategoryLoading, setIsCategoryLoading] = useState(false);

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
      // 백엔드에서 이미 답변한 경우를 알려주는 필드가 있다면 여기서 처리
      if (response.hasAnswered) {
        setIsSubmitted(true);
        // 이미 답변했다면 피드백도 가져오기
        fetchFeedback();
      }
      
    } catch (error: any) {
      console.error('오늘의 질문 조회 실패:', error);
      
      // 카테고리 미설정 에러인 경우
      if (error.message && error.message.includes('카테고리')) {
        setError('먼저 관심 분야 카테고리를 설정해주세요.');
        setShowCategoryModal(true);
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
      // 백엔드에 사용자 카테고리 조회 API가 없다면 
      // 질문 조회 시 에러 메시지로 판단하거나
      // 로컬 스토리지를 활용할 수 있습니다
      const savedCategory = localStorage.getItem('userCategory');
      if (savedCategory) {
        setCurrentCategory(savedCategory);
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
      
      // 인증 상태 확인 및 디버깅 로그 추가
      console.log('🔍 카테고리 설정 시도:', {
        category,
        isLoggedIn: authService.isLoggedIn(),
        token: authService.getToken()?.substring(0, 20) + '...'
      });

      if (!authService.isLoggedIn()) {
        setError('로그인이 필요합니다. 다시 로그인해주세요.');
        // 로그인 페이지로 리다이렉트
        window.location.href = '/';
        return;
      }
      
      await apiPost('/api/v1/daily/category', { category });
      
      setCurrentCategory(category);
      localStorage.setItem('userCategory', category);
      setShowCategoryModal(false);
      
      // 카테고리 설정 후 질문 다시 조회
      fetchTodayQuestion();
      
    } catch (error: any) {
      console.error('카테고리 설정 실패:', error);
      
      // 403 에러인 경우 인증 문제로 처리
      if (error.message && error.message.includes('403')) {
        setError('인증이 필요합니다. 다시 로그인해주세요.');
        authService.logout();
        window.location.href = '/';
        return;
      }
      
      if (error.message && error.message.includes('이미 카테고리가 등록')) {
        // 이미 카테고리가 있는 경우 업데이트로 전환
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
      
      // 인증 상태 확인
      if (!authService.isLoggedIn()) {
        setError('로그인이 필요합니다. 다시 로그인해주세요.');
        window.location.href = '/';
        return;
      }

      console.log('🔄 카테고리 업데이트 시도:', {
        category,
        token: authService.getToken()?.substring(0, 20) + '...'
      });
      
      // PATCH 요청을 위해 fetch를 직접 사용
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
      
      // 카테고리 업데이트 후 질문 다시 조회
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
      
      // 답변 제출 후 피드백 조회
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
      
      // 에러 발생 시 가상 피드백 데이터로 대체 (개발 중에만)
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
    setShowExample(false);
    setError(null);
    // 새로운 질문 조회
    fetchTodayQuestion();
  };

  // 카테고리 선택 핸들러
  const handleCategorySelect = (category: CategoryData['category']) => {
    if (currentCategory) {
      updateCategory(category);
    } else {
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
            {currentCategory && (
              <span className="text-sm text-muted-foreground">
                현재: <span className="font-medium text-primary">{getCategoryDisplayText(currentCategory)}</span>
              </span>
            )}
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {(['BACKEND', 'FRONTEND', 'DEVOPS', 'CS'] as const).map((category) => (
              <button
                key={category}
                onClick={() => handleCategorySelect(category)}
                disabled={isCategoryLoading}
                className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                  currentCategory === category
                    ? 'border-primary bg-primary text-white shadow-lg'
                    : 'border-gray-200 hover:border-primary hover:bg-primary/5'
                } ${isCategoryLoading ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'}`}
              >
                <div className="font-medium text-sm">{getCategoryDisplayText(category)}</div>
                <div className={`text-xs mt-1 ${
                  currentCategory === category ? 'text-white/80' : 'text-muted-foreground'
                }`}>
                  {category === 'BACKEND' && '서버, DB, API'}
                  {category === 'FRONTEND' && 'UI/UX, 웹개발'}
                  {category === 'DEVOPS' && '인프라, 배포'}
                  {category === 'CS' && '알고리즘, 자료구조'}
                </div>
                {currentCategory === category && (
                  <div className="text-xs mt-1 text-white/90">✓ 선택됨</div>
                )}
              </button>
            ))}
          </div>
          
          {isCategoryLoading && (
            <div className="flex items-center justify-center gap-2 text-muted-foreground mt-4">
              <div className="animate-spin h-4 w-4 border-b-2 border-primary"></div>
              <span>카테고리 설정 중...</span>
            </div>
          )}
          
          {!currentCategory && !isCategoryLoading && (
            <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-sm text-amber-800">
                💡 관심 분야를 선택하면 해당 분야에 맞는 면접 질문을 받을 수 있어요!
              </p>
            </div>
          )}
        </div>

        {/* 에러 메시지 */}
        {error && !showCategoryModal && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* 오늘의 질문 섹션 */}
        {question && (
          <div className="glass rounded-xl p-8 animate-slide-in">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
              <h2 className="text-xl font-medium">오늘의 질문</h2>
              <div className="flex flex-wrap gap-2 mt-2 md:mt-0">
                <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-medium">
                  {question.category}
                </span>
                <span className="bg-secondary text-muted-foreground px-3 py-1 rounded-full text-xs font-medium">
                  {question.difficultyLevel}
                </span>
                {question.tags?.map((tag, index) => (
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
              <p className="text-lg">{question.questionText}</p>
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
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <div className="animate-spin h-4 w-4 border-b-2 border-primary"></div>
                    <span>답변을 제출하는 중...</span>
                  </div>
                )}

                {isSubmitted && (
                  <button
                    type="button"
                    onClick={resetQuestion}
                    className="btn-bounce bg-primary hover:bg-primary/90 text-white px-6 py-2 rounded-lg font-medium"
                  >
                    새 질문 받기
                  </button>
                )}
              </div>
            </form>
          </div>
        )}

        {/* 카테고리 미설정 시 안내 */}
        {!question && !isInitialLoading && !error && (
          <div className="glass rounded-xl p-8 text-center">
            <div className="mb-4">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🎯</span>
              </div>
              <h3 className="text-lg font-medium mb-2">관심 분야를 선택해주세요!</h3>
              <p className="text-muted-foreground">
                관심 분야를 선택하시면 해당 분야에 맞는 면접 질문을 받을 수 있어요.
              </p>
            </div>
          </div>
        )}

        {/* 모범 답안 표시 */}
        {showExample && feedback && (
          <div className="glass rounded-xl p-8 mt-8 animate-slide-up">
            <h2 className="text-xl font-medium mb-4">모범 답안</h2>
            <div className="bg-white/60 rounded-lg p-5">
              <p className="whitespace-pre-line leading-relaxed">
                {feedback.modelAnswer}
              </p>
            </div>
            <div className="mt-4 text-center">
              <button
                onClick={() => setShowExample(false)}
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                모범 답안 숨기기
              </button>
            </div>
          </div>
        )}

        {/* 피드백 표시 */}
        {isSubmitted && feedback && (
          <div className="glass rounded-xl p-8 mt-8 animate-slide-up">
            <h2 className="text-xl font-medium mb-6">답변 분석 및 피드백</h2>
            
            <div className="space-y-6">
              <div className="bg-white/60 rounded-lg p-5">
                <h3 className="font-medium mb-3">제출한 답변</h3>
                <p className="text-muted-foreground whitespace-pre-line leading-relaxed">
                  {feedback.userAnswer}
                </p>
              </div>

              <div className="bg-white/60 rounded-lg p-5">
                <h3 className="font-medium mb-3">시도 횟수</h3>
                <p className="text-2xl font-bold text-primary">{feedback.attemptCount}회</p>
              </div>

              <div className="bg-white/60 rounded-lg p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium">모범 답안</h3>
                  <button
                    onClick={() => setShowExample(!showExample)}
                    className="text-sm text-primary hover:text-primary/80"
                  >
                    {showExample ? '숨기기' : '보기'}
                  </button>
                </div>
                {showExample && (
                  <p className="text-muted-foreground whitespace-pre-line leading-relaxed">
                    {feedback.modelAnswer}
                  </p>
                )}
              </div>
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
                    <div className="text-xs text-muted-foreground mt-1">
                      {category === 'BACKEND' && '서버, 데이터베이스, API'}
                      {category === 'FRONTEND' && 'UI/UX, 웹 개발, 반응형'}
                      {category === 'DEVOPS' && '인프라, 배포, 운영'}
                      {category === 'CS' && '자료구조, 알고리즘, 네트워크'}
                    </div>
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