import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Sidebar from "./components/layout/Sidebar"
import LeaveApplyPage from "./pages/LeaveApplyPage"
import LeaveHistoryPage from "./pages/LeaveHistoryPage"

const HeaderBar = () => {
  const location = useLocation();
  
  // 경로에 따른 제목 매핑
  const getTitle = () => {
    switch (location.pathname) {
      case '/leaves/new': return '연차 신청';
      case '/leaves/me': return '연차 신청 내역';
      default: return '그룹웨어';
    }
  };
  return (
    <div style={{ 
      height: '60px', 
      backgroundColor: '#fff', 
      borderBottom: '1px solid #e0e0e0', 
      display: 'flex', 
      alignItems: 'center', 
      padding: '0 30px' 
    }}>
      <span style={{ fontWeight: 'bold', fontSize: '18px' }}>{getTitle()}</span>
    </div>
  );
};

function App() {
  return (
    <Router>
      <div style={{ display: 'flex', width: '100%', minHeight: '100vh', backgroundColor: '#f5f7fb' }}>
        
        <aside style={{ 
          width: '240px',          // 사이드바 가로 너비
          flexShrink: 0, 
          backgroundColor: '#fff', // 사이드바 배경은 흰색
          borderRight: '1px solid #e0e0e0',
          height: '100vh',         // 브라우저 높이만큼 꽉 채우기
          position: 'sticky',      // 스크롤 내려도 고정
          top: 0,
          display: 'flex',
          flexDirection: 'column'
        }}>
          <Sidebar />
        </aside>

        <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {/* ✅ 고정된 텍스트 대신 HeaderBar 컴포넌트 사용 */}
          <HeaderBar />

          <div style={{ padding: '40px', width: '100%', boxSizing: 'border-box' }}>
            <Routes>
              <Route path="/leaves/new" element={<LeaveApplyPage />} />
              <Route path="/leaves/me" element={<LeaveHistoryPage />} />
            </Routes>
          </div>
        </main>

      </div>
    </Router>
  );
}

export default App
