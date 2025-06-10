import { useEffect, useRef } from 'react';

/**
 * 페이지 제목을 동적으로 관리하는 훅
 * @param title - 설정할 페이지 제목
 * @param keepOnUnmount - 컴포넌트 언마운트 시에도 제목 유지 여부 (기본값: false)
 */
export function useDocumentTitle(title: string, keepOnUnmount = false) {
  const defaultTitle = 'Interview Intelliview';
  const prevTitleRef = useRef<string>(document.title);
  
  useEffect(() => {
    // 이전 제목 저장
    prevTitleRef.current = document.title;
    
    // 새 제목 설정
    if (title) {
      document.title = `${title} - ${defaultTitle}`;
    } else {
      document.title = defaultTitle;
    }
    
    // 클린업 함수
    return () => {
      if (!keepOnUnmount) {
        document.title = prevTitleRef.current;
      }
    };
  }, [title, keepOnUnmount]);
}

/**
 * 페이지 제목을 즉시 설정하는 함수
 * @param title - 설정할 페이지 제목
 */
export function setDocumentTitle(title: string) {
  const defaultTitle = 'Interview Intelliview';
  
  if (title) {
    document.title = `${title} - ${defaultTitle}`;
  } else {
    document.title = defaultTitle;
  }
}

/**
 * 기본 제목으로 리셋하는 함수
 */
export function resetDocumentTitle() {
  document.title = 'Interview Intelliview';
}

/**
 * 현재 제목을 가져오는 함수
 */
export function getCurrentTitle(): string {
  return document.title;
}

// 페이지별 제목 상수
export const PAGE_TITLES = {
  HOME: '홈',
  DAILY_QUESTION: '오늘의 질문',
  LIVE_INTERVIEW: '실시간 면접',
  LIVE_INTERVIEW_READY: '면접 준비',
  LIVE_INTERVIEW_SETUP: '면접 설정',
  VIDEO_FEEDBACK: '자기소개 피드백',
  CALENDAR: '면접 캘린더',
  FEEDBACK_LIST: '피드백 목록',
  LOGIN: '로그인',
  SIGNUP: '회원가입',
  NOT_FOUND: '페이지를 찾을 수 없음'
} as const;