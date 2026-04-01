import { useState } from 'react';
import LeaveBalanceCard from '../components/leave/LeaveBalanceCard';
import LeaveApplyForm from '../components/leave/LeaveApplyForm';
import LeavePolicyTable from '../components/leave/LeavePolicyTable';

const LeaveApplyPage = () => {
  // 1. 로컬 스토리지에서 승인된 연차를 계산하여 초기 잔여 연차 설정
  const [remainingBalance] = useState(() => {
    const savedData = localStorage.getItem('leaveHistory');
    if (!savedData) return 15; // 데이터가 없으면 기본 15일

    const history = JSON.parse(savedData);
    const approvedDays = history
      .filter(item => item.status === '승인')
      .reduce((acc, cur) => acc + Number(cur.usedDays), 0);

    return 15 - approvedDays;
  });

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '30px' }}>
      
      {/* 헤더 영역 */}
      <div style={{ textAlign: 'left' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 'bold', margin: 0 }}>✈️ 연차 신청</h1>
        <p style={{ color: '#888', marginTop: '10px' }}>연차를 신청하고 잔여 현황을 확인하세요</p>
      </div>

      {/* 1. 상단 카드 (잔여 연차 현황 표시) */}
      <div style={{ width: '100%' }}>
        {/* LeaveBalanceCard 내부에서도 자체적으로 계산하지만, 
            필요시 remainingBalance를 props로 넘길 수도 있습니다. */}
        <LeaveBalanceCard />
      </div>

      {/* 2. 하단 2단 레이아웃 (신청 폼 + 정책 표) */}
      <div style={{ display: 'flex', gap: '30px', width: '100%', alignItems: 'flex-start' }}>
        {/* 왼쪽: 신청 폼 영역 (비중 1.6) */}
        <div style={{ flex: 1.6 }}> 
          {/* 위에서 계산한 remainingBalance를 전달하여 
              신청서 하단에 '잔여 OO일'이 정확히 뜨게 합니다. */}
          <LeaveApplyForm remainingBalance={remainingBalance} />
        </div>

        {/* 오른쪽: 정책 안내 표 영역 (비중 1.4) */}
        <div style={{ flex: 1.4 }}>
          <LeavePolicyTable />
        </div>
      </div>
    </div>
  );
};

export default LeaveApplyPage;