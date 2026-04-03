import { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuthStore } from '../store/authStore';
import LeaveBalanceCard from '../components/leave/LeaveBalanceCard';
import LeaveApplyForm from '../components/leave/LeaveApplyForm';
import LeavePolicyTable from '../components/leave/LeavePolicyTable';

// 04.03 수정 

const LeaveApplyPage = () => {
  const { user } = useAuthStore(); // 현재 로그인한 사용자 정보
  const [dbUser, setDbUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [leaveData, setLeaveData] = useState({
    totalAnnualLeave: 0,
    usedAnnualLeave: 0,
    remainingAnnualLeave: 0
  });

  // 1. 서버(db.json)에서 이 사용자의 최신 정보를 가져옵니다.
  useEffect(() => {
    const fetchLeaveData = async () => {
      if (!user?.id) return;
      try {
        setLoading(true);

        // 2. [가이드 6-6] 잔여 연차 조회
        const response = await api.get('/leave/balance');

        if (response.data.success) {
          // 3. 백엔드 DTO(LeaveBalanceResponseDto) 데이터를 그대로 저장
          setLeaveData(response.data.data);
        }

      } catch (error) {
        console.error("정보 로딩 실패:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaveData();
  }, [user]);

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
        <LeaveBalanceCard totalAnnualLeave={leaveData.totalAnnualLeave} 
           usedAnnualLeave={leaveData.usedAnnualLeave} remainingAnnualLeave={leaveData.remainingAnnualLeave}/>
      </div>

      {/* 2. 하단 2단 레이아웃 (신청 폼 + 정책 표) */}
      <div style={{ display: 'flex', gap: '30px', width: '100%', alignItems: 'flex-start' }}>
        {/* 왼쪽: 신청 폼 영역 (비중 1.6) */}
        <div style={{ flex: 1.6 }}> 
          {/* 위에서 계산한 remainingBalance를 전달하여 
              신청서 하단에 '잔여 OO일'이 정확히 뜨게 합니다. */}
          <LeaveApplyForm remainingBalance={leaveData.remainingAnnualLeave}
            user={user} />
        </div>

        {/* 오른쪽: 정책 안내 표 영역 (비중 1.4) */}
        <div style={{ flex: 1.4 }}>
          <LeavePolicyTable position={user?.position} />
        </div>
      </div>
    </div>
  );
};

export default LeaveApplyPage;