import React, { useState, useEffect, useRef } from 'react';
import { Bell, Calendar, Clock, ChevronRight, ListChecks } from 'lucide-react';
import api from '@/api/axios';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';

const AdminDashboard = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const notificationRef = useRef(null);

  // --- 상태 관리 ---
  const [pendingRequests, setPendingRequests] = useState({ leave: [], overtime: [] });
  const [taskStats, setTaskStats] = useState({
    todo: 0, inProgress: 0, done: 0, delayed: 0, total: 0, completionRate: 0
  });
  const [loading, setLoading] = useState(true);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  // --- 권한 체크 로직 ---
  const userRole = user?.role || '';
  const userPosition = user?.position || '';
  
  // 관리소장: ADMIN 권한이거나 직급이 관리소장인 경우
  const isChief = userRole === 'ADMIN' || userPosition === '관리소장';
  // 팀장: MANAGER/TEAM_LEADER 권한이거나 직급이 팀장인 경우
  const isTeamLeader = userRole === 'MANAGER' || userRole === 'TEAM_LEADER' || userPosition === '팀장';

  // --- 데이터 로드 함수 ---
  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      const apiCalls = [
        api.get('/leave/all'),    // 전사 연차 내역
        api.get('/overtime/all')  // 전사 특근 내역
      ];

      if (isChief) {
        apiCalls.push(api.get('/tasks'));
      }

      const results = await Promise.allSettled(apiCalls);
      const leaveRes = results[0];
      const overtimeRes = results[1];
      const taskRes = isChief ? results[2] : null;

      const requests = { leave: [], overtime: [] };

      // 1. 연차 데이터 처리 (핵심 수정: DTO의 userRole 활용 및 영문 매칭)
      if (leaveRes.status === 'fulfilled' && leaveRes.value?.data?.success) {
        const allLeave = leaveRes.value.data.data || [];
        requests.leave = allLeave.filter(req => {
          const isPending = req.appStatus === 'PENDING';
          const role = req.userRole; // DTO의 필드명 사용
          
          if (isChief) {
            // 관리소장은 팀장(TEAM_LEADER)의 신청 건만 필터링
            return isPending && role === 'TEAM_LEADER';
          }
          if (isTeamLeader) {
            // 팀장은 일반 사원(USER)의 신청 건만 필터링
            return isPending && role === 'USER';
          }
          return false;
        });
      }

      // 2. 특근 데이터 처리 (핵심 수정: 오타 수정 및 필터링 로직 통일)
      if (overtimeRes.status === 'fulfilled' && overtimeRes.value?.data?.success) {
        const allOvertime = overtimeRes.value.data.data || [];
        requests.overtime = allOvertime.filter(req => {
          const isPending = req.appStatus === 'PENDING';
          const role = req.userRole;
          
          if (isChief) return isPending && role === 'TEAM_LEADER';
          if (isTeamLeader) return isPending && role === 'USER';
          return false;
        });
      }

      // 3. Task 통계 데이터 처리 (ADMIN 전용)
      if (isChief && taskRes && taskRes.status === 'fulfilled' && taskRes.value?.data) {
        const allTasks = taskRes.value.data.data || (Array.isArray(taskRes.value.data) ? taskRes.value.data : []);
        
        const stats = {
          todo: allTasks.filter(t => ['TODO', '대기'].includes(t.status)).length,
          inProgress: allTasks.filter(t => ['IN_PROGRESS', '진행중'].includes(t.status)).length,
          done: allTasks.filter(t => ['DONE', '완료'].includes(t.status)).length,
          delayed: allTasks.filter(t => ['DELAYED', '지연'].includes(t.status)).length,
          total: allTasks.length
        };

        const rate = stats.total > 0 ? Math.round((stats.done / stats.total) * 100) : 0;
        setTaskStats({ ...stats, completionRate: rate });
      }

      setPendingRequests(requests);
    } catch (error) {
      console.error("데이터 로드 중 에러 발생:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchDashboardData();
  }, [userRole, userPosition]);

  useEffect(() => {
    const handleOutside = (e) => {
      if (notificationRef.current && !notificationRef.current.contains(e.target)) {
        setIsNotificationOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  if (!user || loading) {
    return (
      <div className="flex items-center justify-center h-screen text-gray-400 font-bold">
        데이터를 불러오는 중입니다...
      </div>
    );
  }

  const totalPending = (pendingRequests.leave?.length || 0) + (pendingRequests.overtime?.length || 0);

  return (
    <div className="animate-fadeIn">
      {/* 1. 헤더 섹션 */}
      <header className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-xl font-extrabold text-gray-800 tracking-tight">
            {isChief ? "관리소장 대시보드" : "팀장 대시보드"}
          </h2>
          <p className="text-xs text-gray-400 mt-1 font-medium">
            {isChief ? "팀장 직급의 신청 건을 관리합니다." : "소속 팀원들의 신청 내역을 검토합니다."}
          </p>
        </div>
        
        <div className="flex items-center gap-4 relative" ref={notificationRef}>
          <div 
            onClick={() => setIsNotificationOpen(!isNotificationOpen)}
            className={`relative p-2 rounded-full cursor-pointer transition-all ${isNotificationOpen ? 'bg-blue-50 text-blue-600' : 'text-gray-400 hover:bg-gray-100'}`}
          >
            <Bell size={22} />
            {totalPending > 0 && <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>}
          </div>

          {isNotificationOpen && (
            <div className="absolute top-12 right-0 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden">
              <div className="p-4 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                <span className="text-sm font-bold text-gray-700">미처리 승인 요청</span>
                <span className="text-[10px] bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-black">{totalPending}건</span>
              </div>
              <div className="max-h-[350px] overflow-y-auto">
                {pendingRequests.leave?.map(req => (
                  <NotificationItem 
                    key={req.appId} 
                    name={req.requesterName} 
                    rank={req.userRole} // role 정보를 전달
                    type={req.appType} 
                    date={req.startDate} 
                    onClick={() => navigate(isChief ? '/admin/leave-approval' : '/manager/leave-approval')} 
                  />
                ))}
                {totalPending === 0 && <div className="py-12 text-center text-gray-400 text-xs font-bold">대기 중인 결재 건이 없습니다.</div>}
              </div>
            </div>
          )}
          <div className="w-9 h-9 bg-emerald-600 text-white rounded-full flex items-center justify-center text-xs font-black border-2 border-emerald-100 shadow-sm">
            {isChief ? "소" : "팀"}
          </div>
        </div>
      </header>

      {/* 2. 상단 통계 카드 */}
      <div className="grid grid-cols-4 gap-6 mb-6">
        <AdminStatCard title="전체 사용자" count="24" change="+2 이번 달" />
        <AdminStatCard title="진행 중 프로젝트" count="8" change="총 12개 프로젝트" />
        <AdminStatCard 
          title={isChief ? "팀장 연차 대기" : "사원 연차 대기"} 
          count={pendingRequests.leave?.length || 0} 
          change={pendingRequests.leave?.length > 0 ? "즉시 처리 필요" : "완료"} 
          color={pendingRequests.leave?.length > 0 ? "red" : "emerald"} 
        /> 
        <AdminStatCard title="전체 Task" count={isChief ? taskStats.total : "-"} change={isChief ? `완료율 ${taskStats.completionRate}%` : "관리자 전용"} />
      </div>

      {/* 3. 중간 섹션 (신청 내역) */}
      <div className="grid grid-cols-12 gap-6 mb-6">
        <div className="col-span-7 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 border-b border-gray-50 flex justify-between items-center bg-gray-50/30">
            <h3 className="text-sm font-bold text-gray-700">
              🚩 {isChief ? "최근 팀장 연차 신청 내역" : "최근 사원 연차 신청 내역"}
            </h3>
            <button 
              onClick={() => navigate(isChief ? '/admin/leave-approval' : '/manager/leave-approval')} 
              className="text-blue-600 text-[11px] font-bold hover:underline"
            >
              전체보기
            </button>
          </div>
          <div className="p-2">
            {pendingRequests.leave?.length > 0 ? (
              pendingRequests.leave.slice(0, 5).map((req) => (
                <ApprovalItem 
                  key={req.appId} 
                  requesterName={req.requesterName} // 실제 이름 매핑
                  rank={req.userRole}              // role 정보 전달
                  type={req.appType} 
                  date={req.startDate} 
                  reason={req.requestReason} 
                />
              ))
            ) : (
              <div className="py-24 text-center text-gray-400 text-xs font-bold">대기 중인 신청이 없습니다.</div>
            )}
          </div>
        </div>

        <div className="col-span-5 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-sm font-bold text-gray-700 mb-6 flex items-center gap-2">📊 프로젝트 현황</h3>
          <div className="space-y-6">
            <ProgressItem label="사내 그룹웨어 개발" percent={65} date="04.30" color="blue" status="진행중" />
            <ProgressItem label="ERP 시스템 고도화" percent={30} date="06.30" color="emerald" status="검토중" />
            <ProgressItem label="모바일 앱 리뉴얼" percent={15} date="09.30" color="purple" status="기획중" />
          </div>
        </div>
      </div>

      {/* 4. 하단 Task 통계 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-sm font-bold text-gray-700 flex items-center gap-2">
            <ListChecks size={16} className="text-blue-600" />
            📋 Task 상태별 통계
          </h3>
          <span className="text-[10px] text-gray-400 font-medium">실시간 데이터 기준</span>
        </div>
        <div className="grid grid-cols-12 gap-6 items-center">
          <div className="col-span-9 grid grid-cols-4 gap-4">
            <TaskStatusCard count={isChief ? taskStats.todo : 0} label="대기" color="blue" />
            <TaskStatusCard count={isChief ? taskStats.inProgress : 0} label="진행중" color="yellow" />
            <TaskStatusCard count={isChief ? taskStats.done : 0} label="완료" color="emerald" />
            <TaskStatusCard count={isChief ? taskStats.delayed : 0} label="지연" color="red" />
          </div>
          <div className="col-span-3 border-l border-gray-100 pl-6 text-center">
            <p className="text-[11px] text-gray-400 mb-1 font-bold">전체 완료율</p>
            <h4 className="text-3xl font-black text-blue-700 tracking-tight">{isChief ? taskStats.completionRate : 0}%</h4>
            <div className="w-full bg-gray-100 h-2 rounded-full mt-3 overflow-hidden">
              <div 
                className="bg-blue-600 h-full transition-all duration-1000" 
                style={{ width: `${isChief ? taskStats.completionRate : 0}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- 서브 컴포넌트 (데이터 바인딩 수정 완료) ---
const NotificationItem = ({ name, rank, type, date, onClick }) => (
  <div onClick={onClick} className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-xl cursor-pointer transition-colors group">
    <div className="w-8 h-8 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center text-[10px] font-black border border-indigo-100">
      {/* 프로필 아바타에도 실제 이름의 첫 글자가 나오도록 수정 */}
      {name?.charAt(0)}
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-xs font-bold text-gray-700 truncate">
        {/* [중요] "일반사용자" 대신 전달받은 name(requesterName)을 출력합니다 */}
        {name} <span className="text-[9px] font-medium text-gray-400">[{rank === 'TEAM_LEADER' ? '팀장' : '사원'}]</span>
      </p>
      <p className="text-[9px] text-gray-400">{date} · {type}</p>
    </div>
    <ChevronRight size={14} className="text-gray-300 group-hover:text-blue-500" />
  </div>
);

const AdminStatCard = ({ title, count, change, color }) => (
  <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300">
    <p className="text-[10px] text-gray-400 mb-2 font-black uppercase tracking-widest">{title}</p>
    <div className="flex items-end justify-between">
      <h4 className="text-2xl font-black text-gray-800 tracking-tighter">{count}</h4>
      <p className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${color === 'red' ? 'bg-red-50 text-red-500' : 'bg-emerald-50 text-emerald-500'}`}>{change}</p>
    </div>
  </div>
);

const ApprovalItem = ({ requesterName, rank, type, date, reason }) => {
  const typeLabels = { 'ANNUAL': '연차', 'HALF_MORNING': '오전 반차', 'HALF_AFTERNOON': '오후 반차' };
  // rank(userRole)에 따른 한글 직급 변환
  const displayRank = rank === 'TEAM_LEADER' ? '팀장' : '사원';

  return (
    <div className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-lg transition-colors border-b border-gray-50 last:border-0">
      <div className="w-9 h-9 bg-blue-600 text-white rounded-full flex items-center justify-center text-[11px] font-bold shadow-md">
        {requesterName?.charAt(0)}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          {/* 하드코딩된 "일반사용자"를 requesterName으로 수정 */}
          <span className="text-xs font-bold text-gray-700">
            {requesterName} <span className="text-[10px] font-medium text-gray-400">[{displayRank}]</span>
          </span>
          <span className="text-[9px] px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded font-black">{typeLabels[type] || type}</span>
        </div>
        <p className="text-[10px] text-gray-400 truncate">{date} · {reason || "개인 사유"}</p>
      </div>
      <div className="text-[9px] font-bold text-amber-500 bg-amber-50 px-2 py-1 rounded border border-amber-100">승인대기</div>
    </div>
  );
};

const ProgressItem = ({ label, percent, date, color, status }) => (
  <div>
    <div className="flex justify-between text-[11px] mb-2 font-bold text-gray-700">
      <span>{label}</span>
      <span className="text-[9px] bg-gray-100 px-2 py-0.5 rounded text-gray-500 font-bold uppercase">{status}</span>
    </div>
    <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden mb-1.5 shadow-inner">
      <div className={`h-full transition-all duration-1000 ease-out ${color === 'blue' ? 'bg-blue-500' : color === 'emerald' ? 'bg-emerald-500' : 'bg-purple-500'}`} style={{ width: `${percent}%` }}></div>
    </div>
    <div className="flex justify-between text-[9px] text-gray-400 font-bold">
      <span>{percent}% 완료 · {date}</span>
      <span className="cursor-pointer hover:text-blue-600 underline text-[9px]">상세</span>
    </div>
  </div>
);

const TaskStatusCard = ({ count, label, color }) => {
  const colorMap = { 
    blue: 'bg-blue-50 text-blue-600 border-blue-100', 
    yellow: 'bg-yellow-50 text-yellow-600 border-yellow-100', 
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100', 
    red: 'bg-red-50 text-red-600 border-red-100' 
  };
  return (
    <div className={`${colorMap[color]} p-4 rounded-xl text-center flex flex-col items-center justify-center border transition-all duration-200 shadow-sm hover:shadow-md`}>
      <h5 className="text-2xl font-black mb-1">{count}</h5>
      <p className="text-[10px] font-bold uppercase tracking-widest opacity-80">{label}</p>
    </div>
  );
};

export default AdminDashboard;