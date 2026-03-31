import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import axios from '../api/axios'; // 성욱님의 axios 인스턴스 활용
import { Clock, Calendar as CalIcon, Coffee } from 'lucide-react';

const CalendarPage = () => {
  // 1. API 데이터 상태 관리
  const [events, setEvents] = useState([]);
  const [summary, setSummary] = useState({
    workDaysCount: 0,
    leaveUsedCount: 0,
    attendanceRecords: [] // 하단 테이블용 데이터
  });

  // 2. 초기 데이터 로드 (컴포넌트 마운트 시 실행)
  useEffect(() => {
    fetchCalendarData();
  }, []);

  const fetchCalendarData = async () => {
    try {
      // API 4.3.1: 캘린더 이벤트 조회 (업무/연차 등)
      const eventRes = await axios.get('/calendar/events', { params: { month: '2026-03' } });
      if (eventRes.data.success) {
        // 이미지(3b6603.png) 스타일의 색상 규칙 적용
        const mappedEvents = eventRes.data.data.map(item => ({
          title: item.title,
          start: item.date,
          // TASK면 파스텔 블루, LEAVE면 파스텔 그린, HOLIDAY면 파스텔 레드
          backgroundColor: item.type === 'TASK' ? '#e0f2fe' : item.type === 'LEAVE' ? '#f0fdf4' : '#fef2f2',
          textColor: item.type === 'TASK' ? '#0369a1' : item.type === 'LEAVE' ? '#15803d' : '#b91c1c',
          borderColor: 'transparent',
          extendedProps: { type: item.type }
        }));
        setEvents(mappedEvents);
      }

      // API 4.3.2: 근태 요약 및 기록 조회
      const summaryRes = await axios.get('/attendance/summary', { params: { month: '2026-03' } });
      if (summaryRes.data.success) {
        setSummary(summaryRes.data.data);
      }
    } catch (error) {
      console.error("데이터 로드 실패:", error);
      // API 연결 전 테스트를 위한 임의 데이터 (필요 시 유지, API 작동 시 삭제)
      setSummary(prev => ({
        ...prev,
        workDaysCount: 20,
        leaveUsedCount: 1.5,
        attendanceRecords: [
            { id: 1, date: "2026.03.28 (금)", inTime: "09:02", outTime: "18:05", duration: "9시간 03분", status: "정상" },
            { id: 2, date: "2026.03.27 (목)", inTime: "09:15", outTime: "18:00", duration: "8시간 45분", status: "지각" },
            { id: 3, date: "2026.03.26 (수)", inTime: "08:55", outTime: "18:10", duration: "9시간 15분", status: "정상" },
            { id: 4, date: "2026.03.25 (화)", inTime: "09:05", outTime: "19:30", duration: "10시간 25분", status: "초과" },
            { id: 5, date: "2026.03.24 (월)", inTime: "09:00", outTime: "18:00", duration: "9시간 00분", status: "정상" },
        ]
      }));
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* --- 상단 근태 요약 섹션 (화면1 디자인) --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <StatSummaryCard 
          icon={<Clock size={24} />} 
          count={summary.workDaysCount} 
          label="이번 달 출근일수" 
          color="blue" 
        />
        <StatSummaryCard 
          icon={<Coffee size={24} />} 
          count={summary.leaveUsedCount} 
          label="이번 달 사용 연차" 
          color="emerald" 
        />
      </div>

      {/* --- 중앙 월간 캘린더 섹션 (화면2 디자인) --- */}
      <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <CalIcon className="text-blue-600" size={20} />
            <h3 className="font-bold text-gray-800 text-lg">월간 캘린더</h3>
          </div>
          {/* 범례 추가 */}
          <div className="flex gap-3">
            <LegendItem color="bg-blue-100" label="업무" />
            <LegendItem color="bg-green-100" label="연차" />
            <LegendItem color="bg-red-100" label="공휴일" />
          </div>
        </div>
        
        <div className="custom-calendar-container">
          <FullCalendar
            plugins={[dayGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            locale="ko"
            height="auto"
            events={events}
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: ''
            }}
          />
        </div>
      </div>

      {/* --- 하단 출퇴근 기록 섹션 (화면3 디자인) --- */}
      <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-bold text-gray-800 flex items-center gap-2">
            <Clock size={20} className="text-gray-400" /> 출퇴근 기록
          </h3>
          <span className="text-xs text-gray-400 font-medium italic">최근 5일 기록</span>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-gray-400 border-b border-gray-50">
              <tr>
                <th className="py-4 font-semibold">날짜</th>
                <th className="py-4 font-semibold">출근</th>
                <th className="py-4 font-semibold">퇴근</th>
                <th className="py-4 font-semibold">근무시간</th>
                <th className="py-4 font-semibold">상태</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {summary.attendanceRecords.map((record) => (
                <AttendanceRow key={record.id} {...record} />
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 캘린더 내부 디테일 스타일 (전역 스타일 오염 방지용) */}
      <style>{`
        .fc { font-family: inherit; --fc-border-color: #f8fafc; }
        .fc-col-header-cell { background: #f8fafc; padding: 12px 0; border: none !important; }
        .fc-col-header-cell-cushion { color: #64748b; font-size: 13px; font-weight: 600; }
        .fc-day-sun .fc-daygrid-day-number { color: #ef4444 !important; }
        .fc-day-sat .fc-daygrid-day-number { color: #3b82f6 !important; }
        .fc-event { border-radius: 6px !important; padding: 2px 6px !important; font-size: 11px !important; font-weight: 700 !important; margin-bottom: 2px !important; }
        .fc-daygrid-day-number { font-size: 13px; font-weight: 500; color: #475569; padding: 8px !important; }
        .fc-toolbar-title { font-size: 18px !important; font-weight: 800 !important; color: #1e293b; }
        .fc-button-primary { background-color: white !important; border-color: #e2e8f0 !important; color: #475569 !important; font-weight: 700 !important; }
        .fc-button-primary:hover { background-color: #f1f5f9 !important; }
      `}</style>
    </div>
  );
};

// --- 소형 컴포넌트들 ---

const StatSummaryCard = ({ icon, count, label, color }) => (
  <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
    <div className={`w-14 h-14 ${color === 'blue' ? 'bg-blue-50 text-blue-600' : 'bg-emerald-50 text-emerald-600'} rounded-2xl flex items-center justify-center`}>
      {icon}
    </div>
    <div>
      <p className="text-4xl font-black text-gray-800">{count}</p>
      <p className="text-gray-500 text-sm font-medium mt-1">{label}</p>
    </div>
  </div>
);

const AttendanceRow = ({ date, inTime, outTime, duration, status }) => {
  const statusColors = {
    "정상": "bg-emerald-50 text-emerald-600",
    "지각": "bg-blue-50 text-blue-600",
    "초과": "bg-orange-50 text-orange-600",
    "조퇴": "bg-red-50 text-red-600"
  };

  return (
    <tr className="hover:bg-gray-50/50 transition-colors group">
      <td className="py-5 text-gray-600 font-medium">{date}</td>
      <td className="py-5 text-gray-900 font-bold">{inTime}</td>
      <td className="py-5 text-gray-900 font-bold">{outTime}</td>
      <td className="py-5 text-gray-500 font-medium">{duration}</td>
      <td className="py-5">
        <span className={`px-3 py-1 rounded-full text-[11px] font-extrabold ${statusColors[status] || "bg-gray-50 text-gray-500"}`}>
          {status}
        </span>
      </td>
    </tr>
  );
};

const LegendItem = ({ color, label }) => (
  <div className="flex items-center gap-1.5 text-[11px] font-bold text-gray-400">
    <span className={`w-2.5 h-2.5 ${color} rounded-sm`}></span> {label}
  </div>
);

export default CalendarPage;