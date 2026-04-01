import React, { useState, useEffect } from 'react';
import { ClipboardList, Edit3, Send, Users } from 'lucide-react';

const TaskEdit = () => {
  // 1. 가상 데이터: 프로젝트 목록
  const projectData = [
    { id: 1, name: "사내 그룹웨어 개발" },
    { id: 2, name: "ERP 시스템 고도화" },
    { id: 3, name: "모바일 앱 리뉴얼" },
    { id: 4, name: "사내 인트라넷 개선" }
  ];

  // 2. 가상 데이터: 프로젝트별 저장된 기존 업무 상세 정보 (수정 시 불러올 데이터)
  const savedTaskDetails = {
    1: { title: "메인 대시보드 UI 수정", assigneeId: "u1", priority: "높음", dueDate: "2026-04-15", description: "로그인 후 첫 화면의 위젯 레이아웃을 3열로 변경해야 함." },
    2: { title: "DB 인덱스 최적화", assigneeId: "u3", priority: "중간", dueDate: "2026-05-10", description: "조회 속도 개선을 위한 테이블 인덱싱 재설정 작업." },
    3: { title: "IOS 푸시 알림 연동", assigneeId: "u2", priority: "높음", dueDate: "2026-04-20", description: "파이어베이스를 이용한 IOS 알림 토큰 수신 로직 수정." },
    4: { title: "인트라넷 조직도 업데이트", assigneeId: "u4", priority: "낮음", dueDate: "2026-04-30", description: "신규 입사자 반영을 위한 조직도 데이터 파싱 코드 수정." }
  };

  // 3. 가상 데이터: 사용자 권한 명단
  const userPermissions = [
    { id: 'u1', name: '김철수', projects: [1, 2] },
    { id: 'u2', name: '이영희', projects: [1, 3] },
    { id: 'u3', name: '박민준', projects: [2, 4] },
    { id: 'u4', name: '정수진', projects: [1, 2, 3, 4] },
    { id: 'u5', name: '최동현', projects: [1, 4] },
  ];

  // 상태 관리
  const [formData, setFormData] = useState({
    projectId: '',
    title: '',
    assigneeId: '',
    priority: '중간',
    dueDate: '',
    description: ''
  });

  const [availableAssignees, setAvailableAssignees] = useState([]);

  // [핵심 로직] 프로젝트 선택 시 동작
  useEffect(() => {
    if (formData.projectId) {
      const pId = parseInt(formData.projectId);

      // A. 담당자 명단 필터링 (해당 프로젝트 권한이 있는 사람만)
      const filtered = userPermissions.filter(user => user.projects.includes(pId));
      setAvailableAssignees(filtered);

      // B. 기존 저장된 데이터 불러와서 각 칸에 넣기
      const taskDetail = savedTaskDetails[pId];
      if (taskDetail) {
        setFormData(prev => ({
          ...prev,
          title: taskDetail.title,
          assigneeId: taskDetail.assigneeId,
          priority: taskDetail.priority,
          dueDate: taskDetail.dueDate,
          description: taskDetail.description
        }));
      }
    } else {
      // 프로젝트 선택 해제 시 초기화
      setAvailableAssignees([]);
      setFormData({
        projectId: '',
        title: '',
        assigneeId: '',
        priority: '중간',
        dueDate: '',
        description: ''
      });
    }
  }, [formData.projectId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("최종 수정 데이터:", formData);
    alert("업무 수정 및 배정이 완료되었습니다.");
  };

  return (
    <div className="animate-fadeIn">
      <header className="mb-8">
        <h2 className="text-2xl font-black text-gray-800 flex items-center gap-2">📌 업무 수정</h2>
        <p className="text-sm text-gray-400 mt-1">생성된 Project 업무 관련 수정 및 배정 확인</p>
      </header>

      <div className="grid grid-cols-12 gap-8">
        {/* --- 왼쪽: 수정 폼 --- */}
        <section className="col-span-5 bg-white rounded-2xl shadow-sm border border-gray-100 p-8 h-fit">
          <div className="flex items-center gap-2 mb-8 border-b border-gray-50 pb-4">
            <Edit3 size={20} className="text-blue-600" />
            <h3 className="font-bold text-gray-700">Project 수정</h3>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-2">프로젝트 선택 *</label>
              <select 
                name="projectId"
                value={formData.projectId}
                onChange={handleChange}
                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-blue-500 transition-colors"
                required
              >
                <option value="">-- 프로젝트 선택 --</option>
                {projectData.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 mb-2">Task 제목 *</label>
              <div className="relative">
                <ClipboardList className="absolute left-3 top-3 text-gray-300" size={18} />
                <input 
                  type="text" 
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Task 제목을 입력하세요"
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-10 pr-4 py-2.5 text-sm outline-none focus:border-blue-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 mb-2">담당자 배정 *</label>
              <select 
                name="assigneeId"
                value={formData.assigneeId}
                onChange={handleChange}
                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-blue-500 transition-colors"
                disabled={!formData.projectId}
                required
              >
                <option value="">
                  {formData.projectId ? "-- 담당자 선택 --" : "-- 먼저 프로젝트를 선택하세요 --"}
                </option>
                {availableAssignees.map(user => (
                  <option key={user.id} value={user.id}>{user.name}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-2">우선순위</label>
                <select 
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-blue-500"
                >
                  <option value="낮음">낮음</option>
                  <option value="중간">중간</option>
                  <option value="높음">높음</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-2">마감일 *</label>
                <input 
                  type="date" 
                  name="dueDate"
                  value={formData.dueDate}
                  onChange={handleChange}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-blue-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 mb-2">Task 설명</label>
              <textarea 
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="4"
                placeholder="Task에 대한 상세 설명"
                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-blue-500 resize-none"
              ></textarea>
            </div>

            <button 
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow-lg transition-all active:scale-[0.98]"
            >
              <Send size={18} className="inline mr-2" />
              Task(Project) 수정
            </button>
          </form>
        </section>

        {/* --- 오른쪽: 최근 배정된 Task 리스트 --- */}
        <section className="col-span-7 bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <div className="flex justify-between items-center mb-8 border-b border-gray-50 pb-4">
            <div className="flex items-center gap-2">
              <ClipboardList size={20} className="text-orange-500" />
              <h3 className="font-bold text-gray-700">최근 배정된 Task</h3>
            </div>
            <span className="text-[10px] text-gray-400 font-medium bg-gray-50 px-2 py-1 rounded">최근 10개</span>
          </div>

          <div className="space-y-4">
            {/* 리스트 아이템 예시 */}
            <TaskListItem title="배포 환경 설정" project="그룹웨어" user="김철수" date="04.25" status="대기" color="gray" />
            <TaskListItem title="DB 스키마 설계" project="ERP" user="박민준" date="04.05" status="진행중" color="blue" />
            <TaskListItem title="UI/UX 기획서" project="모바일" user="정수진" date="04.30" status="대기" color="gray" />
            <TaskListItem title="스프린트 보드 구성" project="그룹웨어" user="이영희" date="03.28" status="완료" color="emerald" />
          </div>
        </section>
      </div>
    </div>
  );
};

// 우측 리스트 아이템 컴포넌트
const TaskListItem = ({ title, project, user, date, status, color }) => {
  const colors = {
    gray: 'bg-gray-100 text-gray-500',
    blue: 'bg-blue-100 text-blue-600',
    emerald: 'bg-emerald-100 text-emerald-600'
  };

  return (
    <div className="flex items-center justify-between p-4 rounded-xl border border-transparent hover:border-gray-100 hover:bg-gray-50 transition-all group">
      <div className="flex gap-4 items-center">
        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-400">
           <Users size={18} />
        </div>
        <div>
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">{project}</p>
          <h4 className="text-sm font-bold text-gray-700 group-hover:text-blue-600 transition-colors">{title}</h4>
        </div>
      </div>
      <div className="flex items-center gap-8">
        <div className="text-center">
          <p className="text-[10px] text-gray-400 font-bold mb-0.5">담당자</p>
          <p className="text-xs font-bold text-gray-600">{user}</p>
        </div>
        <div className="text-center">
          <p className="text-[10px] text-gray-400 font-bold mb-0.5">마감</p>
          <p className="text-xs font-bold text-gray-600">{date}</p>
        </div>
        <span className={`px-3 py-1 rounded-lg text-[10px] font-black ${colors[color]}`}>{status}</span>
      </div>
    </div>
  );
};

export default TaskEdit;