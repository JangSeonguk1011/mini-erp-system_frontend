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
import SignupPage from './pages/SignupPage'; 
import FindIdPage from './pages/FindIdPage';
import FindPwPage from './pages/FindPwPage';

// 연차 관련 페이지 호출
import LeaveHistoryPage from './pages/LeaveHistoryPage';   
import LeaveApplyPage from './pages/LeaveApplyPage';       
import LeaveApprovalPage from './pages/LeaveApprovalPage'; 

/**
 * 권한 보호 컴포넌트 (ProtectedRoute)
 * 여러 권한을 허용할 수 있도록 allowedRoles 배열을 체크합니다.
 */
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, user } = useAuthStore();
  
  // 1. 로그인 여부 확인
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // [수정] 권한 확인 로직: TEAM_LEADER와 MANAGER 권한을 동일하게 취급할 수 있도록 보완
  const userRole = user?.role;
  const hasAccess = allowedRoles.includes(userRole) || 
                   (allowedRoles.includes('MANAGER') && userRole === 'TEAM_LEADER');

  if (allowedRoles && !hasAccess) {
    const redirectPath = (userRole === 'ADMIN' || userRole === 'TEAM_LEADER') 
      ? '/admin/dashboard' 
      : '/user/dashboard';
    return <Navigate to={redirectPath} replace />;
  }

  return children;
};

function App() {
  const { isAuthenticated, user } = useAuthStore();

  return (
    <BrowserRouter>
      <Routes>
        {/* ============================================================
           1. 관리자 및 팀장 공용 영역 (/admin)
           - 관리소장과 팀장은 같은 레이아웃을 사용하되 내부 컴포넌트에서 권한 분기
        ============================================================ */}
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute allowedRoles={['ADMIN', 'TEAM_LEADER', 'MANAGER']}>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          {/* 기본 대시보드 */}
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          
          {/* 업무 및 프로젝트 관리 */}
          <Route path="project-auth" element={<AdminProjectAuth />} />
          <Route path="task-create" element={<TaskCreate />} />
          <Route path="task-edit" element={<TaskEdit />} />
          <Route path="projects" element={<ProjectManagement />} />
          
          {/* [추가/수정] 연차 승인 경로
              사이드바에서 basePath를 통해 접근하므로 두 경로 모두 LeaveApprovalPage를 바라보게 설정 
              LeaveApprovalPage 내부에서 user.role에 따라 팀장용/소장용 데이터를 필터링합니다. */}
          <Route path="approvals" element={<LeaveApprovalPage />} />
          <Route path="leave-approval" element={<LeaveApprovalPage />} /> 
        </Route>

        {/* [추가] 팀장 전용 경로 (/manager) 
            사이드바에서 /manager/dashboard 등으로 접근할 경우를 대비하여 /admin으로 포워딩하거나 별도 구성 */}
        <Route 
          path="/manager" 
          element={
            <ProtectedRoute allowedRoles={['TEAM_LEADER', 'MANAGER']}>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="approvals" element={<LeaveApprovalPage />} />
          <Route path="leaves" element={<LeaveHistoryPage />} />  
          <Route path="leaves/new" element={<LeaveApplyPage />} />
          <Route path="task-edit" element={<TaskEdit />} />
          <Route path="projects" element={<ProjectManagement />} />
        </Route>

        {/* ============================================================
           2. 일반 사원 영역 (/user)
        ============================================================ */}
        <Route 
          path="/user" 
          element={
            <ProtectedRoute allowedRoles={['USER']}>
              <UserDashboard /> 
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<UserDashboard />} />
        </Route>

        {/* 사원 전용 기타 페이지 */}
        <Route 
          path="/project-page" 
          element={<ProtectedRoute allowedRoles={['USER']}><ProjectPage /></ProtectedRoute>} 
        />
        <Route 
          path="/leaves" 
          element={<ProtectedRoute allowedRoles={['USER']}><LeaveHistoryPage /></ProtectedRoute>} 
        />
        <Route 
          path="/leaves/new" 
          element={<ProtectedRoute allowedRoles={['USER']}><LeaveApplyPage /></ProtectedRoute>} 
        />

        {/* ============================================================
           3. 공통 영역
        ============================================================ */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/find-id" element={<FindIdPage />} />
        <Route path="/find-pw" element={<FindPwPage />} />

        {/* 루트 경로 리다이렉트 */}
        <Route 
          path="/" 
          element={
            isAuthenticated 
              ? (
                (user?.role === 'ADMIN' || user?.role === 'TEAM_LEADER' || user?.role === 'MANAGER') 
                  ? <Navigate to="/admin/dashboard" /> 
                  : <Navigate to="/user/dashboard" />
              )
              : <Navigate to="/login" />
          } 
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;