import React, { useState, useEffect, useCallback } from 'react';
import { Pin, User, Loader2, Send, CheckCircle2, Check, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '@/api/axios';

const TaskEdit = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [recentTasks, setRecentTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUsersLoading, setIsUsersLoading] = useState(false);
  const [projectEndDate, setProjectEndDate] = useState('');

  const [formData, setFormData] = useState({
    projectId: '',
    leaderName: '',
    selectedMemberIds: [],
    taskTitle: '',
    taskContent: '',
    priority: '중간',
    endDate: ''
  });

  // 최근 배정 내역 조회
  const fetchTasksByProject = useCallback(async (pId) => {
    try {
      const url = pId ? `/tasks/recent-assignments?projectId=${pId}` : '/tasks/recent-assignments';
      const response = await api.get(url);
      // 콘솔 확인: { taskId, taskTitle, projectTitle, assigneeName, endDate, priority }
      console.log("Fetched Tasks Data:", response.data.data);
      setRecentTasks(Array.isArray(response.data.data) ? response.data.data : []);
    } catch (error) {
      console.error("내역 로드 실패:", error);
      setRecentTasks([]);
    }
  }, []);

  // 초기 프로젝트 목록 로드
  const fetchInitialData = useCallback(async () => {
    try {
      const projRes = await api.get('/projects');
      setProjects(projRes.data.data || []);
      fetchTasksByProject(null);
    } catch (error) {
      if (error.response?.status === 401) navigate('/login');
    }
  }, [navigate, fetchTasksByProject]);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  const handleProjectChange = async (e) => {
    const pId = e.target.value;
    const selectedProject = projects.find(p => String(p.projectId || p.id) === pId);
    
    setProjectEndDate(selectedProject?.endDate || '');
    setFormData(prev => ({ 
      ...prev, 
      projectId: pId, 
      leaderName: selectedProject?.leaderName || '정보 없음',
      selectedMemberIds: [],
      endDate: ''
    }));
    
    fetchTasksByProject(pId);

    if (!pId) {
      setAvailableUsers([]);
      return;
    }

    setIsUsersLoading(true);
    try {
      const response = await api.get(`/projects/${pId}/members/available`);
      setAvailableUsers(response.data.data || []);
    } catch (error) {
      setAvailableUsers([]);
    } finally {
      setIsUsersLoading(false);
    }
  };

  const toggleMember = (userId) => {
    setFormData(prev => ({
      ...prev,
      selectedMemberIds: prev.selectedMemberIds.includes(userId)
        ? prev.selectedMemberIds.filter(id => id !== userId)
        : [...prev.selectedMemberIds, userId]
    }));
  };

  const handleSubmit = async () => {
    if (!formData.projectId || formData.selectedMemberIds.length === 0 || !formData.taskTitle || !formData.endDate) {
      alert("필수 항목을 모두 입력해주세요.");
      return;
    }

    setIsLoading(true);
    try {
      // 1. 멤버 프로젝트 배정
      await Promise.allSettled(
        formData.selectedMemberIds.map(id => 
          api.post(`/projects/${formData.projectId}/members`, { userId: Number(id) })
        )
      );

      // 2. 업무 생성
      const requestData = {
        projectId: Number(formData.projectId),
        assigneeIds: formData.selectedMemberIds.map(id => Number(id)), 
        taskTitle: formData.taskTitle.trim(),
        taskContent: formData.taskContent.trim(),
        priority: formData.priority === '높음' ? 'HIGH' : formData.priority === '낮음' ? 'LOW' : 'MEDIUM',
        endDate: formData.endDate
      };

      await api.post('/tasks', requestData);
      alert("배정이 완료되었습니다.");
      
      // 폼 초기화 및 리스트 갱신
      setFormData(prev => ({ ...prev, selectedMemberIds: [], taskTitle: '', taskContent: '', endDate: '' }));
      fetchTasksByProject(formData.projectId);
    } catch (error) {
      alert("배정 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-[1400px] mx-auto bg-gray-50 min-h-screen font-sans">
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
      `}</style>

      <div className="flex items-center gap-2 mb-8">
        <div className="p-2 bg-pink-100 rounded-lg">
          <Pin className="text-pink-500 fill-pink-500" size={24} />
        </div>
        <h1 className="text-2xl font-bold text-gray-800">업무 배정 및 수정</h1>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        
        {/* 왼쪽: 업무 배정 폼 */}
        <div className="w-full lg:w-1/2 bg-white rounded-3xl shadow-sm border border-gray-100 p-8 h-fit">
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-bold text-gray-600 mb-2 block">프로젝트 선택 *</label>
                <select value={formData.projectId} onChange={handleProjectChange} className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="">-- 선택하세요 --</option>
                  {projects.map((p) => (
                    <option key={`proj-${p.projectId || p.id}`} value={p.projectId || p.id}>{p.title}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-bold text-gray-600 mb-2 block">담당 팀장</label>
                <div className="p-4 bg-blue-50 border border-blue-100 rounded-2xl text-blue-600 font-bold flex items-center gap-2">
                  <User size={18} /> {formData.leaderName || '선택 전'}
                </div>
              </div>
            </div>

            <div>
              <label className="text-sm font-bold text-gray-600 mb-2 block">팀원 선택 (중복 가능) *</label>
              <div className="border border-gray-200 rounded-2xl p-2 h-[150px] overflow-y-auto bg-white custom-scrollbar">
                {isUsersLoading ? (
                  <div className="flex justify-center p-10"><Loader2 className="animate-spin text-blue-500" /></div>
                ) : availableUsers.length > 0 ? (
                  availableUsers.map((u) => (
                    <button 
                      key={`user-select-${u.userId || u.id}`} 
                      onClick={() => toggleMember(u.userId || u.id)} 
                      className={`flex items-center justify-between w-full p-3 mb-1 rounded-xl text-sm transition-all ${
                        formData.selectedMemberIds.includes(u.userId || u.id) 
                        ? 'bg-blue-600 text-white font-bold shadow-md' 
                        : 'hover:bg-gray-100 text-gray-600'
                      }`}
                    >
                      {u.userName || u.name} {formData.selectedMemberIds.includes(u.userId || u.id) && <Check size={16} />}
                    </button>
                  ))
                ) : (
                  <div className="text-center text-gray-400 mt-10 text-[11px]">선택 가능한 팀원이 없습니다.</div>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-bold text-gray-600 mb-2 block">업무 제목 *</label>
                <input type="text" value={formData.taskTitle} onChange={e => setFormData({...formData, taskTitle: e.target.value})} className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500" placeholder="업무 제목을 입력하세요" />
              </div>
              <div>
                <label className="text-sm font-bold text-gray-600 mb-2 block">업무 상세 가이드</label>
                <textarea value={formData.taskContent} onChange={e => setFormData({...formData, taskContent: e.target.value})} className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 h-24 resize-none" placeholder="수행할 업무에 대해 설명해주세요." />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-bold text-gray-600 mb-2 block">우선순위</label>
                <select value={formData.priority} onChange={e => setFormData({...formData, priority: e.target.value})} className="w-full p-4 border border-gray-200 rounded-2xl outline-none font-medium bg-gray-50">
                  <option>낮음</option><option>중간</option><option>높음</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-bold text-gray-600 mb-2 block">마감일 (endDate) *</label>
                <input type="date" value={formData.endDate} max={projectEndDate} onChange={e => setFormData({...formData, endDate: e.target.value})} className="w-full p-4 border border-gray-200 rounded-2xl outline-none bg-gray-50" />
              </div>
            </div>

            <button onClick={handleSubmit} disabled={isLoading || formData.selectedMemberIds.length === 0} className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold hover:bg-blue-700 transition-all flex justify-center items-center gap-2 shadow-lg disabled:bg-gray-300">
              {isLoading ? <Loader2 className="animate-spin" /> : <><Send size={18} /> 배정 완료</>}
            </button>
          </div>
        </div>

        {/* 오른쪽: 배정 완료 내역 리스트 */}
        <div className="w-full lg:w-1/2 bg-white rounded-3xl shadow-sm border border-gray-100 p-8 h-fit">
          <div className="flex items-center gap-2 mb-6">
            <CheckCircle2 className="text-green-500" size={20} />
            <h2 className="text-lg font-bold text-gray-700">최근 배정 완료 내역</h2>
          </div>
          
          <div className="space-y-4 max-h-[700px] overflow-y-auto pr-2 custom-scrollbar">
            {recentTasks.length === 0 ? (
              <div className="text-center py-24 text-gray-300 flex flex-col items-center gap-3">
                <Clock size={48} className="opacity-20" /> 
                <p className="text-sm font-medium">최근 배정 내역이 없습니다.</p>
              </div>
            ) : (
              recentTasks.map((task, idx) => (
                <div 
                  // 해결 1: 중복 Key 에러 방지를 위해 index와 taskId 조합
                  key={`task-card-${task.taskId}-${idx}`} 
                  className="p-5 border border-gray-100 bg-gray-50 rounded-2xl hover:border-blue-200 transition-all shadow-sm"
                >
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-[10px] font-bold text-blue-600 bg-blue-100 px-2 py-1 rounded-md">
                      {task.projectTitle || "프로젝트 미지정"}
                    </span>
                    <span className="text-[10px] font-medium text-gray-400">
                      {task.endDate || "기한 없음"} 마감
                    </span>
                  </div>
                  
                  {/* 해결 2: 콘솔 로그에 확인된 'taskTitle' 필드를 정확히 매핑 */}
                  <h3 className="font-bold text-gray-800 text-[15px] mb-3">
                    {task.taskTitle || "제목 없음"}
                  </h3>

                  <div className="flex items-center justify-between border-t border-gray-100 pt-3">
                    <p className="text-xs text-gray-600 flex items-center gap-1.5 font-medium">
                      <User size={14} className="text-gray-400" /> 
                      {task.assigneeName || "담당자 없음"}
                    </p>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                      task.priority === 'HIGH' ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-600'
                    }`}>
                      {task.priority === 'HIGH' ? '긴급' : '보통'}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default TaskEdit;