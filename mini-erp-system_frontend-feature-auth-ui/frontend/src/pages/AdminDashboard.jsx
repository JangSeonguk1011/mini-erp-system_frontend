import React from 'react';
import { useNavigate } from 'react-router-dom'; // 페이지 이동을 위한 훅 추가
import { useAuthStore } from '../store/authStore';
import { 
  Settings, 
  Users, 
  Layout, 
  CheckCircle, 
  Clock, 
  LogOut, 
  Bell, 
  FolderKanban 
} from 'lucide-react';

const AdminDashboard = () => {
  // authStore에서 관리자 정보와 로그아웃 함수를 가져옴
  const { user, logout } = useAuthStore();
  const navigate = useNavigate(); // 페이지 이동 함수 초기화

  // 로그아웃 처리 함수
  const handleLogout = () => {
    // 1. 전역 상태 초기화 및 로컬스토리지 토큰 삭제
    logout();
    // 2. 로그인 페이지로 강제 리다이렉트
    navigate('/login');
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* --- 사이드바 영역 (고정형) --- */}
      <aside className="w-64 bg-white border-r border-gray-100 flex flex-col p-6 fixed h-full shadow-sm">
        {/* 서비스 로고 */}
        <div className="flex items-center gap-2 text-blue-900 font-bold text-lg mb-8">
          <div className="w-8 h-8 bg-blue-900 rounded flex items-center justify-center text-white text-xs font-serif">W</div>
          WorkFlow <span className="text-[10px] font-normal text-gray-400 ml-1">(관리자)</span>
        </div>
        
        {/* 관리자 프로필 섹션 */}
        <div className="flex items-center gap-3 mb-10 px-2">
          <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center text-white font-bold shadow-sm">
            {user?.name?.charAt(0) || '관'}
          </div>
          <div>
            <p className="text-sm font-bold text-gray-800">{user?.name || '관리자'}</p>
            <p className="text-[11px] text-gray-400 font-medium">시스템 관리자</p>
          </div>
        </div>

        {/* 메뉴 네비게이션 */}
        <nav className="flex-1 space-y-6">
          <div>
            <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-4 px-2 font-bold">관리 메뉴</p>
            <div className="space-y-1">
              <AdminNavItem icon={<Layout size={18}/>} label="관리자 대시보드" active={true} />
              <AdminNavItem icon={<Settings size={18}/>} label="권한 부여" />
              <AdminNavItem icon={<Users size={18}/>} label="업무 배정" badge="3" />
              <AdminNavItem icon={<CheckCircle size={18}/>} label="연차 승인" badge="4" active={false} onClick={() => navigate('/admin/approvals')}/>
            </div>
          </div>
          <div>
            <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-4 px-2 font-bold">프로젝트 정보</p>
            <AdminNavItem icon={<FolderKanban size={18}/>} label="프로젝트 관리" isFolder />
          </div>
        </nav>

        {/* 하단 로그아웃 버튼 */}
        <button 
          onClick={handleLogout} // 클릭 시 로그아웃 로직 실행
          className="flex items-center gap-2 text-orange-600 font-bold p-2.5 hover:bg-orange-50 rounded-lg transition-all mt-auto group"
        >
          <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" /> 
          <span className="text-sm">로그아웃</span>
        </button>
      </aside>

      {/* --- 메인 콘텐츠 영역 (사이드바 fixed이므로 ml-64 부여) --- */}
      <main className="flex-1 ml-64 p-8">
        <header className="flex justify-between items-center mb-8">
          <h2 className="text-xl font-bold text-gray-800 font-sans tracking-tight">관리자 대시보드 요약</h2>
          <div className="flex items-center gap-4">
            <div className="relative p-2 text-gray-400 hover:bg-gray-100 rounded-full cursor-pointer transition-colors">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-emerald-500 rounded-full border-2 border-white"></span>
            </div>
            <div className="w-8 h-8 bg-emerald-600 text-white rounded-full flex items-center justify-center text-xs font-bold border-2 border-emerald-100 shadow-sm">
              관
            </div>
          </div>
        </header>

        {/* 상단 통계 현황판 (4열 그리드) */}
        <div className="grid grid-cols-4 gap-6 mb-6">
          <AdminStatCard title="전체 사용자" count="24" change="+2 이번 달" />
          <AdminStatCard title="진행 중 프로젝트" count="8" change="총 12개 프로젝트" />
          <AdminStatCard title="연차 승인 대기" count="4" change="즉시 처리 필요" color="red" />
          <AdminStatCard title="전체 Task" count="127" change="완료율 68%" />
        </div>

        {/* 중간 섹션: 연차 승인 리스트 및 프로젝트 진척도 */}
        <div className="grid grid-cols-12 gap-6 mb-6">
          {/* 연차 승인 대기 목록 */}
          <div className="col-span-7 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 border-b border-gray-50 flex justify-between items-center bg-gray-50/30">
              <h3 className="text-sm font-bold text-gray-700 flex items-center gap-2">🚩 연차 승인 대기</h3>
              <button className="bg-blue-600 text-white text-[11px] px-6 py-1.5 rounded-lg font-bold hover:bg-blue-700 shadow-sm transition-colors">전체보기</button>
            </div>
            <div className="p-2 space-y-1">
              <ApprovalItem name="김철수" type="연차 1일" date="04.01" reason="개인 용무" color="blue" />
              <ApprovalItem name="이영희" type="연차 1일" date="04.13" reason="휴가" color="purple" />
              <ApprovalItem name="박민준" type="오전반차" date="04.05" reason="병원 방문" color="orange" />
              <ApprovalItem name="정수진" type="연속연차 2일" date="04.14-15" reason="가족 행사" color="emerald" />
            </div>
          </div>

          {/* 주요 프로젝트 진행 상태 */}
          <div className="col-span-5 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-sm font-bold text-gray-700 mb-6 flex items-center gap-2">📊 프로젝트 현황</h3>
            <div className="space-y-6">
              <ProgressItem label="사내 그룹웨어 개발" percent={65} date="04.30" color="blue" status="진행중" />
              <ProgressItem label="ERP 시스템 고도화" percent={30} date="06.30" color="emerald" status="검토중" />
              <ProgressItem label="모바일 앱 리뉴얼" percent={15} date="09.30" color="purple" status="기획중" />
            </div>
          </div>
        </div>

        {/* 하단 섹션: 전체 Task 상태별 통계 데이터 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-sm font-bold text-gray-700 flex items-center gap-2">📋 Task 상태별 통계</h3>
            <span className="text-[10px] text-gray-400 font-medium">실시간 데이터: 전체 127개 Task 기준</span>
          </div>
          
          <div className="grid grid-cols-12 gap-6 items-center">
            {/* 상태별 카드 (9/12 비율) */}
            <div className="col-span-9 grid grid-cols-4 gap-4">
              <TaskStatusCard count="38" label="대기" color="blue" />
              <TaskStatusCard count="30" label="진행중" color="yellow" />
              <TaskStatusCard count="86" label="완료" color="emerald" />
              <TaskStatusCard count="3" label="지연" color="red" />
            </div>
            
            {/* 전체 완료율 그래프 (3/12 비율) */}
            <div className="col-span-3 border-l border-gray-100 pl-6 text-center">
              <p className="text-[11px] text-gray-400 mb-1 font-bold">전체 업무 완료율</p>
              <h4 className="text-3xl font-black text-blue-700 tracking-tight">67.7%</h4>
              <div className="w-full bg-gray-100 h-2 rounded-full mt-3 overflow-hidden shadow-inner">
                <div className="bg-blue-600 h-full w-[67.7%] shadow-sm"></div>
              </div>
              <p className="text-[10px] text-gray-500 mt-2 font-medium">86 / 127 건 완료됨</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

// --- 내부 사용 컴포넌트 라이브러리 ---

/** 관리자 사이드바 메뉴 아이템 */
const AdminNavItem = ({ icon, label, active, badge, isFolder, onClick }) => (
  <div 
    onClick={onClick}
    className={`
    flex items-center justify-between p-2.5 rounded-lg cursor-pointer transition-all duration-200
    ${active ? 'bg-blue-50 text-blue-700 font-bold shadow-sm' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'}
  `}>
    <div className="flex items-center gap-3">{icon} <span className="text-sm">{label}</span></div>
    {badge && <span className="bg-red-500 text-white text-[9px] px-1.5 py-0.5 rounded-full font-black">{badge}</span>}
    {isFolder && <span className="text-gray-300 text-[10px]">▼</span>}
  </div>
);

/** 상단 핵심 지표 카드 */
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

/** 연차 승인 내역 리스트 아이템 */
const ApprovalItem = ({ name, type, date, reason, color }) => (
  <div className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-lg transition-colors group">
    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-[10px] font-bold shadow-sm ${
      color === 'blue' ? 'bg-blue-500' : color === 'purple' ? 'bg-purple-500' : color === 'orange' ? 'bg-orange-500' : 'bg-emerald-500'
    }`}>{name.charAt(0)}</div>
    <div className="flex-1">
      <p className="text-xs font-bold text-gray-700">{name} · <span className="font-normal text-gray-500">{type}</span></p>
      <p className="text-[10px] text-gray-400">{date} · {reason}</p>
    </div>
    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
      <button className="px-3 py-1 bg-emerald-500 text-white text-[10px] rounded font-bold hover:bg-emerald-600 shadow-sm">승인</button>
      <button className="px-3 py-1 bg-red-500 text-white text-[10px] rounded font-bold hover:bg-red-600 shadow-sm">반려</button>
    </div>
  </div>
);

/** 프로젝트 진행 표시 바 컴포넌트 */
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
      <span className="cursor-pointer hover:text-blue-600 underline">상세보기</span>
    </div>
  </div>
);

/** 하단 상태별 태스크 카드 */
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