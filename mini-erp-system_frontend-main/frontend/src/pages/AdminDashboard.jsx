import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Bell, Calendar, Clock, ChevronRight, ListChecks, LayoutDashboard, RefreshCw } from 'lucide-react';
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
  const [projects, setProjects] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  // --- 권한 체크 로직 ---
  const userRole = user?.role || '';
  const userPosition = user?.position || '';
  const userId = user?.id || user?.userId;
  
  const isChief = userRole === 'ADMIN' || userPosition === '관리소장';
  const isTeamLeader = userRole === 'MANAGER' || userRole === 'TEAM_LEADER' || userPosition === '팀장';
  const isUser = !isChief && !isTeamLeader;

  // --- 데이터 로드 함수 ---
  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);

      const apiCalls = [
        api.get('/leave/all'),
        api.get('/overtime/all'),
        api.get('/projects'),
        api.get('/tasks')
      ];

      const results = await Promise.allSettled(apiCalls);
      
      const leaveRes = results[0];
      const overtimeRes = results[1];
      const projectRes = results[2];
      const taskRes = results[3];

      // 1. 연차/특근 데이터 처리 (역할별 필터링)
      const filteredLeave = [];
      const filteredOvertime = [];

      if (leaveRes.status === 'fulfilled' && leaveRes.value?.data?.success) {
        const allLeave = leaveRes.value.data.data || [];
        filteredLeave.push(...allLeave.filter(req => {
          const isPending = req.appStatus === 'PENDING';
          if (isChief) return isPending && req.userRole === 'TEAM_LEADER'; // 소장은 팀장 것만
          if (isTeamLeader) return isPending && req.userRole === 'USER';  // 팀장은 사원 것만
          return false;
        }));
      }

      if (overtimeRes.status === 'fulfilled' && overtimeRes.value?.data?.success) {
        const allOvertime = overtimeRes.value.data.data || [];
        filteredOvertime.push(...allOvertime.filter(req => {
          const isPending = req.appStatus === 'PENDING';
          if (isChief) return isPending && req.userRole === 'TEAM_LEADER';
          if (isTeamLeader) return isPending && req.userRole === 'USER';
          return false;
        }));
      }
      setPendingRequests({ leave: filteredLeave, overtime: filteredOvertime });

      // 2. 프로젝트 데이터 처리 (역할별 필터링)
      if (projectRes.status === 'fulfilled') {
        const allProjects = projectRes.value.data?.data || [];
        let displayProjects = [];

        if (isChief) {
          displayProjects = allProjects; // 소장은 전체
        } else if (isTeamLeader) {
          // 팀장은 본인이 리더인 프로젝트만 (서버 필드명에 따라 leaderId 또는 leaderName 확인 필요)
          displayProjects = allProjects.filter(p => p.leaderId === userId || p.leaderName === user.name);
        } else {
          // 사원은 본인이 멤버로 포함된 프로젝트만
          displayProjects = allProjects.filter(p => p.members?.some(m => m.userId === userId));
        }
        setProjects(displayProjects);
      }

      // 3. Task 통계 데이터 처리
      if (taskRes.status === 'fulfilled') {
        const resData = taskRes.value.data;
        const allTasks = resData?.data || (Array.isArray(resData) ? resData : []);
        
        // 프로젝트 필터링과 연동된 태스크만 통계 계산
        const targetProjectIds = new Set(projects.map(p => p.projectId || p.id));
        const filteredTasks = isChief ? allTasks : allTasks.filter(t => targetProjectIds.has(t.projectId));

        const stats = {
          todo: filteredTasks.filter(t => ['TODO', 'READY', '대기'].includes(t.status)).length,
          inProgress: filteredTasks.filter(t => ['IN_PROGRESS', '진행중'].includes(t.status)).length,
          done: filteredTasks.filter(t => ['DONE', '완료'].includes(t.status)).length,
          delayed: filteredTasks.filter(t => ['DELAYED', '지연'].includes(t.status)).length,
          total: filteredTasks.length
        };
        const rate = stats.total > 0 ? Math.round((stats.done / stats.total) * 100) : 0;
        setTaskStats({ ...stats, completionRate: rate });
      }

    } catch (error) {
      console.error("데이터 로드 중 에러 발생:", error);
    } finally {
      setLoading(false);
    }
  }, [isChief, isTeamLeader, userId, user?.name, projects]);

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
      <div className="flex flex-col items-center justify-center h-screen gap-4">
        <RefreshCw className="animate-spin text-blue-500" size={32} />
        <div className="text-gray-400 font-bold items-center justify-center">데이터를 구성 중입니다...</div>
      </div>
    );
  }

  const totalPending = pendingRequests.leave.length + pendingRequests.overtime.length;

  return (
    <div className="animate-fadeIn p-2">
      {/* 1. 헤더 섹션 */}
      <header className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-xl font-extrabold text-gray-800 tracking-tight">
            {isChief ? "관리소장 대시보드" : isTeamLeader ? "팀장 대시보드" : "마이 대시보드"}
          </h2>
          <p className="text-xs text-gray-400 mt-1 font-medium">
            {isChief ? "전체 프로젝트 및 팀장급 결재를 관리합니다." : 
             isTeamLeader ? "담당 프로젝트와 팀원 결재를 관리합니다." : "나의 업무 및 프로젝트 현황입니다."}
          </p>
        </div>
        
        <div className="flex items-center gap-4 relative" ref={notificationRef}>
          <button 
            onClick={() => fetchDashboardData()}
            className="p-2 text-gray-400 hover:text-blue-500 transition-colors"
            title="새로고침"
          >
            <RefreshCw size={20} />
          </button>

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
                {[...pendingRequests.leave, ...pendingRequests.overtime].map((req, idx) => (
                  <NotificationItem 
                    key={`notif-${idx}`} 
                    name={req.requesterName} 
                    rank={req.userRole}
                    type={req.appType || (req.overtimeDate ? '특근' : '연차')} 
                    date={req.startDate || req.overtimeDate} 
                    onClick={() => navigate(isChief ? '/admin/leave-approval' : '/manager/leave-approval')} 
                  />
                ))}
                {totalPending === 0 && <div className="py-12 text-center text-gray-400 text-xs font-bold">대기 중인 결재 건이 없습니다.</div>}
              </div>
            </div>
          )}
          <div className="w-9 h-9 bg-emerald-600 text-white rounded-full flex items-center justify-center text-xs font-black border-2 border-emerald-100 shadow-sm">
            {isChief ? "소" : isTeamLeader ? "팀" : "사"}
          </div>
        </div>
      </header>

      {/* 2. 상단 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <AdminStatCard title="내 프로젝트" count={projects.length} change="실시간" />
        <AdminStatCard title="진행 업무" count={taskStats.inProgress} change="수행 중" color="blue" />
        <AdminStatCard 
          title="결재 대기" 
          count={totalPending} 
          change={totalPending > 0 ? "처리 필요" : "완료"} 
          color={totalPending > 0 ? "red" : "emerald"} 
        /> 
        <AdminStatCard title="업무 완료율" count={`${taskStats.completionRate}%`} change={`총 ${taskStats.total}건`} />
      </div>

      {/* 3. 중간 섹션 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">
        {/* 결재 내역 리스트 */}
        <div className="lg:col-span-7 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 border-b border-gray-50 flex justify-between items-center bg-gray-50/30">
            <h3 className="text-sm font-bold text-gray-700">
              🚩 {isChief ? "최근 팀장 결재 신청" : "최근 팀원 결재 신청"}
            </h3>
            <button 
              onClick={() => navigate(isChief ? '/admin/leave-approval' : '/manager/leave-approval')} 
              className="text-blue-600 text-[11px] font-bold hover:underline"
            >
              전체보기
            </button>
          </div>
          <div className="p-2">
            {totalPending > 0 ? (
              [...pendingRequests.leave, ...pendingRequests.overtime].slice(0, 5).map((req, idx) => (
                <ApprovalItem 
                  key={`approval-${idx}`} 
                  requesterName={req.requesterName}
                  rank={req.userRole}
                  type={req.appType} 
                  date={req.startDate || req.overtimeDate} 
                  reason={req.requestReason || req.overtimeReason} 
                />
              ))
            ) : (
              <div className="py-24 text-center text-gray-400 text-xs font-bold">대기 중인 신청이 없습니다.</div>
            )}
          </div>
        </div>

        {/* 프로젝트 현황 */}
        <div className="lg:col-span-5 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-sm font-bold text-gray-700 mb-6 flex items-center gap-2">📊 참여 프로젝트 현황</h3>
          <div className="space-y-6 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
            {projects.length > 0 ? (
              projects.map((project, idx) => (
                <ProgressItem 
                  key={`proj-${project.projectId || project.id || idx}`}
                  label={project.title} 
                  percent={project.status === 'DONE' ? 100 : project.status === 'READY' ? 0 : 50} 
                  date={project.endDate} 
                  color={idx % 3 === 0 ? "blue" : idx % 3 === 1 ? "emerald" : "purple"} 
                  status={project.status === 'READY' ? '대기' : project.status === 'DONE' ? '완료' : '진행중'} 
                />
              ))
            ) : (
              <div className="py-20 text-center text-gray-400 text-xs font-bold">참여 중인 프로젝트가 없습니다.</div>
            )}
          </div>
        </div>
      </div>

      {/* 4. 하단 Task 통계 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-sm font-bold text-gray-700 flex items-center gap-2">
            <ListChecks size={16} className="text-blue-600" />
            📋 업무 상태 통계 (관련 프로젝트 기준)
          </h3>
          <span className="text-[10px] text-gray-400 font-medium italic">권한에 따라 집계 범위가 다릅니다</span>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-9 grid grid-cols-2 md:grid-cols-4 gap-4">
            <TaskStatusCard count={taskStats.todo} label="대기" color="blue" />
            <TaskStatusCard count={taskStats.inProgress} label="진행중" color="yellow" />
            <TaskStatusCard count={taskStats.done} label="완료" color="emerald" />
            <TaskStatusCard count={taskStats.delayed} label="지연" color="red" />
          </div>
          <div className="lg:col-span-3 border-t lg:border-t-0 lg:border-l border-gray-100 pt-6 lg:pt-0 lg:pl-6 text-center">
            <p className="text-[11px] text-gray-400 mb-1 font-bold">업무 완료율</p>
            <h4 className="text-3xl font-black text-blue-700 tracking-tight">{taskStats.completionRate}%</h4>
            <div className="w-full bg-gray-100 h-2 rounded-full mt-3 overflow-hidden">
              <div 
                className="bg-blue-600 h-full transition-all duration-1000" 
                style={{ width: `${taskStats.completionRate}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- 서브 컴포넌트 ---
const NotificationItem = ({ name, rank, type, date, onClick }) => (
  <div onClick={onClick} className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-xl cursor-pointer transition-colors group">
    <div className="w-8 h-8 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center text-[10px] font-black border border-indigo-100">
      {name?.charAt(0) || '?'}
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-xs font-bold text-gray-700 truncate">
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
  const typeLabels = { 
    'ANNUAL': '연차', 
    'HALF_MORNING': '오전 반차', 
    'HALF_AFTERNOON': '오후 반차',
    'OVERTIME': '특근'
  };
  const displayRank = rank === 'TEAM_LEADER' ? '팀장' : '사원';

  return (
    <div className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-lg transition-colors border-b border-gray-50 last:border-0">
      <div className="w-9 h-9 bg-blue-600 text-white rounded-full flex items-center justify-center text-[11px] font-bold shadow-md">
        {requesterName?.charAt(0) || '?'}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-xs font-bold text-gray-700">
            {requesterName} <span className="text-[10px] font-medium text-gray-400">[{displayRank}]</span>
          </span>
          <span className="text-[9px] px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded font-black">
            {typeLabels[type] || type || '신청'}
          </span>
        </div>
        <p className="text-[10px] text-gray-400 truncate">{date} · {reason || "사유 미입력"}</p>
      </div>
      <div className="text-[9px] font-bold text-amber-500 bg-amber-50 px-2 py-1 rounded border border-amber-100">승인대기</div>
    </div>
  );
};

const ProgressItem = ({ label, percent, date, color, status }) => (
  <div>
    <div className="flex justify-between text-[11px] mb-2 font-bold text-gray-700">
      <span className="truncate pr-2">{label}</span>
      <span className="text-[9px] bg-gray-100 px-2 py-0.5 rounded text-gray-500 font-bold uppercase whitespace-nowrap">{status}</span>
    </div>
    <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden mb-1.5 shadow-inner">
      <div 
        className={`h-full transition-all duration-1000 ease-out ${color === 'blue' ? 'bg-blue-500' : color === 'emerald' ? 'bg-emerald-500' : 'bg-purple-500'}`} 
        style={{ width: `${percent}%` }}
      ></div>
    </div>
    <div className="flex justify-between text-[9px] text-gray-400 font-bold">
      <span>{percent}% 완료 · {date} 마감</span>
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