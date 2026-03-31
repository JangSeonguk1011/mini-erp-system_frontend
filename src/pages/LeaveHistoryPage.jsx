import React from 'react';
import { useNavigate } from 'react-router-dom';
import LeaveHistoryTable from '../components/leave/LeaveHistoryTable';
import LeaveStatusCards from '../components/leave/LeaveStatusCards';

const LeaveHistoryPage = () => {

  const navigate = useNavigate();

  const handleGoToApply = () => {
    navigate('/leaves/new');
  }
  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '30px' }}>
      {/* 1. 헤더 영역 */}
      <div style={{ textAlign: 'left' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 'bold', margin: 0 }}>
        📋 연차 신청 내역
        </h1>
        <p style={{ color: '#666', marginTop: '10px' }}>나의 연차 신청 현황을 확인하세요</p>
      </div>

      <LeaveStatusCards />

      {/* 신청 내역 테이블 컴포넌트 */}
      <div style={styles.listContainer}>
        <div style={styles.listHeader}>
          <h3 style={{ margin: 0, fontSize: '18px' }}>연차 신청 목록</h3>
          <button onClick={handleGoToApply} style={styles.applyBtn}>+ 신청하기</button>
        </div>
        <LeaveHistoryTable />
      </div>
    </div>
  );
};

const styles = {
  listContainer: {
    backgroundColor: 'white',
    padding: '25px',
    borderRadius: '12px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
  },
  listHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px'
  },
  applyBtn: {
    backgroundColor: '#254EDB',
    color: 'white',
    border: 'none',
    padding: '10px 18px',
    borderRadius: '6px',
    fontWeight: 'bold',
    cursor: 'pointer'
  }
};

export default LeaveHistoryPage;