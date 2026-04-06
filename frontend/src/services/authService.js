import axios from 'axios';

// 백엔드 API 기본 URL 설정
const AUTH_URL = 'http://localhost:8080/api/auth';
const DASHBOARD_URL = 'http://localhost:8080/api/v1/dashboard'; 

/**
 * [공통] Axios 인터셉터 설정
 * 모든 API 요청 시 로컬 스토리지에 저장된 JWT 토큰을 Authorization 헤더에 자동으로 삽입
 * 백엔드의 Authentication 인자를 정상적으로 파싱하기 위해 필수적인 설정
 */
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('user_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * 회원가입 API 호출 함수
 */
export const signup = async (userData) => {
  try {
    const response = await axios.post(`${AUTH_URL}/signup`, userData);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error('네트워크 오류');
  }
};

/**
 * 로그인 API 호출 함수
 */
export const login = async (userId, password) => {
  try {
    const response = await axios.post(`${AUTH_URL}/login`, { userId, password });
    
    // 로그인 성공 시 서버에서 받은 JWT 토큰을 로컬 스토리지에 저장
    if (response.data.token) {
      localStorage.setItem('user_token', response.data.token);
    }
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error('로그인 실패');
  }
};

/**
 * [추가] 관리자 대시보드 요약 정보 조회 API
 * 상단 지표(사용자수, 프로젝트수 등)와 연차 승인 대기 리스트를 가져옴
 * 연결: @GetMapping("/admin-summary")
 */
export const getAdminSummary = async () => {
  try {
    const response = await axios.get(`${DASHBOARD_URL}/admin-summary`);
    // 백엔드 ApiResponse 객체 내부의 실제 data 리턴
    return response.data.data; 
  } catch (error) {
    console.error("관리자 요약 조회 에러:", error);
    throw error.response ? error.response.data : new Error('데이터 로드 실패');
  }
};

/**
 * [추가] 프로젝트 현황 조회 API
 * 대시보드 우측의 프로젝트 리스트와 진척률 데이터를 가져옴
 * 연결: @GetMapping("/projects")
 */
export const getDashboardProjects = async () => {
  try {
    const response = await axios.get(`${DASHBOARD_URL}/projects`);
    return response.data.data;
  } catch (error) {
    console.error("프로젝트 현황 조회 에러:", error);
    throw error.response ? error.response.data : new Error('프로젝트 로드 실패');
  }
};

/**
 * [추가] Task 상태별 통계 및 완료율 조회 API
 * 하단의 대기/진행/완료/지연 통계와 전체 완료율을 가져옴
 * 연결: @GetMapping("/progress")
 */
export const getDashboardProgress = async () => {
  try {
    const response = await axios.get(`${DASHBOARD_URL}/progress`);
    return response.data.data;
  } catch (error) {
    console.error("Task 통계 조회 에러:", error);
    throw error.response ? error.response.data : new Error('통계 로드 실패');
  }
};

/**
 * 로그아웃 함수
 */
export const logout = () => {
  localStorage.removeItem('user_token');
};