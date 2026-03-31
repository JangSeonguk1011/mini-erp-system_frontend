// src/components/layout/Sidebar.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const Sidebar = () => {
  // 임시 
  const tempUser = {
    name: "김철수",
    dept: "개발팀",
    rank: "대리"
  };

  return (
    <div className="sidebar" style={{ width: '250px', background: '#f8f9fa', height: '100vh' }}>
      {/* 프로필 영역 */}
      <div className="profile-section" style={{ padding: '20px', borderBottom: '1px solid #ddd' }}>
        <div className="avatar" style={{ width: '40px', height: '40px', background: '#007bff', borderRadius: '50%' }}></div>
        <div className="user-info">
          <strong>{tempUser.name}</strong>
          <p style={{ fontSize: '12px', color: '#666' }}>{tempUser.dept} · {tempUser.rank}</p>
        </div>
      </div>

      {/* 메뉴 영역 */}
      <nav style={{ padding: '20px' }}>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          <li><Link to="/leaves/new">✈️ 연차 신청</Link></li>
          <li><Link to="/leaves/me">📋 신청 내역</Link></li>
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;