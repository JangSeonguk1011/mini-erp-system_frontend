import { create } from 'zustand';
import axios from '../api/axios';

/**
 * 사용자 인증 상태 관리 스토어 (Zustand)
 */
export const useAuthStore = create((set, get) => ({
  user: JSON.parse(localStorage.getItem('user_info')) || null, // 새로고침 시 로컬스토리지에서 복구
  isAuthenticated: !!localStorage.getItem('user_token'), // 토큰 존재 여부로 인증 확인

  /**
   * 로그인 API 호출 (Mock Server: json-server 기반)
   */
  login: async (credentials) => {
    try {
      // 1. json-server에 아이디와 비밀번호가 동시에 일치하는 유저가 있는지 쿼리 스트링으로 조회
      // 결과는 항상 [배열] 형태로 반환됨
      const response = await axios.get(`/users?userId=${credentials.userId}&password=${credentials.password}`);
      
      // 2. 검색 결과(배열)에 데이터가 들어있는지 확인
      if (response.data && response.data.length > 0) {
        // 배열의 0번째가 우리가 찾는 유저 객체
        const user = response.data[0]; 
        const accessToken = "mock-token-12345"; // 임시 토큰 생성
        
        // 브라우저 저장소에 토큰과 유저 기본 정보 저장 (새로고침 대비)
        localStorage.setItem('user_token', accessToken);
        localStorage.setItem('user_info', JSON.stringify(user)); 
        
        // Zustand 전역 상태 업데이트
        set({ 
          user: user, 
          isAuthenticated: true 
        });
        
        // LoginPage.jsx에서 navigate 처리를 위해 데이터를 리턴
        return { success: true, data: { user, accessToken } };
      } else {
        // 일치하는 유저가 없는 경우
        return { success: false, message: '아이디 또는 비밀번호가 일치하지 않습니다.' };
      }
    } catch (error) {
      console.error("로그인 통신 에러:", error);
      return { success: false, message: '서버 연결에 실패했습니다 (json-server가 켜져 있는지 확인하세요).' };
    }
  },

  /**
   * 회원가입 API 호출
   */
  signup: async (userData) => {
    try {
      // json-server는 POST 요청 시 데이터를 db.json의 해당 엔드포인트에 자동 추가함
      const response = await axios.post('/users', userData);
      
      // 성공 시 201(Created) 상태코드 반환
      if (response.status === 201) {
        return { success: true, message: '회원가입이 완료되었습니다!' };
      }
      return { success: false, message: '회원가입 과정에서 문제가 발생했습니다.' };
    } catch (error) {
      console.error("회원가입 에러:", error);
      return { success: false, message: '서버 연결 오류 또는 이미 존재하는 아이디입니다.' };
    }
  },

  /**
   * 로그아웃 처리
   */
  logout: () => {
    // 저장된 모든 인증 정보 삭제
    localStorage.removeItem('user_token');
    localStorage.removeItem('user_info');
    
    // 상태 초기화
    set({ user: null, isAuthenticated: false });
  },

  /**
   * [추가] 현재 사용자의 권한(Role) 확인 유틸리티
   */
  checkRole: () => {
    const user = get().user;
    return user ? user.role : null; // 'ADMIN' 또는 'USER' 반환
  }
}));