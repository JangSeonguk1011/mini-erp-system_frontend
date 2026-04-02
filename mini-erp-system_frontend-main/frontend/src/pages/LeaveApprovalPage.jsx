import { useState, useEffect } from 'react';
import api from '../api/axios'; 
import { X } from 'lucide-react';

const LeaveApprovalPage = () => {
  const [requests, setRequests] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  // 1. 데이터 로드: 경로에서 /api/v1을 제외함
  useEffect(() => {
    const fetchRequests = async () => {
      try {
        // Axios 설정에 baseURL이 이미 /api/v1이므로 /leave/all만 요청
        const response = await api.get('/leave/all'); 
        
        // 서버 응답의 data 필드 안의 실제 배열 데이터(data)를 추출
        if (response.data && response.data.success) {
          setRequests(response.data.data || []);
        }
      } catch (error) {
        console.error("데이터 로드 실패:", error);
      }
    };
    fetchRequests();
  }, []);

  // 상단 카운트
  const pendingCount = requests.filter(r => r.appStatus === 'PENDING').length;
  const approvedCount = requests.filter(r => r.appStatus === 'APPROVED').length;
  const rejectedCount = requests.filter(r => r.appStatus === 'REJECTED').length;

  const leaveTypeLabels = {
    'ANNUAL': '연차',
    'HALF_MORNING': '오전 반차',
    'HALF_AFTERNOON': '오후 반차'
  };

  const statusLabels = {
    'PENDING': '대기중',
    'APPROVED': '승인완료',
    'REJECTED': '반려'
  };

  // 2. 승인 처리: 경로 수정
  const handleApprove = async (appId) => {
    if (!window.confirm('승인하시겠습니까?')) return;
    try {
      const response = await api.patch(`/leave/${appId}/approve`);
      if (response.data.success) {
        setRequests(prev => prev.map(req => 
          req.appId === appId ? { ...req, appStatus: 'APPROVED' } : req
        ));
        alert('승인되었습니다.');
      }
    } catch (err) {
      alert('처리 중 오류가 발생했습니다.');
    }
  };

  // 3. 반려 처리: 경로 수정
  const handleRejectSubmit = async () => {
    if (!rejectReason.trim()) return alert('반려 사유를 입력하세요.');
    try {
      const appId = selectedRequest.appId;
      const response = await api.patch(`/leave/${appId}/reject`, { rejectReason: rejectReason});
      if (response.data.success) {
        setRequests(prev => prev.map(req => 
          req.appId === appId ? { ...req, appStatus: 'REJECTED', rejectReason } : req
        ));
        setIsModalOpen(false);
        setRejectReason('');
        alert('반려되었습니다.');
      }
    } catch (error) {
      alert('서버 통신 실패');
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <header className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800">연차 승인 / 반려</h2>
      </header>

      <div className="grid grid-cols-3 gap-6 mb-10">
        <div className="bg-white p-6 rounded-xl border flex items-center gap-4">
          <div className="text-2xl">⏳</div>
          <div><p className="text-2xl font-bold">{pendingCount}</p><p className="text-xs text-gray-400">대기 중</p></div>
        </div>
        <div className="bg-white p-6 rounded-xl border flex items-center gap-4">
          <div className="text-2xl text-emerald-500">✅</div>
          <div><p className="text-2xl font-bold">{approvedCount}</p><p className="text-xs text-gray-400">승인 완료</p></div>
        </div>
        <div className="bg-white p-6 rounded-xl border flex items-center gap-4">
          <div className="text-2xl text-red-500">❌</div>
          <div><p className="text-2xl font-bold">{rejectedCount}</p><p className="text-xs text-gray-400">반려됨</p></div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden border">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b">
            <tr className="text-xs text-gray-400 font-bold uppercase">
              <th className="px-6 py-4">신청자</th>
              <th className="px-6 py-4">유형</th>
              <th className="px-6 py-4">신청 기간</th>
              <th className="px-6 py-4">사유</th>
              <th className="px-6 py-4 text-center">신청일</th>
              <th className="px-6 py-4 text-center">상태</th>
              <th className="px-6 py-4 text-center">결재</th>
            </tr>
          </thead>
          <tbody className="text-sm divide-y">
            {requests && requests.length > 0 ? (requests.map((req) => (
              <tr key={req.appId} className="hover:bg-gray-50/50">
                <td className="px-6 py-4 font-bold text-gray-700">{req.requesterName}</td>
                <td className="px-6 py-4 text-gray-500">{leaveTypeLabels[req.appType] || req.appType}</td>
                <td className="px-6 py-4 text-gray-500 font-medium">{req.startDate} ~ {req.endDate} ({req.usedDays}일)</td>
                <td className="px-6 py-4 text-gray-500 italic">"{req.requestReason}"</td>
                <td className="px-6 py-4 text-center text-gray-400">{req.createdAt?.split('T')[0]}</td>
                <td className="px-6 py-4 text-center">
                  <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${
                    req.appStatus === 'APPROVED' ? 'bg-emerald-50 text-emerald-600' : 
                    req.appStatus === 'REJECTED' ? 'bg-red-50 text-red-600' : 'bg-orange-50 text-orange-600'
                  }`}>
                    {statusLabels[req.appStatus] || req.appStatus}
                  </span>
                </td>
                <td className="px-6 py-4 text-center">
                  {req.appStatus === 'PENDING' ? (
                    <div className="flex justify-center gap-2">
                      <button onClick={() => handleApprove(req.appId)} className="px-2 py-1 bg-emerald-500 text-white rounded text-xs hover:bg-emerald-600">승인</button>
                      <button onClick={() => { setSelectedRequest(req); setIsModalOpen(true); }} className="px-2 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600">반려</button>
                    </div>
                  ) : (
                    <span className="text-gray-400 text-xs">{req.appStatus === 'REJECTED' ? `반려: ${req.rejectReason || '사유 없음'}` : '결재 완료'}
                    </span>
                  )}
                </td>
              </tr>
            ))
          ) : (
              <tr><td colSpan="4" className="py-16 text-center text-gray-400">현재 대기 중인 연차 신청이 없습니다.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="font-bold text-lg mb-4 text-gray-800">반려 사유 입력</h3>
            <textarea 
              className="w-full h-32 p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none"
              placeholder="사유를 입력하세요..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
            />
            <div className="flex gap-2 mt-6">
              <button onClick={() => setIsModalOpen(false)} className="flex-1 py-2 bg-gray-100 text-gray-600 rounded-lg font-bold">취소</button>
              <button onClick={handleRejectSubmit} className="flex-1 py-2 bg-red-500 text-white rounded-lg font-bold hover:bg-red-600">반려 확정</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeaveApprovalPage;