import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import FindIdPage from './pages/FindIdPage'; 
import FindPwPage from './pages/FindPwPage';

// [추가] 새로 제작한 대시보드 페이지들을 불러옵니다.
// 파일명과 경로가 실제 프로젝트와 일치하는지 꼭 확인하세요!
import AdminDashboard from './pages/AdminDashboard';
import UserDashboard from './pages/UserDashboard';
import LeaveApprovalPage from './pages/LeaveApprovalPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
       
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/find-id" element={<FindIdPage />} />
        <Route path="/find-pw" element={<FindPwPage />} />
        
        {/* [추가] 로그인 후 이동할 대시보드 경로를 설정 */}
        
        {/* 일반 사용자 대시보드: LoginPage에서 navigate('/dashboard') 시 연결됨 */}
        <Route path="/dashboard" element={<UserDashboard />} />
        
        {/* 관리자 대시보드: LoginPage에서 navigate('/admin/dashboard') 시 연결됨 */}
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        
        {/* /admin/approvals 주소일 때 */}
        <Route path="/admin/approvals" element={<LeaveApprovalPage />} />
        

        {/* (선택사항)없는 주소로 들어왔을 때 처리 - 404 페이지 대신 로그인으로 이동
        <Route path="*" element={<Navigate to="/login" />} /> */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;