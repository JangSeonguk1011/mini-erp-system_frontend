import React, { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import api from '@/api/axios';
import { useNavigate } from 'react-router-dom'; //추가 

const AdminDashboard = () => {

  {/* ----------------------------------------수정(1)-------------------------------------------*/}
  const [pendingLeaves, setPendingLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchPendingLeaves = async () => {
    try {
      setLoading(true);
      const response = await api.get('/leave/all'); 
      if (response.data.success) {
        // PENDING 상태인 것만 필터링해서 상단 4~5개만 노출
        const onlyPending = response.data.data
          .filter(req => req.appStatus === 'PENDING')
          .slice(0, 5); 
        setPendingLeaves(onlyPending);
      }
    } catch (error) {
      console.error("데이터 로드 실패:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingLeaves();
  }, []);

  {/* ----------------------------------------수정(1)끝-------------------------------------------*/}

  return (
    <div className="animate-fadeIn">
      {/* 헤더 섹션 */}
      <header className="flex justify-between items-center mb-8">
        <h2 className="text-xl font-bold text-gray-800 tracking-tight">관리자 대시보드 요약</h2>
        <div className="flex items-center gap-4">
          <div className="relative p-2 text-gray-400 hover:bg-gray-100 rounded-full cursor-pointer transition-colors">
            <Bell size={20} />
            <span className="absolute top-2 right-2 w-2 h-2 bg-emerald-500 rounded-full border-2 border-white"></span>
          </div>
          <div className="w-8 h-8 bg-emerald-600 text-white rounded-full flex items-center justify-center text-xs font-bold border-2 border-emerald-100 shadow-sm">관</div>
        </div>
      </header>

      {/* 지표 카드 섹션 */}
      <div className="grid grid-cols-4 gap-6 mb-6">
        <AdminStatCard title="전체 사용자" count="24" change="+2 이번 달" />
        <AdminStatCard title="진행 중 프로젝트" count="8" change="총 12개 프로젝트" />
        <AdminStatCard title="연차 승인 대기" count={pendingLeaves.length} change="즉시 처리 필요" color="red" /> 
        {/* ----------연차 승인 대기에 count 수정 ----------*/}
        <AdminStatCard title="전체 Task" count="127" change="완료율 68%" />
      </div>

      {/* 중간 섹션 */}
      <div className="grid grid-cols-12 gap-6 mb-6">
        {/* ----------------------------------------수정(2)-------------------------------------------*/}
        <div className="col-span-7 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 border-b border-gray-50 flex justify-between items-center bg-gray-50/30">
            <h3 className="text-sm font-bold text-gray-700 flex items-center gap-2">🚩 연차 승인 대기</h3>
            <button onClick={() => navigate('/admin/approvals')}
            className="bg-blue-600 text-white text-[11px] px-6 py-1.5 rounded-lg font-bold hover:bg-blue-700 shadow-sm transition-colors">전체보기</button>
          </div>
          <div className="p-2 space-y-1">
            {pendingLeaves.map((req) => {

              const start = req.startDate?.substring(5) || "";
              const end = req.endDate?.substring(5) || "";
              const dateRange = start === end ? start : `${start} ~ ${end}`;

              return (
              <ApprovalItem 
                key={req.appId}
                requesterName={req.requesterName} 
                type={req.appType}
                date={dateRange}         
                reason={req.requestReason}
              />
              );
            })}
          </div>
        </div>
        {/* ----------------------------------------수정(2)끝-------------------------------------------*/}

        <div className="col-span-5 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-sm font-bold text-gray-700 mb-6 flex items-center gap-2">📊 프로젝트 현황</h3>
          <div className="space-y-6">
            <ProgressItem label="사내 그룹웨어 개발" percent={65} date="04.30" color="blue" status="진행중" />
            <ProgressItem label="ERP 시스템 고도화" percent={30} date="06.30" color="emerald" status="검토중" />
            <ProgressItem label="모바일 앱 리뉴얼" percent={15} date="09.30" color="purple" status="기획중" />
          </div>
        </div>
      </div>

      {/* 하단 섹션 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-sm font-bold text-gray-700 flex items-center gap-2">📋 Task 상태별 통계</h3>
          <span className="text-[10px] text-gray-400 font-medium">실시간 데이터: 전체 127개 Task 기준</span>
        </div>
        <div className="grid grid-cols-12 gap-6 items-center">
          <div className="col-span-9 grid grid-cols-4 gap-4">
            <TaskStatusCard count="38" label="대기" color="blue" />
            <TaskStatusCard count="30" label="진행중" color="yellow" />
            <TaskStatusCard count="86" label="완료" color="emerald" />
            <TaskStatusCard count="3" label="지연" color="red" />
          </div>
          <div className="col-span-3 border-l border-gray-100 pl-6 text-center">
            <p className="text-[11px] text-gray-400 mb-1 font-bold">전체 업무 완료율</p>
            <h4 className="text-3xl font-black text-blue-700 tracking-tight">67.7%</h4>
            <div className="w-full bg-gray-100 h-2 rounded-full mt-3 overflow-hidden shadow-inner">
              <div className="bg-blue-600 h-full w-[67.7%] shadow-sm"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- 하위 컴포넌트들 (기존과 동일하지만 Dashboard 내부에 위치) ---
const AdminStatCard = ({ title, count, change, color }) => (
  <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300">
    <p className="text-[11px] text-gray-400 mb-2 font-bold uppercase tracking-wider">{title}</p>
    <div className="flex items-end justify-between">
      <h4 className="text-2xl font-black text-gray-800 leading-none tracking-tight">{count}</h4>
      <p className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
        color === 'red' ? 'bg-red-50 text-red-500' : 'bg-emerald-50 text-emerald-500'
      }`}>{change}</p>
    </div>
  </div>
);

{/* ----------------------------------------수정(3)-------------------------------------------*/}
const ApprovalItem = ({ requesterName, type, date, reason }) => {
  const typeLabels = {
    'ANNUAL': '연차',
    'HALF_MORNING': '오전 반차',
    'HALF_AFTERNOON': '오후 반차'
  };

  const getFixedColor = (name) => {
    if (!name) return 'bg-emerald-500';
    const colors = ['bg-blue-500', 'bg-purple-500', 'bg-orange-500', 'bg-emerald-500'];

    const charSum = name.length + name.charCodeAt(0) + name.charCodeAt(name.length - 1);
    const index = charSum % colors.length;
    return colors[index];
  }

  const bgColor = getFixedColor(requesterName);

  return (
  <div className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-lg transition-colors group">
    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-[10px] font-bold shadow-sm 
    ${bgColor}`}>{requesterName.charAt(0)}</div>
    <div className="flex-1">
      <p className="text-xs font-bold text-gray-700">{requesterName} · <span className="font-normal text-gray-500">{typeLabels[type] || type}</span></p>
      <p className="text-[10px] text-gray-400">{date} · {reason}</p>
    </div>
  </div>
);
};
{/* ----------------------------------------수정(3)끝-------------------------------------------*/}

const ProgressItem = ({ label, percent, date, color, status }) => (
  <div>
    <div className="flex justify-between text-[11px] mb-2 font-bold text-gray-700">
      <span>{label}</span>
      <span className="text-[9px] bg-gray-100 px-2 py-0.5 rounded text-gray-500 font-bold uppercase">{status}</span>
    </div>
    <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden mb-1.5 shadow-inner">
      <div className={`h-full transition-all duration-1000 ease-out ${
        color === 'blue' ? 'bg-blue-500' : color === 'emerald' ? 'bg-emerald-500' : 'bg-purple-500'
      }`} style={{ width: `${percent}%` }}></div>
    </div>
    <div className="flex justify-between text-[9px] text-gray-400 font-medium">
      <span>진척률 {percent}% · 마감기한 {date}</span>
      <span className="cursor-pointer hover:text-blue-600 underline text-[9px]">상세보기</span>
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
    <div className={`${colorMap[color]} p-4 rounded-xl text-center flex flex-col items-center justify-center border hover:shadow-md transition-all duration-200 cursor-default`}>
      <h5 className="text-2xl font-black mb-1">{count}</h5>
      <p className="text-[10px] font-bold uppercase tracking-widest opacity-80">{label}</p>
    </div>
  );
};

export default AdminDashboard;