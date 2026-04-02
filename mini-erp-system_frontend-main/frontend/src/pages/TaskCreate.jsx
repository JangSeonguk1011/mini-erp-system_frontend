import React, { useState } from 'react';
import { Rocket, Send, UserCheck, ClipboardList, Calendar, AlignLeft } from 'lucide-react';

const TaskCreate = () => {
  // 1. 사용자 데이터 (실제로는 API에서 가져오게 됩니다)
  const users = [
    { id: 'u1', name: '김철수 팀장', role: 'LEADER' },
    { id: 'u2', name: '이영희 팀장', role: 'LEADER' },
    { id: 'u3', name: '박민준 사원', role: 'USER' },
    { id: 'u4', name: '정수진 대리', role: 'USER' },
  ];

  // 2. 팀장급(LEADER)만 필터링
  const leaders = users.filter(user => user.role === 'LEADER');

  const [formData, setFormData] = useState({
    leaderId: '',     // 담당 팀장 ID
    title: '',        // Task 제목
    startDate: '',    // 시작일
    endDate: '',      // 종료일(마감)
    priority: '중간', // 우선순위
    description: ''   // Task 설명
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("새 Project 생성 데이터:", formData);
    alert(`[${formData.title}] 업무가 성공적으로 생성되어 팀장에게 배정되었습니다.`);
  };

  return (
    <div className="animate-fadeIn p-6">
      <header className="mb-8">
        <h2 className="text-2xl font-black text-gray-800 flex items-center gap-2">
          🚀 프로젝트 생성 (새 Project 생성)
        </h2>
        <p className="text-sm text-gray-400 mt-1">프로젝트 참여자(팀장)에게 새로운 Project를 할당합니다.</p>
      </header>

      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 p-10">
        <div className="flex items-center gap-2 mb-8 border-b border-gray-50 pb-4 text-purple-600">
          <Rocket size={20} />
          <h3 className="font-bold text-gray-700">새 Project 생성</h3>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 1. 담당 팀장 선택 (추가된 부분) */}
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-2">담당 팀장 선택 *</label>
            <div className="relative">
              <UserCheck className="absolute left-3 top-3 text-purple-400" size={18} />
              <select
                name="leaderId"
                value={formData.leaderId}
                onChange={handleChange}
                className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-10 pr-4 py-3 text-sm focus:border-purple-500 outline-none transition-all"
                required
              >
                <option value="">-- 업무를 담당할 팀장을 선택하세요 --</option>
                {leaders.map(leader => (
                  <option key={leader.id} value={leader.id}>
                    {leader.name} ({leader.dept})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 2. Task 제목 */}
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-2">Project 제목 *</label>
            <div className="relative">
              <ClipboardList className="absolute left-3 top-3 text-gray-300" size={18} />
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="새로운 업무 명칭을 입력하세요"
                className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-10 pr-4 py-3 text-sm focus:border-purple-500 outline-none"
                required
              />
            </div>
          </div>

          {/* 3. 시작일 및 종료일 */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-2">시작일 *</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 text-gray-300" size={18} />
                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-10 pr-4 py-3 text-sm focus:border-purple-500 outline-none"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-2">종료일(마감) *</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 text-gray-300" size={18} />
                <input
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleChange}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-10 pr-4 py-3 text-sm focus:border-purple-500 outline-none"
                  required
                />
              </div>
            </div>
          </div>

          {/* 4. 우선순위 설정 */}
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-2">우선순위 설정</label>
            <div className="flex gap-4">
              {['낮음', '중간', '높음'].map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, priority: p }))}
                  className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${
                    formData.priority === p
                      ? 'bg-emerald-50 border-2 border-emerald-500 text-emerald-600'
                      : 'bg-gray-50 border border-gray-200 text-gray-400'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* 5. Task 설명 */}
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-2">Task 설명</label>
            <div className="relative">
              <AlignLeft className="absolute left-3 top-3 text-gray-300" size={18} />
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="5"
                placeholder="업무의 상세 목표와 가이드라인을 입력하세요"
                className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-10 pr-4 py-3 text-sm focus:border-purple-500 outline-none resize-none"
              ></textarea>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-xl shadow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-2"
          >
            <div className="bg-white/20 p-1 rounded-full"><Send size={16} /></div>
            Project 생성 및 배정
          </button>
        </form>
      </div>
    </div>
  );
};

export default TaskCreate;