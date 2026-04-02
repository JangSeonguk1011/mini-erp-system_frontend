import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';

// 레이아웃 및 공통 컴포넌트
import AdminLayout from './components/AdminLayout';

// 기존 페이지 호출
import AdminDashboard from './pages/AdminDashboard';
import UserDashboard from './pages/UserDashboard';
import LoginPage from './pages/LoginPage'; 
import TaskCreate from './pages/TaskCreate';
import TaskEdit from './pages/TaskEdit';
import ProjectManagement from './pages/ProjectManagement';
import AdminProjectAuth from './pages/AdminProjectAuth';
import ProjectPage from './pages/ProjectPage'; 

// 연차 관련 페이지 호출
import LeaveHistoryPage from './pages/LeaveHistoryPage';   
import LeaveApplyPage from './pages/LeaveApplyPage';       
import LeaveApprovalPage from './pages/LeaveApprovalPage'; 

/**
 * 권한 보호 컴포넌트 (ProtectedRoute)
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
          <Route path="approvals" element={<LeaveApprovalPage />} />
        </Route>

        {/* ============================================================
           2. 일반 사용자 영역 (Role: USER) 
        ============================================================ */}
        <Route 
          path="/user" 
          element={
            <ProtectedRoute requiredRole="USER">
              <UserDashboard /> 
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<UserDashboard />} />
        </Route>

        {/* 사용자용 프로젝트 및 연차 페이지 */}
        <Route path="/project-page" element={<ProtectedRoute requiredRole="USER"><ProjectPage /></ProtectedRoute>} />
        <Route path="/leaves" element={<ProtectedRoute requiredRole="USER"><LeaveHistoryPage /></ProtectedRoute>} />
        <Route path="/leaves/new" element={<ProtectedRoute requiredRole="USER"><LeaveApplyPage /></ProtectedRoute>} />

        {/* ============================================================
           3. 공통 영역 (로그인 및 리다이렉트) 
        ============================================================ */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/find-id" element={<FindIdPage />} />
        <Route path="/find-pw" element={<FindPwPage />} />
        
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