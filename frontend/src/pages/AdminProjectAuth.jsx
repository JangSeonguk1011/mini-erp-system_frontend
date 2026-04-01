import React, { useState, useEffect } from 'react';
import { ShieldCheck, Search, FolderLock, UserCircle, CheckCircle2, Circle } from 'lucide-react';

const AdminProjectAuth = () => {
  // --- 1. 가상 데이터 (추후 API 연동 시 이 구조를 참고) ---
  const initialUsers = [
    { id: 'u1', name: '김철수', dept: '개발팀', position: '대리', role: 'USER' },
    { id: 'u2', name: '이영희', dept: '기획팀', position: '주임', role: 'USER' },
    { id: 'u3', name: '박민준', dept: '개발팀', position: '사원', role: 'USER' },
    { id: 'u4', name: '정수진', dept: '디자인팀', position: '대리', role: 'USER' },
    { id: 'u5', name: '최동현', dept: '개발팀', position: '과장', role: 'USER' },
  ];

  const initialProjects = [
    { id: 1, name: "사내 그룹웨어 개발", isAuth: true }, // 참여중
    { id: 2, name: "ERP 시스템 고도화", isAuth: false }, // 미참여
    { id: 3, name: "모바일 앱 리뉴얼", isAuth: true },
    { id: 4, name: "사내 인트라넷 개선", isAuth: false },
  ];

  // --- 2. 상태 관리 ---
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null); // 선택된 사용자 정보
  const [projectList, setProjectList] = useState(initialProjects);

  // --- 3. 로직 처리 ---
  
  // 사용자 검색 필터링
  const filteredUsers = initialUsers.filter(user => 
    user.name.includes(searchTerm)
  );

  // 사용자 선택 시 해당 유저의 프로젝트 권한 로드 (백엔드 GET 요청 지점)
  const handleUserSelect = (user) => {
    setSelectedUser(user);
    // 실제 구현 시: axios.get(`/api/auth/${user.id}`)를 통해 프로젝트 목록을 가져옴
    console.log(`${user.name}의 권한 정보를 불러옵니다.`);
  };

  // 권한 체크박스 토글 (백엔드 POST/PUT 요청 전 단계)
  const handleAuthToggle = (projectId) => {
    setProjectList(prev => prev.map(proj => 
      proj.id === projectId ? { ...proj, isAuth: !proj.isAuth } : proj
    ));
  };

  // 최종 저장 (백엔드 연동 지점)
  const handleSaveAuth = () => {
    if(!selectedUser) return alert("사용자를 먼저 선택해주세요.");
    
    const payload = {
      userId: selectedUser.id,
      authProjects: projectList.filter(p => p.isAuth).map(p => p.id)
    };
    
    console.log("서버로 전송할 데이터:", payload);
    alert(`${selectedUser.name}님의 프로젝트 접근 권한이 업데이트되었습니다.`);
  };

  return (
    <div className="animate-fadeIn p-6 bg-gray-50/30 min-h-screen">
      {/* 헤더 섹션 */}
      <header className="mb-8">
        <h2 className="text-2xl font-black text-gray-800 flex items-center gap-2">
          🔐 권한 부여
        </h2>
        <p className="text-sm text-gray-400 mt-1">사용자에게 프로젝트 접근 권한을 부여하세요.</p>
      </header>

      <div className="grid grid-cols-12 gap-8 max-w-7xl mx-auto">
        
        {/* --- 왼쪽: 사용자 목록 섹션 --- */}
        <section className="col-span-5 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col overflow-hidden">
          <div className="p-6 border-b border-gray-50 flex items-center justify-between">
            <h3 className="font-bold text-gray-700 flex items-center gap-2">
              <UserCircle size={18} className="text-blue-500" /> 사용자 목록
            </h3>
            {/* 검색창 */}
            <div className="relative">
              <Search className="absolute left-3 top-2.5 text-gray-300" size={16} />
              <input 
                type="text" 
                placeholder="이름 검색"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-4 py-2 bg-gray-50 border border-gray-100 rounded-lg text-xs focus:ring-2 focus:ring-blue-100 outline-none w-48"
              />
            </div>
          </div>

          <div className="overflow-y-auto h-[500px]">
            {filteredUsers.map(user => (
              <div 
                key={user.id}
                onClick={() => handleUserSelect(user)}
                className={`p-4 mx-4 my-2 rounded-xl cursor-pointer transition-all flex items-center justify-between border
                  ${selectedUser?.id === user.id 
                    ? 'bg-blue-50 border-blue-200 shadow-sm' 
                    : 'bg-white border-transparent hover:bg-gray-50'}`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm
                    ${selectedUser?.id === user.id ? 'bg-blue-500' : 'bg-gray-300'}`}>
                    {user.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-700">{user.name}</p>
                    <p className="text-[11px] text-gray-400">{user.dept} · {user.position}</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2 py-1 bg-gray-100 text-gray-400 rounded-md uppercase">
                  {user.role}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* --- 오른쪽: 권한 설정 섹션 --- */}
        <section className="col-span-7 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col overflow-hidden">
          <div className="p-6 border-b border-gray-50">
            <h3 className="font-bold text-gray-700 flex items-center gap-2 mb-1">
              <FolderLock size={18} className="text-orange-500" /> 프로젝트 권한 설정
            </h3>
            {selectedUser ? (
              <p className="text-xs text-blue-500 font-medium">
                {selectedUser.name} ({selectedUser.dept} · {selectedUser.position}) - 프로젝트 권한 설정중
              </p>
            ) : (
              <p className="text-xs text-gray-400">사용자를 선택하면 권한 설정이 활성화됩니다.</p>
            )}
          </div>

          <div className={`flex-1 p-8 space-y-4 ${!selectedUser && 'opacity-40 pointer-events-none'}`}>
            {projectList.map(project => (
              <div 
                key={project.id}
                onClick={() => handleAuthToggle(project.id)}
                className="flex items-center justify-between p-4 rounded-xl border border-gray-50 hover:bg-gray-50/50 cursor-pointer transition-all"
              >
                <div>
                  <p className="text-sm font-bold text-gray-700">{project.name}</p>
                  <p className={`text-[11px] mt-0.5 font-semibold ${project.isAuth ? 'text-blue-500' : 'text-gray-300'}`}>
                    {project.isAuth ? '현재 참여중' : '현재 미참여'}
                  </p>
                </div>
                
                {/* 커스텀 체크박스 UI */}
                <div className={`flex items-center gap-2 text-xs font-bold ${project.isAuth ? 'text-blue-600' : 'text-gray-400'}`}>
                  {project.isAuth ? <CheckCircle2 size={20} /> : <Circle size={20} />}
                  <span className="w-8">{project.isAuth ? '참여' : '미참여'}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="p-6 bg-gray-50/50 border-t border-gray-100">
            <button 
              onClick={handleSaveAuth}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-blue-100 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
            >
              <ShieldCheck size={18} />
              권한 저장
            </button>
          </div>
        </section>

      </div>
    </div>
  );
};

export default AdminProjectAuth;