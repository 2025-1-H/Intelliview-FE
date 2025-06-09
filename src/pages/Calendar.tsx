import React, { useState, useEffect } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, addMonths, subMonths, isSameDay, isToday } from 'date-fns';
import { ko } from 'date-fns/locale';
import { apiGet } from '@/services/api';

// API 응답 타입 정의
interface UserDailyQuestionArchive {
  questionId: number;
  questionText: string;
  answer: string;
  attemptCount: number;
  createdAt: string;
}

interface InterviewAnswerArchive {
  interviewId: number;
  answer: string;
  score: number;
  feedback: string;
  createdAt: string;
}

interface DayArchive {
  date: string; // ISO date string
  dailyQuestion: UserDailyQuestionArchive | null;
  interviews: InterviewAnswerArchive[];
}

interface ArchiveSummary {
  totalCount: number;
  averageScore: number | null;
  maxScore: number | null;
  days: DayArchive[];
}

// 화면 표시용 데이터 타입
interface PracticeData {
  date: Date;
  questionCount: number;
  averageScore: number;
}

interface DetailData {
  date: Date;
  questions: Array<{
    question: string;
    answer: string;
    score: number;
    feedback: string;
  }>;
  averageScore: number;
}

const Calendar: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedPractice, setSelectedPractice] = useState<DetailData | null>(null);
  const [archiveData, setArchiveData] = useState<ArchiveSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // 현재 표시중인 달의 모든 날짜 계산
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const startDate = monthStart;
  const endDate = monthEnd;
  
  const dateFormat = "yyyy.MM";
  const days = eachDayOfInterval({ start: startDate, end: endDate });

  // 월별 아카이브 데이터 조회
  const fetchMonthArchive = async (year: number, month: number) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await apiGet(`/api/v1/archive/${year}/${month}`);
      setArchiveData(response);
      
    } catch (error: any) {
      console.error('월별 아카이브 조회 실패:', error);
      setError('데이터를 불러오는데 실패했습니다.');
      
      // 에러 발생 시 빈 데이터로 설정
      setArchiveData({
        totalCount: 0,
        averageScore: null,
        maxScore: null,
        days: []
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 일별 상세 데이터 조회
  const fetchDayArchive = async (year: number, month: number, day: number) => {
    try {
      const response = await apiGet(`/api/v1/archive/${year}/${month}/${day}`);
      
      // API 응답을 화면 표시용 형태로 변환
      const questions: DetailData['questions'] = [];
      
      // 일일 질문 추가
      if (response.dailyQuestion) {
        questions.push({
          question: response.dailyQuestion.questionText,
          answer: response.dailyQuestion.answer,
          score: 85, // 일일 질문은 점수가 없으므로 기본값 사용
          feedback: `${response.dailyQuestion.attemptCount}번째 시도입니다.`
        });
      }
      
      // 면접 답변들 추가
      if (response.interviews && response.interviews.length > 0) {
        response.interviews.forEach((interview: InterviewAnswerArchive) => {
          questions.push({
            question: "면접 질문", // API에서 질문 텍스트를 제공하지 않는 경우
            answer: interview.answer,
            score: interview.score,
            feedback: interview.feedback
          });
        });
      }
      
      // 평균 점수 계산
      const scores = questions.map(q => q.score).filter(score => score > 0);
      const averageScore = scores.length > 0 
        ? Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length)
        : 0;
      
      const detailData: DetailData = {
        date: new Date(response.date),
        questions,
        averageScore
      };
      
      setSelectedPractice(detailData);
      
    } catch (error: any) {
      console.error('일별 아카이브 조회 실패:', error);
      setSelectedPractice(null);
    }
  };

  // 날짜가 바뀔 때마다 월별 데이터 조회
  useEffect(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth() + 1; // Date 객체는 0부터 시작
    fetchMonthArchive(year, month);
  }, [currentDate]);

  // 달력 네비게이션
  const prevMonth = () => {
    setCurrentDate(subMonths(currentDate, 1));
    setSelectedDate(null);
    setSelectedPractice(null);
  };
  
  const nextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
    setSelectedDate(null);
    setSelectedPractice(null);
  };

  // API 데이터를 화면 표시용으로 변환
  const getPracticeDataList = (): PracticeData[] => {
    if (!archiveData || !archiveData.days) return [];
    
    return archiveData.days
      .filter(day => day.dailyQuestion || (day.interviews && day.interviews.length > 0))
      .map(day => {
        const date = new Date(day.date);
        let questionCount = 0;
        let totalScore = 0;
        let scoreCount = 0;
        
        // 일일 질문 카운트
        if (day.dailyQuestion) {
          questionCount += 1;
        }
        
        // 면접 답변 카운트 및 점수 계산
        if (day.interviews && day.interviews.length > 0) {
          questionCount += day.interviews.length;
          day.interviews.forEach(interview => {
            if (interview.score) {
              totalScore += interview.score;
              scoreCount += 1;
            }
          });
        }
        
        const averageScore = scoreCount > 0 ? Math.round(totalScore / scoreCount) : 75; // 기본값
        
        return {
          date,
          questionCount,
          averageScore
        };
      });
  };
  
  // 날짜별 연습 데이터 조회
  const getPracticeForDate = (date: Date): PracticeData | undefined => {
    const practiceDataList = getPracticeDataList();
    return practiceDataList.find(practice => 
      isSameDay(practice.date, date)
    );
  };
  
  // 날짜 선택 처리
  const handleDateClick = (day: Date) => {
    const formattedDate = format(day, 'yyyy-MM-dd');
    setSelectedDate(formattedDate);
    
    // 선택한 날짜의 상세 데이터 가져오기
    const year = day.getFullYear();
    const month = day.getMonth() + 1;
    const dayNum = day.getDate();
    
    fetchDayArchive(year, month, dayNum);
  };

  // 통계 계산
  const practiceDataList = getPracticeDataList();
  const totalPracticeDays = practiceDataList.length;
  const totalQuestions = practiceDataList.reduce((sum, practice) => sum + practice.questionCount, 0);
  const averageScore = archiveData?.averageScore ? Math.round(archiveData.averageScore) : 0;
  const maxScore = archiveData?.maxScore || 0;
  
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

        {/* 에러 메시지 */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 캘린더 */}
          <div className="lg:col-span-2 glass rounded-xl p-6 animate-slide-in">
            <div className="flex justify-between items-center mb-6">
              <button 
                onClick={prevMonth}
                className="p-2 rounded-full hover:bg-secondary transition-colors"
                disabled={isLoading}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </button>
              
              <h2 className="text-xl font-medium">
                {format(currentDate, dateFormat, { locale: ko })}
                {isLoading && <span className="ml-2 text-sm text-muted-foreground">로딩중...</span>}
              </h2>
              
              <button 
                onClick={nextMonth}
                className="p-2 rounded-full hover:bg-secondary transition-colors"
                disabled={isLoading}
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
                    disabled={isLoading}
                    className={`aspect-square rounded-lg flex flex-col items-center justify-center p-1 transition-all ${
                      isSelected 
                        ? 'bg-primary text-white' 
                        : isTodayDate 
                          ? 'bg-primary/10 text-primary' 
                          : practice 
                            ? 'bg-white hover:bg-white/80' 
                            : 'hover:bg-secondary'
                    } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
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
            
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="bg-white/60 rounded-lg p-4">
                  <h3 className="font-medium mb-2 text-sm">이번 달 연습 현황</h3>
                  <div className="flex justify-between items-center">
                    <div className="text-3xl font-bold">{totalPracticeDays}</div>
                    <div className="text-sm text-muted-foreground">총 연습일</div>
                  </div>
                  <div className="mt-4 flex justify-between text-sm">
                    <div>
                      <div className="font-medium">{totalQuestions}</div>
                      <div className="text-muted-foreground">총 문제 수</div>
                    </div>
                    <div>
                      <div className="font-medium">-</div>
                      <div className="text-muted-foreground">평균 점수</div>
                    </div>
                    <div>
                      <div className="font-medium">-</div>
                      <div className="text-muted-foreground">최고 점수</div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-medium mb-3 text-sm">가장 최근 연습</h3>
                  <div className="space-y-3">
                    {practiceDataList.slice(-3).reverse().map((practice, index) => (
                      <button
                        key={index}
                        onClick={() => handleDateClick(practice.date)}
                        className="w-full text-left bg-white/60 hover:bg-white/80 rounded-lg p-3 transition-all"
                      >
                        <div className="flex justify-between items-center">
                          <div className="text-sm font-medium">
                            {format(practice.date, 'MM월 dd일')}
                          </div>
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {practice.questionCount}개 문제 연습
                        </div>
                      </button>
                    ))}
                    
                    {practiceDataList.length === 0 && (
                      <div className="text-center py-4 text-muted-foreground text-sm">
                        이번 달 연습 기록이 없습니다.
                      </div>
                    )}
                  </div>
                </div>
                

              </div>
            )}
          </div>
        </div>
        
        {/* 선택된 날짜의 상세 정보 */}
        {selectedPractice && (
          <div className="glass rounded-xl p-6 mt-8 animate-scale-in">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-medium">
                {format(selectedPractice.date, 'yyyy년 MM월 dd일')} 연습 기록
              </h2>
            </div>
            
            <div className="space-y-6">
              {selectedPractice.questions.map((item, index) => (
                <div key={index} className="bg-white/60 rounded-lg p-5">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-medium">{item.question}</h3>
                  </div>
                  
                  <div className="mb-4">
                    <div className="text-xs text-muted-foreground mb-1">나의 답변:</div>
                    <p className="text-sm bg-white/50 rounded-lg p-3">{item.answer}</p>
                  </div>
                  
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">피드백:</div>
                    <p className="text-sm bg-primary/5 rounded-lg p-3">{item.feedback}</p>
                  </div>
                </div>
              ))}
              
              {selectedPractice.questions.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  이 날짜에는 연습 기록이 없습니다.
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Calendar;