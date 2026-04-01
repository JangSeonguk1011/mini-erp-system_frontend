import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import FindIdPage from './pages/FindIdPage'; 
import FindPwPage from './pages/FindPwPage';

// [기존] 대시보드 페이지
import AdminDashboard from './pages/AdminDashboard';
import UserDashboard from './pages/UserDashboard';
import ProjectPage from './pages/ProjectPage';

// [추가] 연차 관련 페이지 불러오기
import LeaveHistoryPage from './pages/LeaveHistoryPage'; // 신청 내역 페이지
import LeaveApplyPage from './pages/LeaveApplyPage';     // 연차 신청 페이지
import LeaveApprovalPage from './pages/LeaveApprovalPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/find-id" element={<FindIdPage />} />
        <Route path="/find-pw" element={<FindPwPage />} />
        
        {/* 일반 사용자 대시보드 */}
        <Route path="/dashboard" element={<UserDashboard />} />
        
        {/* 관리자 대시보드 */}
        <Route path="/admin/dashboard" element={<AdminDashboard />} />

        {/* [추가] 연차 관리 시스템 경로 설정 */}
        {/* 연차 신청 내역 (표가 있는 페이지) */}
        <Route path="/leaves" element={<LeaveHistoryPage />} />
        
        {/* 연차 신청 폼 (날짜 선택하고 신청하는 페이지) */}
        <Route path="/leaves/new" element={<LeaveApplyPage />} />

        {/* /admin/approvals 주소일 때 */}
        <Route path="/admin/approvals" element={<LeaveApprovalPage />} />

        {/* (선택사항)없는 주소로 들어왔을 때 처리 */}
        <Route path="*" element={<Navigate to="/login" />} />

        {/* 프로젝트 폼*/}
        <Route path="/project-page" element={<ProjectPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;