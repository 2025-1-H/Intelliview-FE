import { authService } from './auth';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

// 공통 API 호출 함수
export const apiCall = async (
  endpoint: string, 
  options: RequestInit = {}
): Promise<Response> => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  // 기본 헤더 설정
  const defaultHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  // 인증이 필요한 요청일 경우 토큰 추가
  if (authService.isLoggedIn()) {
    const authHeaders = authService.getAuthHeaders();
    Object.assign(defaultHeaders, authHeaders);
  }

  // 옵션 병합
  const config: RequestInit = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, config);
    
    // 401 Unauthorized인 경우 로그아웃 처리
    if (response.status === 401) {
      authService.logout();
      window.location.href = '/';
      throw new Error('인증이 만료되었습니다. 다시 로그인해주세요.');
    }

    return response;
  } catch (error) {
    console.error('API call failed:', error);
    throw error;
  }
};

// GET 요청
export const apiGet = async (endpoint: string): Promise<any> => {
  const response = await apiCall(endpoint, { method: 'GET' });
  
  if (!response.ok) {
    throw new Error(`GET ${endpoint} failed: ${response.statusText}`);
  }
  
  return response.json();
};

// POST 요청
export const apiPost = async (endpoint: string, data?: any): Promise<any> => {
  const response = await apiCall(endpoint, {
    method: 'POST',
    body: data ? JSON.stringify(data) : undefined,
  });
  
  if (!response.ok) {
    throw new Error(`POST ${endpoint} failed: ${response.statusText}`);
  }
  
  // JSON 응답이 아닐 수도 있으므로 체크
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return response.json();
  } else {
    return response.text();
  }
};

// PUT 요청
export const apiPut = async (endpoint: string, data?: any): Promise<any> => {
  const response = await apiCall(endpoint, {
    method: 'PUT',
    body: data ? JSON.stringify(data) : undefined,
  });
  
  if (!response.ok) {
    throw new Error(`PUT ${endpoint} failed: ${response.statusText}`);
  }
  
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return response.json();
  } else {
    return response.text();
  }
};

// DELETE 요청
export const apiDelete = async (endpoint: string): Promise<any> => {
  const response = await apiCall(endpoint, { method: 'DELETE' });
  
  if (!response.ok) {
    throw new Error(`DELETE ${endpoint} failed: ${response.statusText}`);
  }
  
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return response.json();
  } else {
    return response.text();
  }
};