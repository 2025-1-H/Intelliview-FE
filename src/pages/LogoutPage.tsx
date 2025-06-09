import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/auth';

const LogoutPage: React.FC = () => {
  const navigate = useNavigate();
  const [showSignup, setShowSignup] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // 로그인 폼
  const [loginForm, setLoginForm] = useState({
    email: '',
    password: ''
  });
  
  // 회원가입 폼 (GitHub 주소 추가)
  const [signupForm, setSignupForm] = useState({
    username: '',
    email: '',
    password: '',
    passwordConfirm: '',
    githubUrl: '' // GitHub 주소 필드 추가
  });
  
  const [error, setError] = useState('');

  // 로그인 처리
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await authService.login({
        email: loginForm.email,
        password: loginForm.password
      });
      
      // 로그인 성공
      navigate('/home');
    } catch (error: any) {
      setError(error.message || '로그인에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // 회원가입
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // 비밀번호 확인
    if (signupForm.password !== signupForm.passwordConfirm) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }

    // 필수 필드 확인
    if (!signupForm.username || !signupForm.email || !signupForm.password) {
      setError('모든 필드를 입력해주세요.');
      return;
    }

    setIsLoading(true);

    try {
      await authService.signup({
        username: signupForm.username,
        email: signupForm.email,
        password: signupForm.password,
        githubUrl: signupForm.githubUrl || undefined // 빈 문자열이면 undefined로 처리
      });
      
      alert('회원가입이 완료되었습니다. 로그인해주세요.');
      
      setShowSignup(false);
      setSignupForm({
        username: '',
        email: '',
        password: '',
        passwordConfirm: '',
        githubUrl: '' // 초기화에 추가
      });
      setError('');
    } catch (error: any) {
      setError(error.message || '회원가입에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Logo Section */}
      <div className="container mx-auto px-4">
        <div className="py-5">
          <div className="text-2xl font-bold tracking-tight text-primary flex items-center gap-2 pointer-events-none">
            <span className="bg-primary text-white rounded-md px-2 py-1 text-sm">Interview</span>
            <span>Intelliview</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-4">
        <div className="w-full max-w-md">
          {showSignup ? (
            // 회원가입 폼
            <div className="bg-white p-8 rounded-xl shadow-md">
              <h2 className="text-2xl font-bold mb-6 text-center">회원가입</h2>
              
              {error && (
                <div className="bg-red-100 text-red-600 p-3 rounded mb-4 text-sm">
                  {error}
                </div>
              )}
              
              <form onSubmit={handleSignup} className="space-y-4">
                <div>
                  <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                    사용자명
                  </label>
                  <input
                    id="username"
                    type="text"
                    value={signupForm.username}
                    onChange={(e) => setSignupForm({...signupForm, username: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="사용자명을 입력하세요"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    이메일
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={signupForm.email}
                    onChange={(e) => setSignupForm({...signupForm, email: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="이메일 주소를 입력하세요"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                    비밀번호
                  </label>
                  <input
                    id="password"
                    type="password"
                    value={signupForm.password}
                    onChange={(e) => setSignupForm({...signupForm, password: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="비밀번호를 입력하세요"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="passwordConfirm" className="block text-sm font-medium text-gray-700 mb-1">
                    비밀번호 확인
                  </label>
                  <input
                    id="passwordConfirm"
                    type="password"
                    value={signupForm.passwordConfirm}
                    onChange={(e) => setSignupForm({...signupForm, passwordConfirm: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="비밀번호를 다시 입력하세요"
                    required
                  />
                </div>

                {/* GitHub 주소 입력 필드 추가 */}
                <div>
                  <label htmlFor="githubUrl" className="block text-sm font-medium text-gray-700 mb-1">
                    GitHub 주소 (선택사항)
                  </label>
                  <input
                    id="githubUrl"
                    type="url"
                    value={signupForm.githubUrl}
                    onChange={(e) => setSignupForm({...signupForm, githubUrl: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="https://github.com/username"
                  />
                  <p className="mt-1 text-xs text-red-600">
                    사용자의 Pinned된 리포지토리만 크롤링해서 문제 생성에 사용됩니다
                  </p>
                </div>
                
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-primary hover:bg-primary/90 text-white py-2.5 rounded-md font-medium disabled:opacity-50"
                  >
                    {isLoading ? '가입 중...' : '가입하기'}
                  </button>
                </div>
              </form>
              
              <div className="mt-4 text-center">
                <button 
                  onClick={() => setShowSignup(false)} 
                  className="text-sm text-primary hover:underline"
                >
                  이미 계정이 있으신가요? 로그인하기
                </button>
              </div>
            </div>
          ) : (
            // 로그인 화면
            <div className="text-center">
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

              {error && (
                <div className="bg-red-100 text-red-600 p-3 rounded mb-4 text-sm">
                  {error}
                </div>
              )}
              
              <form onSubmit={handleLogin} className="space-y-4 mb-6">
                <div>
                  <input
                    type="email"
                    value={loginForm.email}
                    onChange={(e) => setLoginForm({...loginForm, email: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="이메일을 입력하세요"
                    required
                  />
                </div>
                
                <div>
                  <input
                    type="password"
                    value={loginForm.password}
                    onChange={(e) => setLoginForm({...loginForm, password: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="비밀번호를 입력하세요"
                    required
                  />
                </div>
                
                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn-bounce w-full bg-primary hover:bg-primary/90 text-white px-8 py-3.5 rounded-lg font-medium shadow-sm disabled:opacity-50"
                >
                  {isLoading ? '로그인 중...' : '로그인'}
                </button>
              </form>
              
              <div className="mt-4 text-sm">
                <button 
                  onClick={() => setShowSignup(true)} 
                  className="text-primary hover:underline"
                >
                  계정이 없으신가요? 회원가입
                </button>
              </div>
              
              <p className="mt-4 text-sm text-muted-foreground">
                로그인하면 모든 서비스를 이용하실 수 있습니다.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LogoutPage;