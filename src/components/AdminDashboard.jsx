import React, { useEffect, useState } from 'react';
import StatCard from './components/StatCard'; // 기존에 만든 컴포넌트 재사용
import { Users, Layout, FileClock, CheckSquare, Bell } from 'lucide-react';

const AdminDashboard = () => {
  /**
   * [상태 관리] 관리자 전용 대시보드 데이터
   * 설계서 v5.0의 관리자 API 응답 구조를 반영
   */
  const [adminStats, setAdminStats] = useState({
    totalUsers: 0,
    activeProjects: 0,
    pendingLeaves: 0,
    totalTasks: 0,
    taskCompletionRate: 0
  });

  const [pendingLeaveList, setPendingLeaveList] = useState([]); // 연차 승인 대기 명단
  const [projectStatus, setProjectStatus] = useState([]); // 프로젝트 현황 리스트

  useEffect(() => {
    // 백엔드 연동 전 Mock 데이터 (설계서 기준)
    const mockAdminData = {
      stats: {
        totalUsers: 24,
        activeProjects: 8,
        pendingLeaves: 4,
        totalTasks: 127,
        taskCompletionRate: 67.7
      },
      // 연차 승인 대기 리스트 (Entity: LeaveRequest 연동)[cite: 2, 4]
      leaves: [
        { id: 1, name: '김철수', type: '연차', days: 1, date: '04.01', reason: '개인 용무' },
        { id: 2, name: '이영희', type: '연차', days: 1, date: '04.10', reason: '휴가' },
      ],
      // 프로젝트 현황 (Entity: Project 연동)
      projects: [
        { id: 1, title: '사내 그룹웨어 개발', progress: 65, status: '진행중', deadline: '04.30' },
        { id: 2, title: 'ERP 시스템 고도화', progress: 30, status: '검토중', deadline: '06.30' },
      ]
    };

    setAdminStats(mockAdminData.stats);
    setPendingLeaveList(mockAdminData.leaves);
    setProjectStatus(mockAdminData.projects);
  }, []);

  // 통계 카드 설정
  const statsConfig = [
    { title: '전체 사용자', value: adminStats.totalUsers, change: '▲ 2 이번 달', color: 'text-blue-600', icon: <Users className="text-blue-400" size={20}/> },
    { title: '진행 중 프로젝트', value: adminStats.activeProjects, change: '총 12개 프로젝트', color: 'text-orange-600', icon: <Layout className="text-orange-400" size={20}/> },
    { title: '연차 승인 대기', value: adminStats.pendingLeaves, change: '🔴 즉시 처리 필요', color: 'text-red-600', icon: <FileClock className="text-red-400" size={20}/> },
    { title: '전체 Task', value: adminStats.totalTasks, change: `완료율 ${adminStats.taskCompletionRate}%`, color: 'text-emerald-600', icon: <CheckSquare className="text-emerald-400" size={20}/> },
  ];

  return (
    <div className="flex-1 p-8 overflow-y-auto bg-slate-50">
      {/* 헤더 */}
      <header className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">관리자 대시보드</h1>
          <p className="text-slate-500 mt-1">시스템의 전체 현황을 실시간으로 파악합니다.</p>
        </div>
        <div className="flex items-center gap-4">
          <button className="p-2 bg-white rounded-full border border-slate-200 text-slate-400"><Bell size={20} /></button>
          <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full border border-slate-200">
            <div className="w-7 h-7 bg-indigo-600 rounded-full flex items-center justify-center text-white text-xs font-bold">관</div>
            <span className="text-sm font-medium text-slate-700">관리자</span>
          </div>
        </div>
      </header>

      {/* 4단 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {statsConfig.map((stat, idx) => (
          <StatCard key={idx} {...stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 연차 승인 대기 리스트 영역 */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <span className="text-orange-500">⛱️</span> 연차 승인 대기
            </h3>
            <button className="text-xs bg-blue-600 text-white px-3 py-1 rounded-lg">전체보기</button>
          </div>
          <div className="space-y-4">
            {pendingLeaveList.map(leave => (
              <div key={leave.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-sm">{leave.name[0]}</div>
                  <div>
                    <p className="text-sm font-bold text-slate-700">{leave.name} · {leave.type} {leave.days}일</p>
                    <p className="text-xs text-slate-500">{leave.date} · {leave.reason}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="text-xs font-semibold bg-emerald-500 text-white px-3 py-1.5 rounded-md hover:bg-emerald-600 transition-colors">승인</button>
                  <button className="text-xs font-semibold bg-rose-500 text-white px-3 py-1.5 rounded-md hover:bg-rose-600 transition-colors">반려</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 프로젝트 현황[cite: 5] */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <span className="text-indigo-500">📝</span> 프로젝트 현황
            </h3>
            <button className="text-xs text-slate-400 hover:text-slate-600">관리</button>
          </div>
          <div className="space-y-6">
            {projectStatus.map(project => (
              <div key={project.id}>
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-bold text-slate-700">{project.title}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${project.status === '진행중' ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-600'}`}>
                    {project.status}
                  </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div className="bg-indigo-500 h-2 rounded-full" style={{ width: `${project.progress}%` }}></div>
                </div>
                <div className="flex justify-between mt-1 text-[10px] text-slate-400">
                  <span>{project.progress}% 완료</span>
                  <span>마감: {project.deadline}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;