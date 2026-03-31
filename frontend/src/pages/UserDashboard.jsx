import React, { useState } from 'react'; // 1. useState 추가
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
  Bell 
} from 'lucide-react';

// 2. 캘린더 컴포넌트 임포트 (파일 경로를 확인해주세요!)
import CalendarPage from './CalendarPage'; 
import ProfilePage from './ProfilePage'; // ProfilePage 임포트

const UserDashboard = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  // 3. 현재 활성화된 메뉴 상태 관리 (기본값: 'dashboard')
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [isProfileOpen, setIsProfileOpen] = useState(false); // 프로필 모달 상태

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // 4. 메인 콘텐츠를 결정하는 헬퍼 함수
  const renderContent = () => {
    switch (activeMenu) {
      case 'dashboard':
        return <DashboardHome user={user} />;
      case 'calendar':
        return <CalendarPage />; // 캘린더 메뉴 클릭 시 표시
      default:
        return (
          <div className="flex items-center justify-center h-64 text-gray-400 italic">
            {activeMenu} 화면을 준비 중입니다...
          </div>
        );
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col fixed h-full">
        <div className="p-6 flex items-center gap-2 text-blue-600 font-bold text-xl cursor-pointer" onClick={() => setActiveMenu('dashboard')}>
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white text-sm">W</div>
          WorkFlow
        </div>
        
        {/* db.json에서 불러온 부서/직급 데이터 반영 */}
        <div className="px-6 py-4 mb-4 cursor-pointer" onClick={() => setIsProfileOpen(true)}>
          <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors">
            <div className="w-10 h-10 bg-blue-200 rounded-full flex items-center justify-center text-blue-700 font-bold shadow-sm">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div>
              <p className="text-sm font-bold text-gray-800">{user?.name || '사용자'}</p>
              <p className="text-xs text-gray-500">
                {user?.department || '부서'} · {user?.position || '직급'}
              </p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          {/* 5. onClick을 통해 setActiveMenu를 호출하도록 수정 */}
          <NavItem 
            icon={<LayoutDashboard size={18}/>} 
            label="대시보드" 
            active={activeMenu === 'dashboard'} 
            onClick={() => setActiveMenu('dashboard')} 
          />
          <NavItem 
            icon={<FileText size={18}/>} 
            label="내 프로젝트/업무" 
            active={activeMenu === 'projects'} 
            onClick={() => setActiveMenu('projects')} 
          />
          <NavItem 
            icon={<Calendar size={18}/>} 
            label="캘린더" 
            active={activeMenu === 'calendar'} 
            onClick={() => setActiveMenu('calendar')} 
          />
          <NavItem 
            icon={<Send size={18}/>} 
            label="연차 신청" 
            active={activeMenu === 'leave-apply'} 
            onClick={() => setActiveMenu('leave-apply')} 
          />
          <NavItem 
            icon={<ClipboardList size={18}/>} 
            label="신청 내역" 
            badge="2" 
            active={activeMenu === 'leave-history'} 
            onClick={() => setActiveMenu('leave-history')} 
          />
          <NavItem 
            icon={<User size={18}/>} 
            label="내 프로필" 
            active={isProfileOpen} 
            onClick={() => setIsProfileOpen(true)} 
          />
        </nav>

        <div className="p-4 border-t">
          <button onClick={handleLogout} className="flex items-center gap-2 text-gray-500 hover:text-red-600 hover:bg-red-50 transition-all w-full p-2 rounded-lg group">
            <LogOut size={18} className="group-hover:translate-x-1 transition-transform" /> 
            <span className="text-sm font-medium">로그아웃</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 ml-64 p-8">
        {/* 6. 상태에 따라 다른 콘텐츠 렌더링 */}
        {renderContent()}
      </main>

      {/* db.json 데이터를 포함한 user 객체 전달 */}
      <ProfilePage 
        isOpen={isProfileOpen} 
        onClose={() => setIsProfileOpen(false)} 
        user={user} 
      />
    </div>
  );
};

const DashboardHome = ({ user }) => (
  <>
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

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <StatCard icon="💼" title="3" sub="진행 중 프로젝트" color="orange" tag="참여 중" />
      <StatCard icon="✅" title="12" sub="완료한 Task" color="green" tag="누적 완료 건수" />
      <StatCard icon="🕒" title="5" sub="내 진행 업무" color="blue" tag="마감 임박 주의" />
      <StatCard icon="📅" title="9.5일" sub="잔여 연차" color="pink" tag="총 15일 중" />
    </div>

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
            <div className="bg-blue-500 h-full w-[65%]" style={{ width: '65%' }}></div>
          </div>
          <div className="text-center mt-4">
            <p className="text-4xl font-black text-gray-800">65%</p>
            <p className="text-gray-400 text-xs mt-1 font-medium tracking-tight">전체 프로젝트 목표 달성도</p>
          </div>
        </div>
      </div>
    </div>
  </>
);

const NavItem = ({ icon, label, active = false, badge, onClick }) => (
  <div 
    onClick={onClick}
    className={`
      flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all duration-200
      ${active ? 'bg-blue-50 text-blue-600 font-bold shadow-sm' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'}
    `}
  >
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