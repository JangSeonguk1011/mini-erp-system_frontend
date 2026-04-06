import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore'; // Zustand 스토어 연결
import { 
  LayoutDashboard, 
  ShieldCheck, 
  ClipboardList, 
  FileText,
  Send,
  Calendar, 
  FolderKanban, 
  LogOut
} from 'lucide-react';

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Zustand 스토어에서 유저 정보와 로그아웃 함수 가져옴
  const { user, logout } = useAuthStore(); 

  // [권한 체크 로직]
  const userRole = user?.role || '';
  const userPosition = user?.position || '';
  
  // 1. 관리소장 여부 (ADMIN 권한 혹은 직위가 관리소장인 경우)
  const isChief = userRole === 'ADMIN' || userPosition === '관리소장';
  
  // 2. 팀장 여부 (MANAGER/TEAM_LEADER 권한 혹은 직위가 팀장인 경우)
  const isTeamLeader = userRole === 'MANAGER' || userRole === 'TEAM_LEADER' || userPosition === '팀장';

  // 현재 활성화된 메뉴인지 확인하는 함수
  const isActive = (path) => location.pathname === path;

  /**
   * 로그아웃 핸들러
   */
  const handleLogout = () => {
    if (window.confirm("로그아웃 하시겠습니까?")) {
      logout(); 
      window.location.replace('/login');
    }
  };

  /**
   * [권한별 동적 경로 설정]
   * 관리소장은 /admin, 그 외(팀장 등)는 /manager 경로를 기본으로 사용합니다.
   */
  const basePath = isChief ? '/admin' : '/manager';

  const menuItems = [
    { 
      icon: <LayoutDashboard size={18} />, 
      label: isChief ? '관리자 대시보드' : '팀장 대시보드', 
      path: `${basePath}/dashboard` 
    },
    // ✅ [권한 제어] '권한 부여'는 관리소장(isChief)에게만 노출
    ...(isChief ? [{ 
      icon: <ShieldCheck size={18} />, 
      label: '권한 부여', 
      path: '/admin/project-auth' 
    }] : []),
    { 
      icon: <FileText size={18} />, 
      label: '업무 배정(수정)', 
      path: `${basePath}/task-edit` 
    }, 
    // ✅ [권한 제어] 팀장/사원만 본인의 연차 신청 메뉴 노출
    ...(!isChief ? [
    { 
      icon: <Send size={18} />, 
      label: '연차/특근 신청', 
      path: `/manager/leaves/new` 
    },
    { 
      icon: <ClipboardList size={18} />, 
      label: '신청 내역', 
      path: `/manager/leaves` 
    }
  ] : []),
    { 
      icon: <Calendar size={18} />, 
      label: '연차/특근 결재', 
      path: `${basePath}/approvals` 
    },
  ];

  return (
    <div className="flex flex-col h-full p-6 bg-white shadow-sm border-r border-gray-100 overflow-y-auto">
      
      {/* 1. 로고 영역 */}
      <div 
        className="flex items-center gap-2 mb-10 px-2 cursor-pointer"
        onClick={() => navigate(`${basePath}/dashboard`)} 
      >
        <div className="w-8 h-8 bg-blue-900 rounded flex items-center justify-center text-white text-xs font-serif shadow-sm">W</div>
        <div className="flex flex-col">
          <span className="text-lg font-black text-blue-900 leading-none tracking-tight">WorkFlow</span>
          <span className="text-[10px] text-gray-400 font-medium">
            ({isChief ? '관리자 시스템' : '팀장 관리 시스템'})
          </span>
        </div>
      </div>

      {/* 2. 프로필 섹션 */}
      <div className="flex items-center gap-3 mb-10 px-2">
        <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center text-white font-bold shadow-md border-2 border-white">
          {user?.userName?.charAt(0) || 'U'}
        </div>
        <div>
          <p className="text-sm font-bold text-gray-800">{user?.userName || '사용자'}</p>
          <div className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
            <p className="text-[11px] text-gray-400 font-medium">{userPosition || 'Online'}</p>
          </div>
        </div>
      </div>

      {/* 3. 메인 메뉴 리스트 */}
      <nav className="flex-1 space-y-8">
        <div>
          <p className="text-[10px] font-bold text-gray-400 ml-2 mb-4 uppercase tracking-[0.15em]">
            {isChief ? 'Admin Menus' : 'Manager Menus'}
          </p>
          <div className="space-y-1.5">
            {menuItems.map((item) => (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl font-bold transition-all duration-200 group ${
                  isActive(item.path) 
                    ? 'bg-blue-50 text-blue-700 shadow-sm' 
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  {item.icon}
                  <span className="text-sm">{item.label}</span>
                </div>
                {isActive(item.path) && (
                  <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* ✅ [수정] 프로젝트 그룹: 오직 관리소장(isChief)에게만 노출 */}
        {isChief && (
          <div>
            <p className="text-[10px] font-bold text-gray-400 ml-2 mb-4 uppercase tracking-[0.15em]">Projects</p>
            <button
              onClick={() => navigate(`${basePath}/projects`)} 
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl font-bold transition-all duration-200 ${
                isActive(`${basePath}/projects`) 
                  ? 'bg-blue-50 text-blue-700 shadow-sm' 
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center gap-3">
                <FolderKanban size={18} />
                <span className="text-sm">프로젝트 관리</span>
              </div>
              {isActive(`${basePath}/projects`) && (
                <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
              )}
            </button>
          </div>
        )}
      </nav>

      {/* 4. 하단 로그아웃 영역 */}
      <div className="pt-6 border-t border-gray-50">
        <button 
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 text-orange-500 font-bold hover:bg-orange-50 rounded-xl transition-all group"
        >
          <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm">로그아웃</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;