import React, { useState, useEffect, useCallback } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import axios from '../api/axios'; 
import { Clock, Calendar as CalIcon, Coffee, Plus, Search, CalendarDays } from 'lucide-react';

const CalendarPage = ({ onNavigateToApply }) => {
  // --- [v2.0 설계서 기반 상태 변수명 및 데이터 구조] ---
  const [events, setEvents] = useState([]);
  const [originalLeaveRequests, setOriginalLeaveRequests] = useState([]); // 필터링 전 원본 데이터 보관용
  const [summary, setSummary] = useState({
    workDaysCount: 0,
    leaveUsedCount: 0,
    attendanceRecords: [],
    leaveRequests: [] 
  });

  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  // 데이터 로딩 함수 (재사용을 위해 useCallback 사용)
  const fetchCalendarData = useCallback(async () => {
    try {
      const eventRes = await axios.get('/api/v1/calendar/events');
      const summaryRes = await axios.get('/api/v1/attendance/summary');
      const leaveRes = await axios.get('/api/v1/leave/requests/me');

      const leaveData = leaveRes.data.data || [];
      setOriginalLeaveRequests(leaveData);

      setSummary({
        workDaysCount: summaryRes.data.data.workDaysCount,
        leaveUsedCount: summaryRes.data.data.leaveUsedCount,
        attendanceRecords: summaryRes.data.data.rawRecords || [],
        leaveRequests: leaveData
      });

      const mappedEvents = eventRes.data.data.map(ev => ({
        title: ev.title,
        start: ev.startDate || ev.date,
        end: ev.endDate,
        backgroundColor: ev.type === 'LEAVE' ? '#ef4444' : '#3b82f6',
        allDay: true
      }));
      setEvents(mappedEvents);

    } catch (error) {
      console.error("데이터 로딩 에러 - 1~2주 단위 프로젝트 데이터를 로드합니다.");
      
      // [Mock Data] 설계서 v2.0 규격 및 1~2주 프로젝트 일정 반영
      const mockLeave = [
        { id: 9001, createdAt: "2026-03-25", leaveType: "연차", startDate: "2026-04-03", endDate: "2026-04-03", usedDays: 1.0, status: "PENDING", reason: "개인 사유" },
        { id: 9002, createdAt: "2026-03-20", leaveType: "오후반차", startDate: "2026-03-27", endDate: "2026-03-27", usedDays: 0.5, status: "APPROVED", reason: "병원 방문" },
        { id: 9004, createdAt: "2026-01-20", leaveType: "연차", startDate: "2026-02-05", endDate: "2026-02-05", usedDays: 1.0, status: "REJECTED", rejectReason: "프로젝트 마감 일정과 중복" },
      ];
      
      setOriginalLeaveRequests(mockLeave);
      setSummary({
        workDaysCount: 20,
        leaveUsedCount: 1.5,
        attendanceRecords: [
          { id: 1, date: "2026-03-31", inTime: "09:02", outTime: "18:05", status: "정상" },
          { id: 2, date: "2026-03-30", inTime: "09:15", outTime: "18:00", status: "지각" },
          { id: 3, date: "2026-03-28", inTime: "09:00", outTime: "18:00", status: "정상" },
          { id: 4, date: "2026-03-27", inTime: "09:10", outTime: "18:30", status: "정상" },
          { id: 5, date: "2026-03-26", inTime: "08:55", outTime: "18:10", status: "정상" },
        ],
        leaveRequests: mockLeave
      });

      setEvents([
        { title: "ERP 시스템 UI/UX 고도화", start: "2026-03-23", end: "2026-04-04", backgroundColor: "#3b82f6", allDay: true },
        { title: "REST API 서버 구축", start: "2026-03-16", end: "2026-03-27", backgroundColor: "#60a5fa", allDay: true },
        { title: "데이터베이스 마이그레이션", start: "2026-03-02", end: "2026-03-14", backgroundColor: "#2563eb", allDay: true },
        { title: "개인 연차 (휴가)", start: "2026-04-03", end: "2026-04-04", backgroundColor: "#ef4444", allDay: true }
      ]);
    }
  }, []);

  useEffect(() => {
    fetchCalendarData();
  }, [fetchCalendarData]);

  // --- [날짜 검색 기능 구현] ---
  const handleSearch = () => {
    const { start, end } = dateRange;

    if (!start || !end) {
      alert("시작일과 종료일을 모두 선택해주세요.");
      return;
    }

    const startDateObj = new Date(start);
    const endDateObj = new Date(end);

    if (startDateObj > endDateObj) {
      alert("시작일이 종료일보다 늦을 수 없습니다.");
      return;
    }

    // 원본 데이터에서 날짜 범위 필터링 (startDate 기준)
    const filtered = originalLeaveRequests.filter(req => {
      const targetDate = new Date(req.startDate);
      return targetDate >= startDateObj && targetDate <= endDateObj;
    });

    setSummary(prev => ({ ...prev, leaveRequests: filtered }));
    
    if (filtered.length === 0) {
      alert("해당 기간 내의 신청 내역이 없습니다.");
    }
  };

  const handleReset = () => {
    setSummary(prev => ({ ...prev, leaveRequests: originalLeaveRequests }));
    setDateRange({ start: '', end: '' });
  };

  // 배경색 로직 유지
  const handleDayCellDidMount = (arg) => {
    const dateStr = arg.date.toLocaleDateString('en-CA'); 
    const record = summary.attendanceRecords.find(r => r.date === dateStr);
    if (record) {
      const colors = { "정상": "#f0fdf4", "지각": "#eff6ff", "초과": "#fff7ed" };
      arg.el.style.backgroundColor = colors[record.status] || 'transparent';
    }
  };

  // 2. 버튼 클릭 시 실행될 핸들러 추가
  const handleGoToApply = () => {
    if (onNavigateToApply) {
      onNavigateToApply(); // 부모(UserDashboard)의 activeMenu를 'leave-apply'로 변경
    }
  };

  return (
    <div className="p-8 space-y-8 bg-slate-50 min-h-screen font-sans text-slate-900">
      
      {/* 상단 요약 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <StatCard icon={<Clock size={28}/>} count={summary.workDaysCount} label="총 누적 출근일" color="blue" />
        <StatCard icon={<Coffee size={28}/>} count={summary.leaveUsedCount} label="사용 연차 합계" color="emerald" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* 캘린더 영역 */}
        <div className="lg:col-span-3 bg-white p-8 rounded-[32px] shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-xl flex items-center gap-2"><CalIcon className="text-blue-600" /> 근태 및 프로젝트 현황</h3>
            <div className="flex gap-3">
              <LegendItem color="bg-[#f0fdf4]" label="정상" />
              <LegendItem color="bg-[#eff6ff]" label="지각" />
              <LegendItem color="bg-blue-500" label="프로젝트" />
            </div>
          </div>
          <div className="custom-calendar">
            <FullCalendar
              plugins={[dayGridPlugin, interactionPlugin]}
              initialView="dayGridMonth"
              locale="ko"
              height="650px"
              events={events}
              dayCellDidMount={handleDayCellDidMount}
              headerToolbar={{ left: 'prev,next today', center: 'title', right: '' }}
            />
          </div>
        </div>

        {/* 최근 기록 (역순 정렬) */}
        <div className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100 overflow-hidden flex flex-col">
          <h3 className="font-bold text-lg mb-6 flex items-center gap-2"><Clock size={20} className="text-blue-600" /> 최근 기록 (역순)</h3>
          <div className="space-y-3 overflow-y-auto pr-2 custom-scroll">
            {[...summary.attendanceRecords]
              .sort((a, b) => new Date(b.date) - new Date(a.date)) 
              .map((record) => (
              <div key={record.id} className="p-4 bg-slate-50/50 rounded-2xl border border-transparent hover:border-blue-100 transition-all group">
                <div className="flex justify-between items-center">
                  <p className="text-sm font-bold text-gray-800">{record.date}</p>
                  <StatusBadge status={record.status} />
                </div>
                <p className="text-xs text-gray-400 mt-1 font-medium">{record.inTime} - {record.outTime}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 연차 신청 내역 및 검색 섹션 */}
      <div className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-50 rounded-2xl text-emerald-600"><CalIcon size={24} /></div>
            <h3 className="font-bold text-xl">연차 신청 내역</h3>
          </div>
          
          <div className="flex items-center gap-2 w-full md:w-auto">
            <div className="flex items-center bg-slate-100 rounded-xl px-3 py-2 border border-gray-200">
              <CalendarDays size={16} className="text-gray-400 mr-2" />
              <input type="date" value={dateRange.start} className="bg-transparent text-xs font-bold outline-none" onChange={(e) => setDateRange({...dateRange, start: e.target.value})} />
              <span className="mx-2 text-gray-300">~</span>
              <input type="date" value={dateRange.end} className="bg-transparent text-xs font-bold outline-none" onChange={(e) => setDateRange({...dateRange, end: e.target.value})} />
            </div>
            <button onClick={handleSearch} className="bg-slate-800 text-white px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 hover:bg-black transition-all"><Search size={14} /> 검색</button>
            <button onClick={handleReset} className="bg-slate-200 text-slate-600 px-4 py-2.5 rounded-xl font-bold text-xs hover:bg-slate-300 transition-all">전체보기</button>
            <button 
              onClick={handleGoToApply} 
              className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"
            >
              <Plus size={16} /> 연차 신청
            </button>
          </div>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-gray-50">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="bg-slate-50 text-gray-400 font-semibold border-b">
                <th className="py-5 px-6">신청일</th>
                <th className="py-5 px-4">연차 유형</th>
                <th className="py-5 px-4 text-center">시작일</th>
                <th className="py-5 px-4 text-center">종료일</th>
                <th className="py-5 px-4 text-center">일수</th>
                <th className="py-5 px-4 text-center">상태</th>
                <th className="py-5 px-6 text-right">비고</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {summary.leaveRequests.map((req) => (
                <tr key={req.id} className="group hover:bg-slate-50/30 transition-colors">
                  <td className="py-6 px-6 text-gray-400">{req.createdAt}</td>
                  <td className="py-6 px-4 font-bold">{req.leaveType}</td>
                  <td className="py-6 px-4 text-center">{req.startDate}</td>
                  <td className="py-6 px-4 text-center">{req.endDate}</td>
                  <td className="py-6 px-4 text-center font-black text-blue-600">{req.usedDays}일</td>
                  <td className="py-6 px-4 text-center"><StatusBadge status={req.status} /></td>
                  <td className="py-6 px-6 text-right">
                    {req.status === "REJECTED" && (
                      <button onClick={() => alert(`[반려 사유]\n${req.rejectReason}`)} className="text-[10px] font-bold text-red-500 bg-red-50 px-2.5 py-1.5 rounded-lg border border-red-100 hover:bg-red-100">사유 보기</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <style>{`
        .fc-event { border: none !important; padding: 4px 8px !important; font-size: 11px !important; font-weight: 700 !important; border-radius: 4px !important; margin-bottom: 2px !important; }
        .fc-daygrid-event-harness { margin: 0 4px !important; }
        .custom-scroll::-webkit-scrollbar { width: 4px; }
        .custom-scroll::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
        .fc-day-sun .fc-daygrid-day-number { color: #ef4444 !important; }
        .fc-day-sat .fc-daygrid-day-number { color: #3b82f6 !important; }
      `}</style>
    </div>
  );
};

// 서브 컴포넌트들
const StatCard = ({ icon, count, label, color }) => (
  <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm flex items-center gap-6">
    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${color === 'blue' ? 'bg-blue-50 text-blue-600' : 'bg-emerald-50 text-emerald-600'}`}>{icon}</div>
    <div><p className="text-4xl font-black text-slate-800 tracking-tight">{count}</p><p className="text-slate-400 font-bold text-xs uppercase mt-1">{label}</p></div>
  </div>
);

const StatusBadge = ({ status }) => {
  const styles = { "정상": "bg-emerald-50 text-emerald-600", "지각": "bg-blue-50 text-blue-600", "초과": "bg-orange-50 text-orange-600", "APPROVED": "bg-emerald-100 text-emerald-700", "PENDING": "bg-amber-100 text-amber-700", "REJECTED": "bg-red-100 text-red-700" };
  const labels = { "APPROVED": "승인", "PENDING": "대기중", "REJECTED": "반려" };
  return <span className={`px-2.5 py-1 rounded-full text-[10px] font-black ${styles[status] || "bg-slate-100 text-slate-600"}`}>{labels[status] || status}</span>;
};

const LegendItem = ({ color, label }) => (
  <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400"><span className={`w-2.5 h-2.5 ${color} rounded-sm border border-gray-100`}></span> {label}</div>
);

export default CalendarPage;