// src/services/auth.ts (GitHub 주소 추가 버전)
export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  username: string;
  email: string;
  password: string;
  githubUrl?: string; // GitHub 주소 추가 (선택사항)
}

const API_BASE_URL = 'http://test.intelliview.site';

class AuthService {
  // 로그인
  async login(credentials: LoginRequest): Promise<string> {
    try {
      console.log('🚀 로그인 요청:', credentials);
      
      const response = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      console.log('📡 응답 상태:', response.status);
      
      // 헤더 정보를 더 자세히 출력
      console.log('📡 모든 응답 헤더들:');
      for (const [key, value] of response.headers.entries()) {
        console.log(`  ${key}: ${value}`);
      }

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ 로그인 실패:', errorText);
        throw new Error(`로그인에 실패했습니다: ${response.status} ${errorText}`);
      }

      // 1. Authorization 헤더에서 토큰 확인
      const authHeader = response.headers.get('Authorization');
      console.log('🔑 Authorization 헤더:', authHeader);
      
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.replace('Bearer ', '');
        console.log('✅ 헤더에서 토큰 발견:', token.substring(0, 20) + '...');
        localStorage.setItem('token', token);
        return token;
      }
      
      // 2. 응답 본문에서 토큰 확인
      const contentType = response.headers.get('content-type');
      console.log('📄 Content-Type:', contentType);
      
      if (contentType && contentType.includes('application/json')) {
        try {
          const responseData = await response.json();
          console.log('📦 JSON 응답:', responseData);
          
          if (responseData.token) {
            console.log('✅ 응답 본문에서 토큰 발견');
            localStorage.setItem('token', responseData.token);
            return responseData.token;
          }
        } catch (jsonError) {
          console.error('❌ JSON 파싱 실패:', jsonError);
        }
      }
      
      // 3. 텍스트 응답 확인
      try {
        const responseText = await response.text();
        console.log('📝 텍스트 응답:', responseText);
      } catch (textError) {
        console.error('❌ 텍스트 읽기 실패:', textError);
      }
      
      throw new Error('서버에서 JWT 토큰을 받지 못했습니다.');
      
    } catch (error) {
      console.error('💥 로그인 에러:', error);
      throw error;
    }
  }

  // 회원가입 (GitHub 주소 포함)
  async signup(userData: SignupRequest): Promise<string> {
    try {
      console.log('🚀 회원가입 요청:', userData);
      
      const response = await fetch(`${API_BASE_URL}/api/v1/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      console.log('📡 회원가입 응답 상태:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ 회원가입 실패:', errorText);
        throw new Error(errorText || '회원가입에 실패했습니다.');
      }

      const result = await response.text();
      console.log('✅ 회원가입 성공:', result);
      
      // GitHub 주소가 포함된 경우 로그 출력
      if (userData.githubUrl) {
        console.log('📝 GitHub 주소 등록됨:', userData.githubUrl);
      }
      
      return result;
    } catch (error) {
      console.error('💥 회원가입 에러:', error);
      throw error;
    }
  }

  // 로그아웃
  logout(): void {
    localStorage.removeItem('token');
    console.log('👋 로그아웃 완료');
  }

  // 토큰 가져오기
  getToken(): string | null {
    return localStorage.getItem('token');
  }

  // 로그인 상태 확인
  isLoggedIn(): boolean {
    const token = this.getToken();
    if (!token) return false;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      const isValid = payload.exp > currentTime;
      console.log('🔍 토큰 검증:', { 
        hasToken: !!token, 
        expired: payload.exp <= currentTime,
        isValid 
      });
      return isValid;
    } catch {
      console.log('❌ 토큰 검증 실패');
      return false;
    }
  }

  // API 요청용 헤더 가져오기
  getAuthHeaders(): Record<string, string> {
    const token = this.getToken();
    if (!token) return {};
    
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  }
}

export const authService = new AuthService();