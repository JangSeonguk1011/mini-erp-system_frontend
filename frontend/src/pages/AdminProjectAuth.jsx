import React, { useState, useEffect, useCallback } from 'react';
import { ShieldCheck, Search, FolderLock, UserCircle, CheckCircle2, Circle, Loader2 } from 'lucide-react';
import axios from '../api/axios';

const AdminProjectAuth = () => {
  // --- 1. 상태 관리 ---
  const [users, setUsers] = useState([]); 
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [projectList, setProjectList] = useState([]);
  const [loading, setLoading] = useState({ users: false, projects: false, saving: false });

  // --- 2. 데이터 페칭 로직 ---
  const fetchUsers = useCallback(async () => {
    setLoading(prev => ({ ...prev, users: true }));
    try {
      const response = await axios.get('/users?size=100'); 
      if (response.data.success) {
        setUsers(response.data.data.content);
      }
    } catch (error) {
      console.error("멤버 목록 로드 실패:", error);
    } finally {
      setLoading(prev => ({ ...prev, users: false }));
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const fetchUserPermissions = async (user) => {
    const targetId = user.id;
    setSelectedUser(user);
    setLoading(prev => ({ ...prev, projects: true }));
    
    try {
      const response = await axios.get(`/projects/permissions/${targetId}`);
      if (response.data.success) {
        setProjectList(response.data.data);
      }
    } catch (error) {
      console.error("권한 로드 실패:", error);
      alert("해당 사용자의 프로젝트 권한 정보를 가져오지 못했습니다.");
    } finally {
      setLoading(prev => ({ ...prev, projects: false }));
    }
  };

  // --- 3. 핸들러 ---
  const handleAuthToggle = (projectId) => {
    setProjectList(prev => prev.map(proj => 
      proj.projectId === projectId ? { ...proj, assigned: !proj.assigned } : proj
    ));
  };

  const handleSaveAuth = async () => {
    if (!selectedUser) return;
    setLoading(prev => ({ ...prev, saving: true }));
    
    const payload = {
      assignedProjectIds: projectList
        .filter(p => p.assigned)
        .map(p => p.projectId)
    };

    try {
      const response = await axios.put(`/projects/permissions/${selectedUser.id}`, payload);
      if (response.data.success) {
        alert(`${selectedUser.name}님의 권한 설정이 완료되었습니다.`);
        fetchUsers(); 
      }
    } catch (error) {
      console.error("저장 실패:", error);
      alert("저장 중 오류가 발생했습니다.");
    } finally {
      setLoading(prev => ({ ...prev, saving: false }));
    }
  };

  /**
   * [수정 핵심] 필터링 로직
   * 1. user.role이 'ADMIN'인 계정은 제외합니다.
   * 2. 검색어(searchTerm)가 이름에 포함된 경우만 남깁니다.
   */
  const filteredUsers = users.filter(user => 
    user.role !== 'ADMIN' && user.name.includes(searchTerm)
  );

  return (
    <div className="animate-fadeIn p-6 bg-gray-50/30 min-h-screen">
      <header className="mb-8">
        <h2 className="text-2xl font-black text-gray-800 flex items-center gap-2">
          🔐 프로젝트 권한 관리 (전체 멤버)
        </h2>
        <p className="text-sm text-gray-400 mt-1">관리자 제외, 일반 멤버 및 팀장의 프로젝트 접근 권한을 관리합니다.</p>
      </header>

      <div className="grid grid-cols-12 gap-8 max-w-7xl mx-auto">
        
        {/* 사용자 목록 */}
        <section className="col-span-5 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col overflow-hidden">
          <div className="p-6 border-b border-gray-50 flex items-center justify-between">
            <h3 className="font-bold text-gray-700 flex items-center gap-2">
              <UserCircle size={18} className="text-blue-500" /> 멤버 목록
            </h3>
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

          <div className="overflow-y-auto h-[500px] custom-scroll">
            {loading.users ? (
              <div className="flex justify-center p-10"><Loader2 className="animate-spin text-blue-500" /></div>
            ) : filteredUsers.length > 0 ? (
              filteredUsers.map(user => (
                <div 
                  key={user.id}
                  onClick={() => fetchUserPermissions(user)}
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
                      <p className="text-[11px] text-gray-400">
                        {user.departmentName} | {user.position}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-20 text-gray-400 text-sm">표시할 멤버가 없습니다.</div>
            )}
          </div>
        </section>

        {/* 권한 설정 섹션 */}
        <section className="col-span-7 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col overflow-hidden">
          <div className="p-6 border-b border-gray-50">
            <h3 className="font-bold text-gray-700 flex items-center gap-2 mb-1">
              <FolderLock size={18} className="text-orange-500" /> 프로젝트 권한 설정
            </h3>
            {selectedUser ? (
              <p className="text-xs text-blue-500 font-medium">
                {selectedUser.name} 멤버 권한 편집 중
              </p>
            ) : (
              <p className="text-xs text-gray-400">수정할 멤버를 목록에서 선택하세요.</p>
            )}
          </div>

          <div className={`flex-1 p-8 space-y-4 overflow-y-auto h-[450px] custom-scroll ${!selectedUser && 'opacity-40 pointer-events-none'}`}>
            {loading.projects ? (
              <div className="flex justify-center p-10"><Loader2 className="animate-spin text-orange-500" /></div>
            ) : projectList.length > 0 ? (
              projectList.map(project => (
                <div 
                  key={project.projectId}
                  onClick={() => handleAuthToggle(project.projectId)}
                  className="flex items-center justify-between p-4 rounded-xl border border-gray-50 hover:bg-gray-50/50 cursor-pointer transition-all"
                >
                  <div>
                    <p className="text-sm font-bold text-gray-700">{project.title}</p>
                    <p className={`text-[11px] mt-0.5 font-semibold ${project.assigned ? 'text-blue-500' : 'text-gray-300'}`}>
                      프로젝트 상태: {project.status}
                    </p>
                  </div>
                  <div className={`flex items-center gap-2 text-xs font-bold ${project.assigned ? 'text-blue-600' : 'text-gray-400'}`}>
                    {project.assigned ? <CheckCircle2 size={20} /> : <Circle size={20} />}
                    <span className="w-10">{project.assigned ? '허용' : '차단'}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-20 text-gray-400 text-sm">등록된 프로젝트가 없습니다.</div>
            )}
          </div>

          <div className="p-6 bg-gray-50/50 border-t border-gray-100">
            <button 
              onClick={handleSaveAuth}
              disabled={!selectedUser || loading.saving}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-bold py-3.5 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
            >
              {loading.saving ? <Loader2 className="animate-spin" size={18} /> : <ShieldCheck size={18} />}
              권한 변경 사항 저장
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default AdminProjectAuth;