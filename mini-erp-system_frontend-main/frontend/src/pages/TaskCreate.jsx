import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '@/api/axios'; 

const TaskCreate = () => {
  const navigate = useNavigate();
  const [teamLeaders, setTeamLeaders] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    leaderId: '', 
    title: '',
    startDate: '',
    endDate: '',
    priority: '중간',
    description: ''
  });

  // 1. 팀장 목록 로드 (확인된 응답 규격 반영)
  useEffect(() => {
    const fetchTeamLeaders = async () => {
      try {
        const response = await api.get('/users/team-leaders');
        console.log("확인된 응답 데이터:", response.data);
        
        // ✅ 콘솔 로그에서 확인된 response.data.data 배열을 상태에 저장
        if (response.data && response.data.data) {
          setTeamLeaders(response.data.data);
        }
      } catch (error) {
        console.error("팀장 목록 로드 실패:", error);
      }
    };
    fetchTeamLeaders();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.leaderId) {
      alert("담당 팀장을 선택해주세요.");
      return;
    }

    setIsLoading(true);

    const priorityMap = { '높음': 'HIGH', '중간': 'MEDIUM', '낮음': 'LOW' };

    const submitData = {
      leaderId: Number(formData.leaderId), // ✅ 숫자(Long)로 변환
      title: formData.title,
      startDate: formData.startDate,
      endDate: formData.endDate,
      priority: priorityMap[formData.priority] || 'MEDIUM',
      description: formData.description
    };

    try {
      await api.post('/projects', submitData);
      alert(`🎉 [${formData.title}] 프로젝트 배정이 완료되었습니다.`);
      navigate('/admin/projects');
    } catch (error) {
      console.error("생성 실패:", error.response?.data);
      alert(error.response?.data?.message || "프로젝트 생성에 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 담당 팀장 선택 */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">담당 팀장 선택 *</label>
          <div className="relative">
            <select
              required
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none appearance-none"
              value={formData.leaderId}
              onChange={(e) => setFormData({...formData, leaderId: e.target.value})}
            >
              <option value="">-- 팀장을 선택하세요 --</option>
              {teamLeaders.map((leader) => (
                // ✅ leaderId 또는 id 필드명을 확인하여 매핑
                <option key={leader.userId || leader.id} value={leader.userId || leader.id}>
                  {`${leader.userName || '이름 없음'} (${leader.departmentName || '부서 미지정'})`}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 프로젝트 제목 */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">Project 제목 *</label>
          <input
            required
            type="text"
            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
            value={formData.title}
            onChange={(e) => setFormData({...formData, title: e.target.value})}
          />
        </div>

        {/* 기간 설정 */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">시작일 *</label>
            <input
              required
              type="date"
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none"
              value={formData.startDate}
              onChange={(e) => setFormData({...formData, startDate: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">종료일(마감) *</label>
            <input
              required
              type="date"
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none"
              value={formData.endDate}
              onChange={(e) => setFormData({...formData, endDate: e.target.value})}
            />
          </div>
        </div>

        {/* 우선순위 */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">우선순위 설정</label>
          <div className="flex gap-2">
            {['낮음', '중간', '높음'].map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setFormData({...formData, priority: p})}
                className={`flex-1 py-3 rounded-xl font-bold transition-all ${
                  formData.priority === p ? 'bg-emerald-600 text-white shadow-md' : 'bg-gray-50 text-gray-400'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* 설명 */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">Task 설명</label>
          <textarea
            className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl h-32 resize-none outline-none"
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className={`w-full py-4 text-white rounded-xl font-black text-lg transition-colors ${
            isLoading ? 'bg-gray-400' : 'bg-[#064e3b] hover:bg-[#053f30]'
          }`}
        >
          {isLoading ? '⏳ 처리 중...' : '🚀 Project 생성 및 배정'}
        </button>
      </form>
    </div>
  );
};

export default TaskCreate;