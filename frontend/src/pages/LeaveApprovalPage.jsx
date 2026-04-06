import { useState, useEffect } from 'react';
import api from '../api/axios'; 
import { X } from 'lucide-react';
import { useAuthStore } from '../store/authStore'; // [수정] Zustand 스토어 연결 (일관성 유지)

const LeaveApprovalPage = () => {
  const [requests, setRequests] = useState([]); // 연차 데이터
  const [overtimes, setOvertimes] = useState([]); // 특근 데이터
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  // 1. [수정] Zustand 스토어에서 유저 정보 가져오기 (localStorage 직접 접근보다 안전)
  const { user } = useAuthStore();

  // 2. [추가] Sidebar와 동일한 권한 체크 로직 (관리소장/팀장 구분)
  const userRole = user?.role || '';
  const userPosition = user?.position || '';
  const isChief = userRole === 'ADMIN' || userPosition === '관리소장';

  // 3. 데이터 로드 및 권한별 데이터 필터링
  useEffect(() => {
    const fetchRequests = async () => {
      try {
        // [체크] 현재 접속 권한 로그 확인
        console.log("현재 접속 유저:", user?.userName, "권한:", userRole);

        // [수정] 관리소장(isChief) 여부에 따른 엔드포인트 설정
        const endpoint = isChief 
          ? '/leave/all' 
          : '/leave/all';

        const response = await api.get(endpoint); 
        
        if (response.data && response.data.success) {
          let rawData = response.data.data || [];
          let filteredData = [];
          
          if (isChief) {
            // [관리소장] 팀장(TEAM_LEADER)의 신청 내역만 필터링
            filteredData = rawData.filter(item => item.userRole === 'TEAM_LEADER');
            console.log("관리소장 모드: 팀장 신청 건만 표시", filteredData);
          } else {
            // [팀장] 일반사원(USER)의 신청 내역만 필터링, 팀장과 같은 팀인 사원것만 필터링 
            filteredData = rawData.filter(item => item.userRole === 'USER'
              && String(item.departmentCode) === String(user?.departmentCode)
            );
            console.log("팀장 모드: 사원 신청 건만 표시", filteredData);
          }
          
          setRequests(filteredData);
        }

        // 특근 
        const overtimeResponse = await api.get('/overtime/all');

        if (overtimeResponse.data && overtimeResponse.data.success) {
        let rawOvData = overtimeResponse.data.data || [];
        let filteredOvData = [];

        if (isChief) {
          // 관리소장은 팀장의 특근만
          filteredOvData = rawOvData.filter(item => item.userRole === 'TEAM_LEADER');
        } else {
          // 팀장은 자기 팀 사원의 특근만
          filteredOvData = rawOvData.filter(item => item.userRole === 'USER'
            && String(item.departmentCode) === String(user?.departmentCode)
          );
        }
        setOvertimes(filteredOvData);
      }
      } catch (error) {
        console.error("데이터 로드 중 오류:", error);
        setRequests([]);
        setOvertimes([]);
      }
    };
    
    // 유저 정보가 있을 때만 호출
    if (userRole) {
      fetchRequests();
    }
  }, [userRole, isChief]); // 의존성 배열에 권한 상태 추가

  // 상단 통계 카운트
  const pendingCount = requests.filter(r => r.appStatus === 'PENDING').length +
    overtimes.filter(r => r.status === 'PENDING').length;
  const approvedCount = requests.filter(r => r.appStatus === 'APPROVED').length +
    overtimes.filter(r => r.status === 'APPROVED').length;
  const rejectedCount = requests.filter(r => r.appStatus === 'REJECTED').length +
    overtimes.filter(r => r.status === 'REJECTED').length;

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

  const departmentLabels = {
    '01': '개발팀',
    '02': '유지보수팀',
    '03': '모바일개발팀'
  };

  // 연차 승인 처리
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

  // 연차 반려 처리
  const handleRejectSubmit = async () => {
    if (!rejectReason.trim()) return alert('반려 사유를 입력하세요.');
    try {
      const appId = selectedRequest.appId;
      const response = await api.patch(`/leave/${appId}/reject`, { rejectReason: rejectReason });
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

  // 특근 승인 처리 
  const handleOvertimeApprove = async (id) => {
    if (!window.confirm('특근을 승인하시겠습니까?')) return;
    try {
      const res = await api.patch(`/overtime/${id}/approve`);
      if (res.data.success) {
        setOvertimes(prev => prev.map(ov => ov.id === id ? { ...ov, status: 'APPROVED' } : ov));
        alert('특근이 승인되었습니다.');
      }
    } catch (err) { alert('처리 중 오류 발생'); }
  };

  // 특근 반려 처리 
  const handleOvertimeReject = async (id) => {
    if (!window.confirm('특근을 반려하시겠습니까?')) return;
    try {
      const res = await api.patch(`/overtime/${id}/reject`);
      if (res.data.success) {
        setOvertimes(prev => prev.map(ov => ov.id === id ? { ...ov, status: 'REJECTED' } : ov));
        alert('특근이 반려되었습니다.');
      }
    } catch (err) { alert('처리 중 오류 발생'); }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <header className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800">
          {/* [수정] 관리소장/팀장 문구 동적 변경 */}
          {isChief ? '팀장 연차 결재 관리 (관리소장)' : '사원 연차 결재 관리 (팀장)'}
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          {isChief 
            ? '각 팀의 팀장들이 신청한 연차를 최종 승인하거나 반려합니다.' 
            : '소속 팀원들이 신청한 연차를 1차 승인하거나 반려합니다.'}
        </p>
      </header>

      {/* 통계 카드 */}
      <div className="grid grid-cols-3 gap-6 mb-10">
        <div className="bg-white p-6 rounded-xl border flex items-center gap-4 shadow-sm">
          <div className="text-2xl font-bold">⏳</div>
          <div><p className="text-2xl font-bold">{pendingCount}</p><p className="text-xs text-gray-400 font-medium">승인 대기</p></div>
        </div>
        <div className="bg-white p-6 rounded-xl border flex items-center gap-4 shadow-sm">
          <div className="text-2xl text-emerald-500 font-bold">✅</div>
          <div><p className="text-2xl font-bold">{approvedCount}</p><p className="text-xs text-gray-400 font-medium">최종 승인</p></div>
        </div>
        <div className="bg-white p-6 rounded-xl border flex items-center gap-4 shadow-sm">
          <div className="text-2xl text-red-500 font-bold">❌</div>
          <div><p className="text-2xl font-bold">{rejectedCount}</p><p className="text-xs text-gray-400 font-medium">반려 내역</p></div>
        </div>
      </div>

      {/* 리스트 테이블 */}
      <h3 className="text-lg font-bold mb-4 text-gray-700">연차 신청 목록</h3>
      <div className="bg-white rounded-xl shadow-sm overflow-hidden border">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b">
            <tr className="text-xs text-gray-400 font-bold uppercase">
              <th className="px-6 py-4">신청자</th>
              <th className="px-6 py-4">부서</th>
              <th className="px-6 py-4">유형</th>
              <th className="px-6 py-4">신청 기간</th>
              <th className="px-6 py-4">사유</th>
              <th className="px-6 py-4 text-center">신청일</th>
              <th className="px-6 py-4 text-center">상태</th>
              <th className="px-6 py-4 text-center">결재</th>
            </tr>
          </thead>
          <tbody className="text-sm divide-y">
            {requests.length > 0 ? (
              requests.map((req) => (
                <tr key={req.appId} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-bold text-gray-700">{req.requesterName}</div>
                    <div className={`text-[10px] px-1.5 py-0.5 rounded inline-block font-medium ${
                      req.userRole === 'TEAM_LEADER' ? 'bg-purple-50 text-purple-600' : 'bg-blue-50 text-blue-600'
                    }`}>
                      {req.userRole === 'TEAM_LEADER' ? '팀장' : '사원'}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-500">{departmentLabels[req.departmentCode] || '소속없음'}</td>
                  <td className="px-6 py-4 text-gray-500">{leaveTypeLabels[req.appType] || req.appType}</td>
                  <td className="px-6 py-4 text-gray-500 font-medium">
                    {req.startDate} ~ {req.endDate} <span className="text-xs text-gray-400">({req.usedDays}일)</span>
                  </td>
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
                        <button onClick={() => handleApprove(req.appId)} className="px-2 py-1 bg-emerald-500 text-white rounded text-xs hover:bg-emerald-600 transition-colors">승인</button>
                        <button onClick={() => { setSelectedRequest(req); setIsModalOpen(true); }} className="px-2 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600 transition-colors">반려</button>
                      </div>
                    ) : (
                      <div className="text-gray-400 text-xs">
                        {req.appStatus === 'REJECTED' ? `사유: ${req.rejectReason || '없음'}` : '처리 완료'}
                      </div>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="py-24 text-center">
                  <div className="text-gray-300 text-4xl mb-2">📋</div>
                  <div className="text-gray-400">결재 대기 중인 내역이 없습니다.</div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* 특근 테이블 추가 */}
      <div className="mt-12">
      <h3 className="text-lg font-bold mb-4 text-gray-700">특근 신청 목록</h3>
      <div className="bg-white rounded-xl shadow-sm overflow-hidden border">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b">
            <tr className="text-xs text-gray-400 font-bold uppercase">
              <th className="px-6 py-4">신청자</th>
              <th className="px-6 py-4">부서</th>
              <th className="px-6 py-4">특근 일자</th>
              <th className="px-6 py-4">시간</th>
              <th className="px-6 py-4">사유</th>
              <th className="px-6 py-4">신청일</th>
              <th className="px-6 py-4 text-center">상태</th>
              <th className="px-6 py-4 text-center">결재</th>
            </tr>
          </thead>
          <tbody className="text-sm divide-y">
            {overtimes.length > 0 ? (
              overtimes.map((ov) => (
                <tr key={ov.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-bold text-gray-700">{ov.requesterName}</div>
                    <div className={`text-[10px] px-1.5 py-0.5 rounded inline-block font-medium ${
                      ov.userRole === 'TEAM_LEADER' ? 'bg-purple-50 text-purple-600' : 'bg-blue-50 text-blue-600'
                    }`}>
                      {ov.userRole === 'TEAM_LEADER' ? '팀장' : '사원'}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-500">{departmentLabels[ov.departmentCode] || '소속없음'}</td>
                  <td className="px-6 py-4 text-gray-500">{ov.overtimeDate}</td>
                  <td className="px-6 py-4 text-gray-500">{ov.startTime.slice(0,5)} ~ {ov.endTime.slice(0,5)}</td>
                  <td className="px-6 py-4 text-gray-500 italic">"{ov.reason}"</td>
                  <td className="px-6 py-4 text-gray-400">{ov.createdAt?.split('T')[0]}</td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${
                      ov.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-600' : 
                      ov.status === 'REJECTED' ? 'bg-red-50 text-red-600' : 'bg-orange-50 text-orange-600'
                    }`}>
                      {statusLabels[ov.status] || ov.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    {ov.status === 'PENDING' ? (
                      <div className="flex justify-center gap-2">
                        <button onClick={() => handleOvertimeApprove(ov.id)} className="px-2 py-1 bg-emerald-500 text-white rounded text-xs hover:bg-emerald-600 transition-colors">승인</button>
                        <button onClick={() => handleOvertimeReject(ov.id)} className="px-2 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600 transition-colors">반려</button>
                      </div>
                    ) : <div className="text-gray-400 text-xs">처리 완료</div>}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="py-24 text-center">
                  <div className="text-gray-300 text-4xl mb-2">📋</div>
                  <div className="text-gray-400">결재 대기 중인 내역이 없습니다.</div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      </div>

      {/* 반려 사유 입력 모달 */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg text-gray-800">반려 사유 입력</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors"><X size={20}/></button>
            </div>
            <textarea 
              className="w-full h-32 p-4 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none transition-all resize-none"
              placeholder="반려 사유를 입력하세요 (사원에게 전달됩니다)..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
            />
            <div className="flex gap-3 mt-6">
              <button onClick={() => setIsModalOpen(false)} className="flex-1 py-3 bg-gray-100 text-gray-600 rounded-xl font-bold hover:bg-gray-200 transition-colors">취소</button>
              <button onClick={handleRejectSubmit} className="flex-1 py-3 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 transition-colors">반려 확정</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeaveApprovalPage;