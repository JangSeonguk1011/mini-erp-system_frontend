import React, { useState, useEffect, useCallback } from 'react';
import FullCalendar from '@fullcalendar/react';
import daygridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import axios from '../api/axios';
import { Clock, Calendar as CalIcon, Coffee, Plus, CalendarDays, Loader2, AlertCircle, CheckCircle2, LogIn, LogOut, Info } from 'lucide-react';

const CalendarPage = ({ onNavigateToApply }) => {
  const [events, setEvents] = useState([]);
  const [originalLeaveRequests, setOriginalLeaveRequests] = useState([]);
  const [filteredLeaveRequests, setFilteredLeaveRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedDateLabel, setSelectedDateLabel] = useState('실시간');
  const [displayRecords, setDisplayRecords] = useState([]); // 출근 기록 + 이벤트 통합 리스트

  const [summary, setSummary] = useState({
    workDaysCount: 0,
    leaveUsedTotal: 0,
    attendanceRecords: [],
  });

  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  const HOLIDAYS_2026 = [
    { title: "신정", start: "2026-01-01", type: "HOLIDAY" },
    { title: "설날", start: "2026-02-16", end: "2026-02-19", type: "HOLIDAY" },
    { title: "삼일절", start: "2026-03-01", type: "HOLIDAY" },
    { title: "대체공휴일", start: "2026-03-02", type: "HOLIDAY" },
    { title: "어린이날", start: "2026-05-05", type: "HOLIDAY" },
    { title: "부처님오신날", start: "2026-05-24", type: "HOLIDAY" },
    { title: "대체공휴일", start: "2026-05-25", type: "HOLIDAY" },
    { title: "현충일", start: "2026-06-06", type: "HOLIDAY" },
    { title: "광복절", start: "2026-08-15", type: "HOLIDAY" },
    { title: "대체공휴일", start: "2026-08-17", type: "HOLIDAY" },
    { title: "추석", start: "2026-09-24", end: "2026-09-27", type: "HOLIDAY" },
    { title: "개천절", start: "2026-10-03", type: "HOLIDAY" },
    { title: "한글날", start: "2026-10-09", type: "HOLIDAY" },
    { title: "성탄절", start: "2026-12-25", type: "HOLIDAY" },
  ];

  const fetchCalendarData = useCallback(async () => {
    setLoading(true);
    try {
      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonthInt = now.getMonth() + 1;
      const formattedMonth = `${currentYear}-${String(currentMonthInt).padStart(2, '0')}`;

      const results = await Promise.allSettled([
        axios.get('/leave/my'),
        axios.get('/calendar/events', { params: { year: currentYear, month: currentMonthInt } }),
        axios.get('/attendance/summary', { params: { month: formattedMonth } }),
        axios.get('/projects'), 
        axios.get('/overtime/list')
      ]);

      const getSafeData = (res) => (res.status === 'fulfilled' && res.value.data) ? (res.value.data.data || res.value.data || []) : [];
      
      const lDataRaw = getSafeData(results[0]);
      const cEventsRaw = getSafeData(results[1]);
      const sData = (results[2].status === 'fulfilled' && results[2].value.data?.success) ? (results[2].value.data.data || {}) : {};
      const pData = getSafeData(results[3]); 
      const oData = getSafeData(results[4]);

      // 1. 연차 데이터 가공
      const mappedLeaveData = lDataRaw.map(l => {
        const type = l.app_type || l.appType;
        let typePrefix = '[연차]';
        if (type === 'HALF_MORNING') typePrefix = '[오전반차]';
        if (type === 'HALF_AFTERNOON') typePrefix = '[오후반차]';

        return {
          ...l,
          appId: l.id || l.appId,
          appType: type,
          appStatus: l.app_status || l.appStatus,
          startDate: l.start_date || l.startDate,
          endDate: l.end_date || l.endDate,
          usedDays: Number(l.usedDays || l.used_days || 0),
          displayTitle: `${typePrefix} ${l.request_reason || l.requestReason || '개인 사유'}`,
          createdAt: l.created_at || l.createdAt
        };
      });

      const myApprovedLeaveTotal = mappedLeaveData
        .filter(l => l.appStatus === 'APPROVED')
        .reduce((acc, cur) => acc + (cur.usedDays || 0), 0);

      // 2. 출근 기록 가공
      const attendanceRecords = (sData.attendanceRecords || []).map((record, index) => ({
        id: `att-${index}`,
        work_date: record.workDate,
        clock_in_time: record.clockInTime || '--:--',
        clock_out_time: record.clockOutTime || '--:--',
        status: record.status || "정상",
        recordType: 'ATTENDANCE' // 타입 구분자 추가
      }));

      // 3. 이벤트 가공 (캘린더 표시용)
      const leaveEvents = mappedLeaveData
        .filter(l => l.appStatus === 'APPROVED')
        .map(l => ({
          id: `lv-${l.appId}`,
          title: l.displayTitle,
          start: l.startDate,
          end: l.endDate,
          type: 'LEAVE',
          backgroundColor: l.appType.includes('HALF') ? '#a78bfa' : '#8b5cf6', 
        }));

      const overtimeEvents = oData
        .filter(o => (o.status || o.appStatus) === 'APPROVED')
        .map(o => ({
          id: `ot-${o.id}`,
          title: `[특근] ${o.reason || '주말특근'}`,
          start: o.overtime_date || o.overtimeDate,
          end: o.overtime_date || o.overtimeDate,
          type: 'OVERTIME'
        }));

      const projectEvents = pData.map((p, idx) => ({
        id: `pj-${p.projectId || p.id || idx}`, 
        title: `[P] ${p.title || p.projectName || '무제 프로젝트'}`,
        start: p.startDate || p.start_date,
        end: p.endDate || p.end_date,
        type: 'PROJECT'
      }));

      const rawEvents = [
        ...HOLIDAYS_2026.map((h, idx) => ({ ...h, id: `hld-${idx}` })),
        ...cEventsRaw.map((e, idx) => ({ ...e, id: e.eventId ? `srv-${e.eventId}` : `ce-${idx}` })),
        ...leaveEvents,
        ...projectEvents,
        ...overtimeEvents
      ];

      const uniqueEventsMap = new Map();
      rawEvents.forEach(evt => { if (evt.start) uniqueEventsMap.set(evt.id, evt); });

      const finalEvents = Array.from(uniqueEventsMap.values()).map(event => ({
        ...event,
        backgroundColor: event.type === 'HOLIDAY' ? '#ef4444' : 
                         event.type === 'LEAVE' ? '#8b5cf6' :   
                         event.type === 'PROJECT' ? '#10b981' : 
                         event.type === 'OVERTIME' ? '#f59e0b' : '#3b82f6',
        borderColor: 'transparent',
        allDay: true,
      }));

      setEvents(finalEvents);
      setOriginalLeaveRequests(mappedLeaveData);
      setFilteredLeaveRequests(mappedLeaveData);
      setDisplayRecords(attendanceRecords);
      
      setSummary({
        workDaysCount: sData.workDaysCount || 0,
        leaveUsedTotal: sData.leaveUsedCount || myApprovedLeaveTotal, 
        attendanceRecords: attendanceRecords,
      });

    } catch (error) {
      console.error("❌ 데이터 가공 에러:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCalendarData();
  }, [fetchCalendarData]); 

  // 날짜 클릭 핸들러 수정 (출근기록 + 이벤트 통합 필터링)
  const handleDateClick = (arg) => {
    const clickedDate = arg.dateStr;
    
    // 1. 해당 날짜의 출근 기록 필터링
    const attendanceOnDate = summary.attendanceRecords.filter(r => r.work_date === clickedDate);
    
    // 2. 해당 날짜에 걸쳐 있는 이벤트 필터링 (연차, 공휴일 등)
    const eventsOnDate = events.filter(evt => {
      const start = evt.start;
      const end = evt.end || evt.start; // 종료일이 없으면 시작일과 동일하게 처리
      return clickedDate >= start && clickedDate <= end;
    }).map(evt => ({
      id: evt.id,
      title: evt.title,
      type: evt.type,
      recordType: 'EVENT' // 타입 구분자
    }));

    setDisplayRecords([...attendanceOnDate, ...eventsOnDate]);
    setSelectedDateLabel(clickedDate);
  };

  const handleAttendance = async (type) => {
    try {
      const now = new Date();
      const workDate = now.toLocaleDateString('en-CA'); 
      const currentTime = now.toTimeString().split(' ')[0]; 

      if (type === 'IN') {
        await axios.post('/attendance/check-in', {
          workDate: workDate,
          clockInTime: currentTime 
        });
        alert(`출근 기록 완료! (${currentTime})`);
      } else {
        await axios.patch('/attendance/check-out', {
          clockOutTime: currentTime
        }, {
          params: { workDate: workDate }
        });
        alert(`퇴근 기록 완료! (${currentTime})`);
      }
      
      fetchCalendarData();
    } catch (error) {
      console.error("❌ 근태 에러 상세:", error.response?.data);
      const serverMessage = error.response?.data?.error?.message || "데이터 형식이 올바르지 않습니다.";
      alert(`근태 처리 실패: ${serverMessage}`);
    }
  };

  const handleSearch = () => {
    const { start, end } = dateRange;
    if (!start || !end) { alert("검색 범위를 선택해주세요."); return; }
    const filtered = originalLeaveRequests.filter(req => 
      (req.startDate >= start && req.startDate <= end) || (req.endDate >= start && req.endDate <= end)
    );
    setFilteredLeaveRequests(filtered);
  };

  const handleReset = () => {
    setFilteredLeaveRequests(originalLeaveRequests);
    setDateRange({ start: '', end: '' });
    setDisplayRecords(summary.attendanceRecords);
    setSelectedDateLabel('실시간');
  };

  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-slate-50">
      <div className="text-center">
        <Loader2 className="animate-spin text-blue-600 mb-4 mx-auto" size={48} />
        <p className="text-slate-500 font-bold">데이터를 불러오는 중입니다...</p>
      </div>
    </div>
  );

  return (
    <div className="p-8 space-y-8 bg-slate-50 min-h-screen font-sans text-slate-900">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <StatCard icon={<Clock size={28}/>} count={summary.workDaysCount} label="이번 달 총 출근일" color="blue" />
        <StatCard icon={<Coffee size={28}/>} count={summary.leaveUsedTotal} label="사용 승인 연차 (일)" color="emerald" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3 bg-white p-8 rounded-[32px] shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-xl flex items-center gap-2">
              <CalIcon className="text-blue-600" /> 월간 스케줄 현황
            </h3>
            <div className="flex gap-4 text-[10px] font-bold">
              <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-emerald-500"></div> 프로젝트</span>
              <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-orange-500"></div> 특근</span>
              <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-purple-500"></div> 연차</span>
              <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-red-500"></div> 공휴일</span>
            </div>
          </div>
          <div className="custom-calendar">
            <FullCalendar
              plugins={[daygridPlugin, interactionPlugin]}
              initialView="dayGridMonth"
              locale="ko"
              height="680px"
              events={events}
              dateClick={handleDateClick}
              headerToolbar={{ left: 'prev,next today', center: 'title', right: '' }}
            />
          </div>
        </div>

        <div className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100 flex flex-col h-[780px]">
          <h3 className="font-bold text-lg mb-6 flex items-center gap-2 text-slate-700">
            <CheckCircle2 size={20} className="text-blue-600" /> {selectedDateLabel} 상세 현황
          </h3>
          
          <div className="space-y-4 overflow-y-auto pr-2 custom-scroll flex-1">
            {displayRecords.length > 0 ? (
              displayRecords.map((item) => (
                <div key={item.id} className="p-5 bg-slate-50 rounded-2xl border border-slate-100 transition-all hover:bg-white hover:shadow-md">
                  {item.recordType === 'ATTENDANCE' ? (
                    /* 출근 기록 렌더링 */
                    <>
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex flex-col">
                          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{item.work_date}</p>
                          <span className={`w-fit mt-1 px-2 py-0.5 rounded-md text-[10px] font-bold ${item.status === '정상' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                            출근: {item.status}
                          </span>
                        </div>
                        <Clock size={16} className="text-slate-300" />
                      </div>
                      <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-slate-50 shadow-sm">
                        <div className="text-center flex-1">
                          <p className="text-[10px] text-slate-400 font-bold mb-1 uppercase">In</p>
                          <p className="text-2xl font-black text-blue-600 tracking-tight">{item.clock_in_time}</p>
                        </div>
                        <div className="w-[1px] h-10 bg-slate-100 mx-2"></div>
                        <div className="text-center flex-1">
                          <p className="text-[10px] text-slate-400 font-bold mb-1 uppercase">Out</p>
                          <p className="text-2xl font-black text-slate-800 tracking-tight">{item.clock_out_time}</p>
                        </div>
                      </div>
                    </>
                  ) : (
                    /* 이벤트(공휴일/연차 등) 렌더링 */
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-xl ${
                        item.type === 'HOLIDAY' ? 'bg-red-50 text-red-600' : 
                        item.type === 'LEAVE' ? 'bg-purple-50 text-purple-600' :
                        item.type === 'PROJECT' ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'
                      }`}>
                        <Info size={20} />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{item.type}</p>
                        <p className="text-sm font-bold text-slate-800">{item.title}</p>
                      </div>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-slate-400">
                <AlertCircle size={32} className="mb-2 opacity-20" />
                <p className="text-xs italic">기록이 없습니다.</p>
              </div>
            )}
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <button onClick={() => handleAttendance('IN')} className="flex items-center justify-center gap-2 py-4 bg-blue-600 text-white rounded-2xl font-bold shadow-lg hover:bg-blue-700 active:scale-95 transition-all">
              <LogIn size={18} /> 출근
            </button>
            <button onClick={() => handleAttendance('OUT')} className="flex items-center justify-center gap-2 py-4 bg-slate-800 text-white rounded-2xl font-bold shadow-lg hover:bg-black active:scale-95 transition-all">
              <LogOut size={18} /> 퇴근
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
          <h3 className="font-bold text-xl flex items-center gap-2">
            <CalendarDays className="text-emerald-500" /> 연차 신청 상세 내역
          </h3>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center bg-slate-100 rounded-xl px-3 py-2 border border-slate-200">
              <input type="date" value={dateRange.start} className="bg-transparent text-xs font-bold outline-none" onChange={(e) => setDateRange({...dateRange, start: e.target.value})} />
              <span className="mx-2 text-gray-400">~</span>
              <input type="date" value={dateRange.end} min={dateRange.start} className="bg-transparent text-xs font-bold outline-none" onChange={(e) => setDateRange({...dateRange, end: e.target.value})} />
            </div>
            <button onClick={handleSearch} className="bg-slate-800 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-black">검색</button>
            <button onClick={handleReset} className="bg-slate-200 text-slate-600 px-4 py-2 rounded-xl text-xs font-bold">초기화</button>
            <button onClick={() => onNavigateToApply?.()} className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-lg active:scale-95 transition-all">
              <Plus size={16} /> 연차 신청
            </button>
          </div>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-slate-100">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100">
              <tr>
                <th className="py-4 px-6 text-xs uppercase tracking-wider">신청일</th>
                <th className="py-4 px-4 text-xs uppercase tracking-wider">유형</th>
                <th className="py-4 px-4 text-center text-xs uppercase tracking-wider">기간</th>
                <th className="py-4 px-4 text-center text-xs uppercase tracking-wider">일수</th>
                <th className="py-4 px-4 text-center text-xs uppercase tracking-wider">상태</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredLeaveRequests.length > 0 ? (
                filteredLeaveRequests.map((req, index) => (
                  <tr key={req.appId || index} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-5 px-6 text-slate-400 font-medium">{req.createdAt?.split('T')[0] || '-'}</td>
                    <td className="py-5 px-4 font-bold text-slate-700">{req.appType === 'ANNUAL' ? '연차' : req.appType}</td>
                    <td className="py-5 px-4 text-center text-slate-600 font-medium">{req.startDate} ~ {req.endDate}</td>
                    <td className="py-5 px-4 text-center font-black text-blue-600">{req.usedDays}일</td>
                    <td className="py-5 px-4 text-center"><StatusBadge status={req.appStatus} /></td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="py-20 text-center text-slate-400 font-medium italic">신청 내역이 없습니다.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <style>{`
        .fc-event { border: none !important; padding: 4px 8px !important; font-size: 11px !important; font-weight: 800 !important; border-radius: 8px !important; cursor: pointer; }
        .fc-day-sun .fc-daygrid-day-number { color: #ef4444 !important; }
        .fc-day-sat .fc-daygrid-day-number { color: #3b82f6 !important; }
        .custom-scroll::-webkit-scrollbar { width: 4px; }
        .custom-scroll::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
      `}</style>
    </div>
  );
};

const StatCard = ({ icon, count, label, color }) => (
  <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm flex items-center gap-6 transition-all hover:shadow-lg">
    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${color === 'blue' ? 'bg-blue-50 text-blue-600' : 'bg-emerald-50 text-emerald-600'}`}>{icon}</div>
    <div>
      <p className="text-4xl font-black text-slate-800 tracking-tight">{count}</p>
      <p className="text-slate-400 font-bold text-[10px] uppercase mt-1 tracking-widest">{label}</p>
    </div>
  </div>
);

const StatusBadge = ({ status }) => {
  const styles = { "APPROVED": "bg-emerald-100 text-emerald-700", "PENDING": "bg-amber-100 text-amber-700", "REJECTED": "bg-red-100 text-red-700" };
  const labels = { "APPROVED": "승인됨", "PENDING": "대기중", "REJECTED": "반려됨" };
  return <span className={`px-3 py-1 rounded-full text-[10px] font-black ${styles[status] || "bg-slate-100 text-slate-600"}`}>{labels[status] || status}</span>;
};

export default CalendarPage;