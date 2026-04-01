import { create } from 'zustand';
import axios from '../api/axios';

/**
 * 사용자 인증 상태 관리 스토어
 */
export const useAuthStore = create((set) => ({
  user: null,
  isAuthenticated: false,

  // 로그인 API 호출 (아이디 기반)
  // src/store/authStore.js

login: async (credentials) => {
  try {
    // 1. json-server에 아이디와 비밀번호가 동시에 일치하는 유저가 있는지 물어봄.
    // 결과는 항상 [배열] 형태
    const response = await axios.get(`/users?userId=${credentials.userId}&password=${credentials.password}`);
    
    // 2. 검색 결과(배열)에 데이터가 들어있는지 확인합니다.
    if (response.data && response.data.length > 0) {
      // 배열의 0번째가 우리가 찾는 유저 객체입니다.
      const user = response.data[0]; 
      const accessToken = "mock-token-12345"; // 임시 토큰
      
      // 브라우저에 로그인 정보 저장
      localStorage.setItem('user_token', accessToken);
      
      // Zustand 상태 업데이트
      set({ 
        user: user, 
        isAuthenticated: true 
      });
      
      return { success: true, data: { user, accessToken } };
    } else {
      // 검색 결과가 빈 배열([])이면 아이디나 비번이 틀린 것
      return { success: false, message: '아이디 또는 비밀번호가 일치하지 않습니다.' };
    }
  } catch (error) {
    console.error("로그인 통신 에러:", error);
    return { success: false, message: '서버 연결에 실패했습니다 (포트 번호를 확인하세요).' };
  }
},

  signup: async (userData) => {
  try {
    /** * [체크 포인트] 
     * 1. 경로는 '/users' 여야 합니다.
     * 2. 메서드는 'post' 여야 합니다.
     */
    const response = await axios.post('/users', userData);
    
    // json-server는 성공 시 생성된 데이터를 201 상태코드와 함께 돌려줍니다.
    if (response.status === 201) {
      return { success: true, message: '회원가입이 완료되었습니다!' };
    }
    return { success: false, message: '회원가입 실패' };
  } catch (error) {
    // 만약 userId가 중복되면 에러가 날 수 있습니다 (id로 설정했을 경우)
    console.error("회원가입 에러:", error);
    return { success: false, message: '서버 연결 오류 또는 중복된 아이디입니다.' };
  }
},

  logout: () => {
    localStorage.removeItem('user_token');
    set({ user: null, isAuthenticated: false });
  },
}));