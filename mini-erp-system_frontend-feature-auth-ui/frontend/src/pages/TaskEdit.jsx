import React, { useState, useEffect } from 'react';
import { ClipboardList, Edit3, Send, UserCheck, Users, AlignLeft } from 'lucide-react';

const TaskEdit = () => {
  // 1. 가상 데이터 (이전과 동일)
  const users = [
    { id: 'u1', name: '김철수 팀장', role: 'LEADER', projects: [1, 2] },
    { id: 'u2', name: '이영희 팀장', role: 'LEADER', projects: [3] },
    { id: 'u3', name: '박민준 사원', role: 'USER', projects: [1, 2] },
    { id: 'u4', name: '정수진 대리', role: 'USER', projects: [1, 3] },
    { id: 'u5', name: '최동현 주임', role: 'USER', projects: [2, 3] },
  ];

  const projectData = [
    { id: 1, name: "사내 그룹웨어 개발", leaderId: 'u1' },
    { id: 2, name: "ERP 시스템 고도화", leaderId: 'u1' },
    { id: 3, name: "모바일 앱 리뉴얼", leaderId: 'u2' },
  ];

  // 상태 관리
  const [formData, setFormData] = useState({
    projectId: '',
    title: '',
    teamLeaderName: '',
    memberId: '',
    priority: '중간',
    dueDate: '',
    description: '' // 업무 상세 내역
  });

  const [availableMembers, setAvailableMembers] = useState([]);

  // 프로젝트 선택 시 로직 
  useEffect(() => {
    if (formData.projectId) {
    const pId = parseInt(formData.projectId);
    const selectedProject = projectData.find(p => p.id === pId);

    if (selectedProject) {
      // 1. 해당 프로젝트 팀장 찾기
      const leader = users.find(u => u.id === selectedProject.leaderId);
      
      // 2. 해당 프로젝트 참여 팀원 필터링
      const members = users.filter(u => u.projects.includes(pId) && u.role === 'USER');

      setAvailableMembers(members);

      // [핵심 수정] 프로젝트 선택 시 팀장 이름과 프로젝트 제목을 함께 세팅
      setFormData(prev => ({
        ...prev,
        teamLeaderName: leader ? leader.name : '지정된 팀장 없음',
        title: selectedProject.name, // 프로젝트 제목을 Task 제목 칸에 자동 주입
        memberId: '' // 팀원 선택은 초기화
      }));
    }
  } else {
    // 프로젝트 선택 해제 시 데이터 초기화
    setAvailableMembers([]);
    setFormData(prev => ({ ...prev, teamLeaderName: '', title: '', memberId: '' }));
  }
}, [formData.projectId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("최종 업무 배정 데이터:", formData);
    alert("팀원에게 업무 배정 및 상세 내역 전달이 완료되었습니다.");
  };

  return (
    <div className="animate-fadeIn p-2">
      <header className="mb-8">
        <h2 className="text-2xl font-black text-gray-800 flex items-center gap-2">📌 업무 배정 및 수정</h2>
        <p className="text-sm text-gray-400 mt-1">팀원에게 부여할 구체적인 업무 내용을 작성하세요.</p>
      </header>

      <div className="grid grid-cols-12 gap-8">
        {/* --- 왼쪽: 배정 폼 --- */}
        <section className="col-span-5 bg-white rounded-2xl shadow-sm border border-gray-100 p-8 h-fit">
          <div className="flex items-center gap-2 mb-8 border-b border-gray-50 pb-4">
            <Edit3 size={20} className="text-blue-600" />
            <h3 className="font-bold text-gray-700">Task 배정 상세 설정</h3>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* 프로젝트 선택 */}
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-2">프로젝트 선택 *</label>
              <select name="projectId" value={formData.projectId} onChange={handleChange} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:border-blue-500 outline-none" required>
                <option value="">-- 프로젝트 선택 --</option>
                {projectData.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>

            {/* 담당 팀장 (자동 조회) */}
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-2">담당 팀장</label>
              <div className="relative">
                <UserCheck className="absolute left-3 top-3 text-blue-400" size={18} />
                <input type="text" value={formData.teamLeaderName} className="w-full bg-blue-50/50 border border-blue-100 text-blue-700 font-bold rounded-lg pl-10 pr-4 py-2.5 text-sm cursor-not-allowed" readOnly />
              </div>
            </div>

            {/* 팀원 배정 */}
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-2">팀원 배정 *</label>
              <select name="memberId" value={formData.memberId} onChange={handleChange} disabled={!formData.projectId} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:border-blue-500 outline-none" required>
                <option value="">{formData.projectId ? "-- 팀원 선택 --" : "-- 프로젝트를 먼저 선택하세요 --"}</option>
                {availableMembers.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
            </div>

            {/* Task 제목 */}
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-2">Task 제목 *</label>
              <div className="relative">
                <ClipboardList className="absolute left-3 top-3 text-gray-300" size={18} />
                <input type="text" name="title" value={formData.title} onChange={handleChange} placeholder="업무의 핵심 제목을 입력하세요" className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-10 pr-4 py-2.5 text-sm focus:border-blue-500" required />
              </div>
            </div>

            {/* 업무 상세 내역 ★ */}
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-2">업무 상세 내역 (팀원 전달 사항)</label>
              <div className="relative">
                <AlignLeft className="absolute left-3 top-3 text-gray-300" size={18} />
                <textarea 
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="4"
                  placeholder="팀원에게 전달할 구체적인 업무 가이드나 요청 사항을 입력하세요."
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-10 pr-4 py-2.5 text-sm focus:border-blue-500 outline-none resize-none"
                ></textarea>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-2">우선순위</label>
                <select name="priority" value={formData.priority} onChange={handleChange} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:border-blue-500 outline-none">
                  <option value="낮음">낮음</option>
                  <option value="중간">중간</option>
                  <option value="높음">높음</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-2">마감일 *</label>
                <input type="date" name="dueDate" value={formData.dueDate} onChange={handleChange} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:border-blue-500 outline-none" required />
              </div>
            </div>

            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow-lg active:scale-[0.98] transition-all">
              <Send size={18} className="inline mr-2" />
              업무 배정 완료
            </button>
          </form>
        </section>

        {/* --- 오른쪽: 리스트 (생략 가능) --- */}
        <section className="col-span-7 bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <div className="flex items-center gap-2 mb-6">
                <Users size={20} className="text-orange-500" />
                <h3 className="font-bold text-gray-700">배정 이력 확인</h3>
            </div>
            <div className="h-64 border-2 border-dashed border-gray-100 rounded-xl flex items-center justify-center text-gray-300 text-sm">
                최근 배정 내역이 여기에 표시됩니다.
            </div>
        </section>
      </div>
    </div>
  );
};

export default TaskEdit;