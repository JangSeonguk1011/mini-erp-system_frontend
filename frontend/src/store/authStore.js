import { create } from 'zustand';
import axios from '../api/axios';

export const useAuthStore = create((set, get) => ({
  user: JSON.parse(localStorage.getItem('user_info')) || null,
  isAuthenticated: !!localStorage.getItem('user_token'),

  login: async (credentials) => {
    try {
      // 1. 팀원이 확인해준 'id'와 'password' 키값으로 데이터를 구성합니다.
      const loginData = {
        id: credentials.userId || credentials.id || credentials.loginId, // 입력된 값을 'id'로 매핑
        password: credentials.password || credentials.pw
      };

      // 디버깅용: 실제로 나가는 데이터를 확인합니다.
      console.log("팀원 가이드에 맞춘 전송 데이터:", loginData);

      // 2. 확인된 경로인 /auth/login으로 POST 요청
      const response = await axios.post('/auth/login', loginData);

      // 3. 응답 처리 (팀원의 성공 데이터 구조 data.data.accessToken 참고)
      if (response.status === 200 && response.data.success) {
        const { accessToken, user } = response.data.data;

        localStorage.setItem('user_token', accessToken);
        localStorage.setItem('user_info', JSON.stringify(user));

        set({
          user: user,
          isAuthenticated: true
        });

        return { success: true, data: response.data };
      }
    } catch (error) {
      console.error("로그인 에러 상세:", error.response?.data || error.message);
      
      const message = error.response?.data?.message || '아이디 또는 비밀번호를 확인하세요.';
      return { success: false, message };
    }
  },

  logout: () => {
    localStorage.removeItem('user_token');
    localStorage.removeItem('user_info');
    set({ user: null, isAuthenticated: false });
    window.location.href = '/login';
  },

  checkRole: () => {
    const user = get().user;
    return user ? (user.user_role || user.role) : null;
  }
}));