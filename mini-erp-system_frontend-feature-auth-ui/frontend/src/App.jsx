import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';

// 레이아웃 및 공통 컴포넌트
import AdminLayout from './components/AdminLayout';

// 페이지 호출
import AdminDashboard from './pages/AdminDashboard';
import UserDashboard from './pages/UserDashboard'; // [추가] 일반 사용자용 대시보드
import LoginPage from './pages/LoginPage'; 
import TaskCreate from './pages/TaskCreate';
import TaskEdit from './pages/TaskEdit';
import ProjectManagement from './pages/ProjectManagement';
import AdminProjectAuth from './pages/AdminProjectAuth';

/**
 * [수정] 권한 보호 컴포넌트 (ProtectedRoute)
 * @param {string} requiredRole - 해당 페이지에 접근하기 위해 필요한 권한 ('ADMIN' 등)
 */
const ProtectedRoute = ({ children, requiredRole }) => {
  const { isAuthenticated, user } = useAuthStore();
  
  // 1. 로그인 여부 확인
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // 2. 권한 확인: 요구되는 권한이 있는데 유저 권한과 다를 경우
  if (requiredRole && user?.role !== requiredRole) {
    // 권한이 없으면 각자의 메인 페이지로 보냄
    return <Navigate to={user?.role === 'ADMIN' ? '/admin/dashboard' : '/user/dashboard'} replace />;
  }

  return children;
};

function App() {
  const { isAuthenticated, user } = useAuthStore();

  return (
    <BrowserRouter>
      <Routes>
        {/* ============================================================
           1. 관리자 영역 (Role: ADMIN) 
        ============================================================ */}
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute requiredRole="ADMIN">
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="project-auth" element={<AdminProjectAuth />} />
          <Route path="task-create" element={<TaskCreate />} />
          <Route path="task-edit" element={<TaskEdit />} />
          <Route path="projects" element={<ProjectManagement />} />
        </Route>

        {/* ============================================================
           2. 일반 사용자 영역 (Role: USER) 
        ============================================================ */}
        <Route 
          path="/user" 
          element={
            <ProtectedRoute requiredRole="USER">
              {/* 일반 사용자용 레이아웃이 있다면 여기서 감싸주세요 */}
              <UserDashboard /> 
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<UserDashboard />} />
        </Route>

        {/* ============================================================
           3. 공통 영역 (로그인 및 리다이렉트) 
        ============================================================ */}
        <Route path="/login" element={<LoginPage />} />
        
        {/* 루트 경로 접속 시 권한에 따라 자동 분기 */}
        <Route 
          path="/" 
          element={
            isAuthenticated 
              ? (user?.role === 'ADMIN' ? <Navigate to="/admin/dashboard" /> : <Navigate to="/user/dashboard" />)
              : <Navigate to="/login" />
          } 
        />

        {/* 잘못된 경로는 다시 루트로 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;