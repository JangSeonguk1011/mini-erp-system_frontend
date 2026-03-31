import './App.css';
import { useEffect, useState } from 'react';
import Sidebar from './components/Sidebar';
import StatCard from './components/StatCard';
import { Users, Layout, FileClock, CheckSquare, Bell } from 'lucide-react';

function App() {
  /**
   * [상태 관리] 관리자 데이터 구조
   * 설계서 v5.0 관리자 전용 API 명세를 반영한 Mock 상태입니다.
   */
  const [adminUser, setAdminUser] = useState({
    name: "박관리",
    rankName: "시스템 관리자",
    deptName: "관리팀",
    role: "ADMIN"
  });

  const [adminStats, setAdminStats] = useState({
    totalUsers: 0,
    activeProjects: 0,
    pendingLeaves: 0,
    totalTasks: 0,
    completionRate: 0
  });

  const [pendingLeaves, setPendingLeaves] = useState([]);
  const [projectList, setProjectList] = useState([]);

  /**
   * [데이터 페칭] 관리자 전용 데이터 로드
   */
  useEffect(() => {
    // 1. 관리자 통계 Mock 데이터
    setAdminStats({
      totalUsers: 24,
      activeProjects: 8,
      pendingLeaves: 4,
      totalTasks: 127,
      completionRate: 67.7
    });

    // 2. 연차 승인 대기 목록 (Entity: LeaveRequest 연동 포인트)
    setPendingLeaves([
      { id: 1, name: '김철수', type: '연차', date: '04.01', reason: '개인 용무', initials: '김' },
      { id: 2, name: '이영희', type: '연차', date: '04.10', reason: '휴가', initials: '이' },
      { id: 3, name: '박민준', type: '오전반차', date: '04.03', reason: '병원 방문', initials: '박' },
    ]);

    // 3. 프로젝트 현황 (Entity: Project 연동 포인트)
    setProjectList([
      { id: 1, title: '사내 그룹웨어 개발', progress: 65, status: '진행중', deadline: '04.30', color: 'bg-blue-500' },
      { id: 2, title: 'ERP 시스템 고도화', progress: 30, status: '검토중', deadline: '06.30', color: 'bg-orange-500' },
      { id: 3, title: '모바일 앱 리뉴얼', progress: 10, status: '기획중', deadline: '09.30', color: 'bg-purple-500' },
    ]);
  }, []);

  // 관리자 대시보드용 상단 카드 설정
  const adminStatsConfig = [
    { title: '전체 사용자', value: adminStats.totalUsers, change: '▲ 2 이번 달', color: 'text-blue-600', icon: <Users className="text-blue-400" size={20}/> },
    { title: '진행 중 프로젝트', value: adminStats.activeProjects, change: '총 12개 프로젝트', color: 'text-orange-600', icon: <Layout className="text-orange-400" size={20}/> },
    { title: '연차 승인 대기', value: adminStats.pendingLeaves, change: '🔴 즉시 처리 필요', color: 'text-red-600', icon: <FileClock className="text-red-400" size={20}/> },
    { title: '전체 Task 완료율', value: `${adminStats.completionRate}%`, change: `총 ${adminStats.totalTasks}건 기준`, color: 'text-emerald-600', icon: <CheckSquare className="text-emerald-400" size={20}/> },
  ];

  return (
    <div className="flex bg-slate-50 h-screen overflow-hidden">
      
      {/* 사이드바: 관리자 정보 전달 */}
      <Sidebar user={{...adminUser, position: `${adminUser.deptName} · ${adminUser.rankName}`}} />
      
      <main className="flex-1 p-8 overflow-y-auto">
        
        {/* 헤더 섹션 */}
        <header className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">관리자 대시보드</h1>
            <p className="text-slate-500 mt-1">시스템의 전반적인 운영 현황을 관리합니다.</p>
          </div>
          
          <div className="flex items-center gap-4">
            <button className="p-2 bg-white rounded-full border border-slate-200 text-slate-400 relative">
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
              <Bell size={20} />
            </button>
            <div className="w-10 h-10 bg-indigo-700 rounded-full text-white flex items-center justify-center font-bold">관</div>
          </div>
        </header>

        {/* 1. 관리자 요약 통계 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {adminStatsConfig.map((stat, idx) => (
            <StatCard key={idx} {...stat} />
          ))}
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* 2. 연차 승인 대기 영역 */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <span className="text-orange-500">⛱️</span> 연차 승인 대기
              </h3>
              <button className="text-xs font-bold text-white bg-blue-600 px-3 py-1.5 rounded-lg">전체보기</button>
            </div>
            
            <div className="space-y-4">
              {pendingLeaves.map(leave => (
                <div key={leave.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-sm">{leave.initials}</div>
                    <div>
                      <p className="text-sm font-bold text-slate-700">{leave.name} · {leave.type}</p>
                      <p className="text-xs text-slate-500">{leave.date} · {leave.reason}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button className="px-3 py-1.5 bg-emerald-500 text-white text-xs font-bold rounded-md">승인</button>
                    <button className="px-3 py-1.5 bg-rose-500 text-white text-xs font-bold rounded-md">반려</button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 3. 프로젝트 현황 영역 */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <span className="text-indigo-500">📝</span> 프로젝트 현황
              </h3>
              <button className="text-xs text-slate-400 hover:underline">프로젝트 관리</button>
            </div>
            
            <div className="space-y-6">
              {projectList.map(project => (
                <div key={project.id}>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-bold text-slate-700">{project.title}</span>
                    <span className="text-xs font-medium text-slate-400">{project.status}</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2.5">
                    <div 
                      className={`${project.color} h-2.5 rounded-full transition-all duration-700`} 
                      style={{ width: `${project.progress}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between mt-2">
                    <span className="text-[11px] text-slate-500">{project.progress}% 완료</span>
                    <span className="text-[11px] text-slate-400">마감: {project.deadline}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}

export default App;