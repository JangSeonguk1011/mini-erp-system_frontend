import { LayoutDashboard, FolderRoot, Calendar, Plane, User, LogOut } from 'lucide-react';

/**
 * Sidebar 컴포넌트
 * @param {Object} user - App.jsx에서 넘겨받은 사용자 정보 (이름, 직급 등)
 */
export default function Sidebar({ user }) {
  // 메뉴 리스트 데이터: 나중에 메뉴가 추가되거나 이름이 바뀌면 이 배열만 수정하면 됨
  const menus = [
    { name: '대시보드', icon: <LayoutDashboard size={20}/>, active: true },
    { name: '내 프로젝트/업무', icon: <FolderRoot size={20}/> },
    { name: '캘린더', icon: <Calendar size={20}/> },
    { name: '연차 신청', icon: <Plane size={20}/> },
    { name: '신청 내역', icon: <Plane size={20}/>, badge: 2 }, // 알림 배지가 있는 경우
    { name: '내 프로필', icon: <User size={20}/> },
  ];

  return (
    // w-64: 너비 고정, h-screen: 화면 높이 꽉 채움, border-r: 오른쪽 구분선, sticky: 스크롤해도 고정
    <div className="w-64 h-screen bg-white border-r flex flex-col p-5 sticky top-0">
      
      {/* 로고 영역: 서비스의 브랜드 아이덴티티 */}
      <div className="flex items-center gap-2 mb-10 px-2">
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
          W
        </div>
        <span className="text-xl font-bold text-slate-800">WorkFlow</span>
      </div>
      
      {/*사용자 프로필 요약: 백엔드에서 받아온 user 데이터를 출력 */}
      <div className="flex items-center gap-3 px-2 mb-8">
        {/* 프로필 이미지 대신 이름의 첫 글자를 아바타로 사용 */}
        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-bold">
          {user ? user.name[0] : '무'} 
        </div>
        <div>
          {/* user 데이터가 있을 때만 출력하도록 방어 코드 적용 */}
          <p className="text-sm font-bold">{user?.name || '사용자'}</p>
          <p className="text-xs text-slate-400">{user?.position || '직급 정보 없음'}</p>
        </div>
      </div>

      {/*메뉴 리스트: 배열을 순회(map)하며 메뉴 항목들을 생성 */}
      <nav className="flex-1 space-y-1">
        {menus.map((menu) => (
          <div 
            key={menu.name} 
            className={`
              flex items-center justify-between p-3 rounded-xl cursor-pointer transition-colors
              ${menu.active 
                ? 'bg-blue-50 text-blue-600' // 활성화 된 메뉴 스타일
                : 'text-slate-500 hover:bg-gray-50' // 일반 메뉴 스타일
              }
            `}
          >
            <div className="flex items-center gap-3">
              {menu.icon}
              <span className="font-semibold text-sm">{menu.name}</span>
            </div>
            {/* 알림 배지가 있을 때만 빨간 원 표시 */}
            {menu.badge && (
              <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                {menu.badge}
              </span>
            )}
          </div>
        ))}
      </nav>

      {/* 하단 영역: 로그아웃 등 설정 메뉴 */}
      <div className="pt-5 border-t">
        <div className="flex items-center gap-3 p-3 text-slate-400 hover:text-red-500 cursor-pointer transition-colors">
          <LogOut size={20}/>
          <span className="font-semibold text-sm">로그아웃</span>
        </div>
      </div>

    </div>
  );
}