import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { 
  Layout, 
  CheckCircle, 
  LogOut, 
  Bell, 
  Settings, 
  Users, 
  FolderKanban,
  X
} from 'lucide-react';

const LeaveApprovalPage = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  // 1. 데이터 리스트 (상태 확인을 위해 샘플 추가)
  const [requests, setRequests] = useState([
    { id: 1, name: '김철수', type: '연차', period: '04.01', days: 1.0, reason: '개인 용무', applyDate: '03.25', status: '대기중' },
    { id: 2, name: '이영희', type: '연차', period: '04.13', days: 1.0, reason: '가족 행사', applyDate: '03.26', status: '승인' },
    { id: 3, name: '박민준', type: '오전반차', period: '04.05', days: 0.5, reason: '병원 방문', applyDate: '03.27', status: '반려', rejectReason: '업무 일정 충돌' },
    { id: 4, name: '정수진', type: '연속연차', period: '04.14-15', days: 2.0, reason: '가족 여행', applyDate: '03.27', status: '대기중' },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  // 2. 실제 카운트
  const pendingCount = requests.filter(r => r.status === '대기중').length;
  const approvedCount = requests.filter(r => r.status === '승인').length;
  const rejectedCount = requests.filter(r => r.status === '반려').length;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // [승인] 처리
  const handleApprove = (id) => {
    setRequests(requests.map(req => 
      req.id === id ? { ...req, status: '승인' } : req
    ));
    alert('승인 처리가 완료되었습니다.');
  };

  // [반려] 모달 열기
  const openRejectModal = (req) => {
    setSelectedRequest(req);
    setIsModalOpen(true);
  };

  // [반려] 최종 처리
  const handleRejectSubmit = () => {
    if (!rejectReason.trim()) {
      alert('반려 사유를 입력해주세요.');
      return;
    }
    setRequests(requests.map(req => 
      req.id === selectedRequest.id ? { ...req, status: '반려', rejectReason: rejectReason } : req
    ));
    setIsModalOpen(false);
    setRejectReason('');
    alert('반려 처리가 완료되었습니다.');
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <aside className="w-64 bg-white border-r border-gray-100 flex flex-col p-6 fixed h-full shadow-sm">
        <div className="flex items-center gap-2 text-blue-900 font-bold text-lg mb-8 cursor-pointer" onClick={() => navigate('/admin/dashboard')}>
          <div className="w-8 h-8 bg-blue-900 rounded flex items-center justify-center text-white text-xs font-serif">W</div>
          WorkFlow <span className="text-[10px] font-normal text-gray-400 ml-1">(관리자)</span>
        </div>

        <div className="flex items-center gap-3 mb-10 px-2">
          <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center text-white font-bold shadow-sm">
            {user?.name?.charAt(0) || '관'}
          </div>
          <div>
            <p className="text-sm font-bold text-gray-800">{user?.name || '관리자'}</p>
            <p className="text-[11px] text-gray-400 font-medium">시스템 관리자</p>
          </div>
        </div>

        <nav className="flex-1 space-y-6">
          <div>
            <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-4 px-2 font-bold">관리 메뉴</p>
            <div className="space-y-1">
              <AdminNavItem icon={<Layout size={18}/>} label="관리자 대시보드" active={false} onClick={() => navigate('/admin/dashboard')} />
              <AdminNavItem icon={<Settings size={18}/>} label="권한 부여" />
              <AdminNavItem icon={<Users size={18}/>} label="업무 배정" badge="3" />
              <AdminNavItem icon={<CheckCircle size={18}/>} label="연차 승인" badge={pendingCount.toString()} active={true} onClick={() => navigate('/admin/approvals')} />
            </div>
          </div>
          <div>
            <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-4 px-2 font-bold">프로젝트 정보</p>
                <AdminNavItem icon={<FolderKanban size={18}/>} label="프로젝트 관리" isFolder />
            </div>
        </nav>

        <button onClick={handleLogout} className="flex items-center gap-2 text-orange-600 font-bold p-2.5 hover:bg-orange-50 rounded-lg mt-auto group">
          <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" /> 
          <span className="text-sm">로그아웃</span>
        </button>
      </aside>

      <main className="flex-1 ml-64 p-8">
        <header className="flex justify-between items-center mb-10">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 tracking-tight">연차 승인 / 반려</h2>
            <p className="text-sm text-gray-400 mt-1">사원들의 신청 내역을 검토하고 처리 결과를 반영합니다.</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative p-2 text-gray-400 hover:bg-gray-100 rounded-full cursor-pointer transition-colors">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-emerald-500 rounded-full border-2 border-white"></span>
            </div>
            <div className="w-8 h-8 bg-emerald-600 text-white rounded-full flex items-center justify-center text-xs font-bold border-2 border-emerald-100 shadow-sm">
              관
            </div>
          </div>
        </header>

        <section className="mb-10">
          {/* 하단 타이틀 부분 문구 수정 */}
          <div className="flex items-center gap-3 mb-6">
            <span className="text-2xl">📋</span>
            <h3 className="text-xl font-bold text-gray-900 font-sans">결재 현황</h3>
          </div>

          <div className="grid grid-cols-4 gap-6">
            {/* 실제 데이터 기반으로 숫자 연동 */}
            <StatusCard title="대기 중" count={pendingCount} icon="⏳" />
            <StatusCard title="이번 달 승인" count={approvedCount} icon="✅" color="text-emerald-500" />
            <StatusCard title="이번 달 반려" count={rejectedCount} icon="❌" color="text-red-500" />
            <StatusCard title="이번 주 연차자" count="5" icon="📅" color="text-blue-500" />
          </div>
        </section>

        <section className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">
                <th className="px-6 py-4">신청자</th>
                <th className="px-6 py-4">유형</th>
                <th className="px-6 py-4">신청 기간</th>
                <th className="px-6 py-4">사유</th>
                <th className="px-6 py-4 text-center">신청일</th>
                <th className="px-6 py-4 text-center">상태</th>
                <th className="px-6 py-4 text-center">결재 처리</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {requests.map((req) => (
                <tr key={req.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 font-bold text-gray-700">{req.name}</td>
                  <td className="px-6 py-4 text-gray-600">{req.type}</td>
                  <td className="px-6 py-4 text-gray-500 font-medium">{req.period} ({req.days}일)</td>
                  <td className="px-6 py-4 text-gray-500 italic">"{req.reason}"</td>
                  <td className="px-6 py-4 text-center text-gray-400">{req.applyDate}</td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                      req.status === '승인' ? 'bg-emerald-50 text-emerald-600' : 
                      req.status === '반려' ? 'bg-red-50 text-red-600' : 'bg-orange-50 text-orange-600'
                    }`}>
                      {req.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    {req.status === '대기중' ? (
                      <div className="flex justify-center gap-2">
                        <button onClick={() => handleApprove(req.id)} className="px-3 py-1.5 bg-emerald-500 text-white text-xs rounded-md font-bold hover:bg-emerald-600 shadow-sm transition-colors">승인</button>
                        <button onClick={() => openRejectModal(req)} className="px-3 py-1.5 bg-red-500 text-white text-xs rounded-md font-bold hover:bg-red-600 shadow-sm transition-colors">반려</button>
                      </div>
                    ) : (
                      <span className="text-gray-400 text-[11px] font-medium">
                        {req.status === '반려' ? `반려: ${req.rejectReason}` : '결재 완료'}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </main>
      {/* --- 반려 사유 입력 모달 --- */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex justify-between items-center p-5 border-b border-gray-100">
              <div className="flex items-center gap-2 font-bold text-gray-800">
                <X size={20} className="text-red-500" /> 연차 반려 사유
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            
            <div className="p-6">
              <p className="text-sm text-gray-600 mb-4 font-medium">
                <span className="text-blue-700 font-bold">{selectedRequest?.name}</span>님의 연차 신청을 반려합니다. 반려 사유를 입력해주세요.
              </p>
              
              <label className="text-xs font-bold text-gray-500 block mb-2">반려 사유 *</label>
              <textarea 
                className="w-full h-32 p-4 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all resize-none"
                placeholder="반려 사유를 구체적으로 입력하세요&#13;&#10;(예: 해당 기간 중요 마감 일정 있음)"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
              />
            </div>

            <div className="flex gap-2 p-6 pt-0">
              <button onClick={() => setIsModalOpen(false)} className="flex-1 py-3 bg-gray-100 text-gray-600 rounded-xl font-bold hover:bg-gray-200 transition-colors">취소</button>
              <button onClick={handleRejectSubmit} className="flex-1 py-3 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 transition-colors flex items-center justify-center gap-2">
                <X size={18} /> 반려 처리
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const StatusCard = ({ title, count, icon, color }) => (
  <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-start gap-5 hover:shadow-md transition-shadow">
    <div className={`text-3xl ${color || 'text-gray-300'}`}>{icon}</div>
    <div>
      <p className="text-3xl font-black text-gray-900 tracking-tighter mb-1">{count}</p>
      <p className="text-sm font-medium text-gray-500">{title}</p>
    </div>
  </div>
);

const AdminNavItem = ({ icon, label, active, badge, isFolder, onClick }) => (
  <div onClick={onClick} className={`flex items-center justify-between p-2.5 rounded-lg cursor-pointer transition-all duration-200 ${
    active ? 'bg-blue-50 text-blue-700 font-bold shadow-sm' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'
  }`}>
    <div className="flex items-center gap-3">{icon} <span className="text-sm">{label}</span></div>
    {badge && <span className="bg-red-500 text-white text-[9px] px-1.5 py-0.5 rounded-full font-black">{badge}</span>}
    {isFolder && <span className="text-gray-300 text-[10px]">▼</span>}
  </div>
);

export default LeaveApprovalPage;