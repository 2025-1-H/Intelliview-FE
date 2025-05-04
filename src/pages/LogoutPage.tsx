import React from 'react';
import { Link } from 'react-router-dom';

const LogoutPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Logo Section - 왼쪽 상단에 위치 */}
      <div className="p-6">
        <Link 
          to="/" 
          className="text-2xl font-bold tracking-tight text-primary flex items-center gap-2"
        >
          <span className="bg-primary text-white rounded-md px-2 py-1 text-sm">Interview</span>
          <span>Intelliview</span>
        </Link>
      </div>

      {/* Main Content - 중앙 정렬 */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-md text-center">
          <div className="inline-block mb-4 bg-blue-100 text-blue-600 px-6 py-2 rounded-full text-sm font-medium">
            AI 면접 준비의 새로운 시작
          </div>
          
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            <span className="text-primary">AI</span>와 함께하는<br />
            면접 실력 향상
          </h1>
          
          <p className="text-muted-foreground max-w-md mx-auto mb-10">
            자기소개부터 실시간 면접 시뮬레이션까지, Interview Intelliview와 함께 
            자신감 있게 면접을 준비하세요.
          </p>
          
          <div className="space-y-4">
            <button 
              className="btn-bounce w-full bg-white hover:bg-gray-50 text-gray-800 border border-gray-300 px-8 py-3.5 rounded-lg font-medium shadow-sm flex items-center justify-center gap-2"
              onClick={() => console.log("이메일 로그인 진행")}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
              </svg>
              이메일로 로그인
            </button>
            
            <button 
              className="btn-bounce w-full bg-[#FEE500] hover:bg-[#FEE500]/90 text-[#191919] px-8 py-3.5 rounded-lg font-medium shadow-sm flex items-center justify-center gap-2"
              onClick={() => console.log("카카오 로그인 진행")}
            >
              <svg width="20" height="20" viewBox="0 0 20 20">
                <path fill="#191919" d="M10 0C4.477 0 0 3.432 0 7.667c0 2.614 1.732 4.932 4.367 6.17.037.221.016.594-.08.847l-.573 2.306c-.04.288.28.566.547.11L8.013 14.4c.64.096 1.32.148 2.012.148 5.522 0 10-3.432 10-7.667C20 3.432 15.522 0 10 0z"/>
              </svg>
              카카오 로그인
            </button>
          </div>
          
          <p className="mt-4 text-sm text-muted-foreground">
            로그인하면 모든 서비스를 무료로 이용하실 수 있습니다.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LogoutPage;