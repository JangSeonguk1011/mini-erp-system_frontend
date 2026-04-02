import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { 
  LayoutDashboard, 
  FileText, 
  Calendar, 
  Send, 
  ClipboardList, 
  User, 
  LogOut, 
  Bell,
  Clock,
  Umbrella,
  CalendarDays
} from 'lucide-react';

const UserDashboard = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  /**
   * [추가] 이번 주의 월요일 ~ 금요일 날짜 및 범위 계산
   * 현재 날짜(new Date())를 기준으로 이번 주 월요일과 금요일을 계산합니다.
   */
  const weekInfo = useMemo(() => {
    const now = new Date();
    const day = now.getDay(); // 0(일) ~ 6(토)
    
    // 이번 주 월요일 구하기
    const monday = new Date(now);
    monday.setDate(now.getDate() - (day === 0 ? 6 : day - 1));
    
    // 이번 주 금요일 구하기
    const friday = new Date(monday);
    friday.setDate(monday.getDate() + 4);

    const formatDate = (date) => `${date.getMonth() + 1}월 ${date.getDate()}일`;
    
    return {
      range: `${formatDate(monday)} ~ ${formatDate(friday)}`,
      mondayStr: formatDate(monday),
      // 실제 데이터 필터링 시에는 Date 객체 자체를 사용할 수 있습니다.
    };
  }, []);

  /**
   * [추가] 이번 주 일정 더미 데이터 (연차 및 프로젝트 마감 포함)
   */
  const weeklySchedules = [
    { id: 1, date: '03/24', day: '월', title: '대시보드 UI 개발', type: 'PROJECT', color: 'bg-blue-50 text-blue-600', icon: <Clock size={14}/> },
    { id: 2, date: '03/25', day: '화', title: '스프린트 회의', type: 'MEETING', color: 'bg-purple-50 text-purple-600', icon: <CalendarDays size={14}/> },
    { id: 3, date: '03/26', day: '수', title: '테스트 코드 작성', type: 'TASK', color: 'bg-emerald-50 text-emerald-600', icon: <Clock size={14}/> },
    { id: 4, date: '03/27', day: '목', title: '연차 (오후)', type: 'LEAVE', color: 'bg-orange-50 text-orange-600', icon: <Umbrella size={14}/> },
    { id: 5, date: '03/28', day: '금', title: '주간 리뷰', type: 'REVIEW', color: 'bg-gray-50 text-gray-600', icon: <CalendarDays size={14}/> },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* --- 사이드바 영역 --- */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col fixed h-full">
        <div className="p-6 flex items-center gap-2 text-blue-600 font-bold text-xl">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white text-sm">W</div>
          WorkFlow
        </div>
        
        <div className="px-6 py-4 mb-4">
          <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl">
            <div className="w-10 h-10 bg-blue-200 rounded-full flex items-center justify-center text-blue-700 font-bold shadow-sm">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div>
              <p className="text-sm font-bold text-gray-800">{user?.name || '사용자'}</p>
              <p className="text-xs text-gray-500">개발팀 · 대리</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          <NavItem icon={<LayoutDashboard size={18}/>} label="대시보드" active />
          <NavItem icon={<FileText size={18}/>} label="내 프로젝트/업무" />
          <NavItem icon={<Calendar size={18}/>} label="캘린더" />
          <NavItem icon={<Send size={18}/>} label="연차 신청" />
          <NavItem icon={<ClipboardList size={18}/>} label="신청 내역" badge="2" />
          <NavItem icon={<User size={18}/>} label="내 프로필" />
        </nav>

        <div className="p-4 border-t">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 text-gray-500 hover:text-red-600 hover:bg-red-50 transition-all w-full p-2 rounded-lg group"
          >
            <LogOut size={18} className="group-hover:translate-x-1 transition-transform" /> 
            <span className="text-sm font-medium">로그아웃</span>
          </button>
        </div>
      </aside>

      {/* --- 메인 콘텐츠 영역 --- */}
      <main className="flex-1 ml-64 p-8">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 font-sans">대시보드</h1>
            <p className="text-gray-500 text-sm mt-1">
              안녕하세요, <span className="font-semibold text-gray-700">{user?.name}님!</span> 👋 
              현재 <span className="text-blue-600 font-medium">5개</span>의 업무가 진행 대기 중입니다.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <button className="p-2 text-gray-400 hover:bg-gray-100 rounded-full transition-colors relative">
              <Bell size={20}/>
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            <div className="w-8 h-8 bg-blue-800 text-white rounded-lg shadow-inner flex items-center justify-center text-xs font-bold">
              {user?.name?.charAt(0) || '김'}
            </div>
          </div>
        </header>

        {/* 1. 상단 지표 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard icon="💼" title="3" sub="진행 중 프로젝트" color="orange" tag="참여 중" />
          <StatCard icon="✅" title="12" sub="완료한 Task" color="green" tag="누적 완료 건수" />
          <StatCard icon="🕒" title="5" sub="내 진행 업무" color="blue" tag="마감 임박 주의" />
          <StatCard icon="📅" title="9.5일" sub="잔여 연차" color="pink" tag="총 15일 중" />
        </div>
      
        {/*  이번 주 일정 섹션 */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm mb-8">
          <div className="flex justify-between items-end mb-6">
            <div>
              <h3 className="font-bold text-gray-800 flex items-center gap-2">🗓️ 이번 주 일정</h3>
              <p className="text-xs text-gray-400 mt-1 font-medium">{weekInfo.range}</p>
            </div>
            <button className="text-[11px] font-bold text-gray-400 hover:text-blue-600 px-3 py-1.5 bg-gray-50 rounded-lg transition-colors">
              캘린더 보기
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {weeklySchedules.map((schedule) => (
              <div 
                key={schedule.id}
                className={`p-4 rounded-xl border border-transparent hover:border-gray-100 hover:shadow-md transition-all duration-300 ${schedule.color}`}
              >
                <p className="text-[10px] font-black opacity-60 mb-1">{schedule.date} ({schedule.day})</p>
                <div className="flex items-center gap-2 mb-3">
                  {schedule.icon}
                  <span className="text-sm font-bold truncate">{schedule.title}</span>
                </div>
                <div className="w-full h-1 bg-white/50 rounded-full overflow-hidden">
                  <div className="w-1/3 h-full bg-current opacity-30"></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 3. 하단 섹션 (할 일 & 진척도) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-gray-800 flex items-center gap-2">📌 나의 할 일 (TODO)</h3>
              <button className="text-blue-600 text-xs font-semibold hover:underline">업무 관리 이동</button>
            </div>
            <div className="h-48 border-2 border-dashed border-gray-100 rounded-xl flex items-center justify-center text-gray-400 text-sm italic bg-gray-50/30">
              현재 진행 중인 Task 리스트를 불러오고 있습니다...
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <h3 className="font-bold text-gray-800 mb-6">📈 전사 프로젝트 평균 진척도</h3>
            <div className="mt-8">
              <div className="w-full bg-gray-100 h-4 rounded-full overflow-hidden shadow-inner">
                <div 
                  className="bg-blue-500 h-full w-[65%] transition-all duration-1000 ease-out shadow-sm"
                  style={{ width: '65%' }}
                ></div>
              </div>
              <div className="text-center mt-4">
                <p className="text-4xl font-black text-gray-800">65%</p>
                <p className="text-gray-400 text-xs mt-1 font-medium tracking-tight">전체 프로젝트 목표 달성도</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

// ... NavItem 및 StatCard 컴포넌트는 기존과 동일하므로 생략 (전체 소스코드에는 포함됨)

const NavItem = ({ icon, label, active = false, badge }) => (
  <div className={`
    flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all duration-200
    ${active ? 'bg-blue-50 text-blue-600 font-bold' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'}
  `}>
    <div className="flex items-center gap-3">
      {icon} 
      <span className="text-sm">{label}</span>
    </div>
    {badge && (
      <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold shadow-sm">
        {badge}
      </span>
    )}
  </div>
);

const StatCard = ({ icon, title, sub, color, tag }) => {
  const colors = {
    orange: 'bg-orange-50 text-orange-600',
    green: 'bg-emerald-50 text-emerald-600',
    blue: 'bg-blue-50 text-blue-600',
    pink: 'bg-pink-50 text-pink-600'
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
      <div className={`w-12 h-12 rounded-xl mb-4 flex items-center justify-center text-2xl ${colors[color] || 'bg-gray-50'}`}>
        {icon}
      </div>
      <div className="text-3xl font-black text-gray-800">{title}</div>
      <p className="text-gray-500 text-sm mt-1 font-medium">{sub}</p>
      <div className="mt-4 pt-4 border-t border-gray-50">
        <p className={`text-xs font-bold ${color === 'orange' ? 'text-orange-500' : color === 'green' ? 'text-emerald-500' : color === 'blue' ? 'text-blue-500' : 'text-pink-500'}`}>
          {tag}
        </p>
      </div>
    </div>
  );
};

export default UserDashboard;