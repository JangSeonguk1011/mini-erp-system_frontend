import { useState} from 'react';
import LeaveBalanceCard from '../components/leave/LeaveBalanceCard';
import LeaveApplyForm from '../components/leave/LeaveApplyForm';
import LeavePolicyTable from '../components/leave/LeavePolicyTable';

const LeaveApplyPage = () => {
  const [remainingBalance] = useState(() => {
    const savedData = localStorage.getItem('leaveHistory');
    if (!savedData) return 15; // 데이터 없으면 기본 15일

    const history = JSON.parse(savedData);
    const approvedDays = history
      .filter(item => item.status === '승인')
      .reduce((acc, cur) => acc + Number(cur.usedDays), 0);

    return 15 - approvedDays;
  });
  

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '30px' }}>
      
      <div style={{ textAlign: 'left' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 'bold', margin: 0 }}>✈️ 연차 신청</h1>
        <p style={{ color: '#888', marginTop: '10px' }}>연차를 신청하고 잔여 현황을 확인하세요</p>
      </div>

      {/* 1. 상단 카드 (가로로 쭉 뻗게 함) */}
      <div style={{ width: '100%' }}>
        <LeaveBalanceCard />
      </div>

      {/* 2. 하단 2단 레이아웃 */}
      <div style={{ display: 'flex', gap: '30px', width: '100%', alignItems: 'flex-start' }}>
        <div style={{ flex: 1.6 }}> 
          <LeaveApplyForm remainingBalance={remainingBalance} />
        </div>
        <div style={{ flex: 1.4 }}>
          <LeavePolicyTable />
        </div>
      </div>
    </div>
  );
};

export default LeaveApplyPage;