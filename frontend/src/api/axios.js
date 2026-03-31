import axios from 'axios';

// [수정] json-server는 보통 루트(/) 경로를 사용합니다.
const instance = axios.create({
  baseURL: 'http://localhost:8080', // ✅ '/api/v1'을 제거했습니다.
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// 모든 요청에 토큰 자동 포함
instance.interceptors.request.use((config) => {
  const token = localStorage.getItem('user_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default instance;