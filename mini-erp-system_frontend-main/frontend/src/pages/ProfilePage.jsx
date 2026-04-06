
import React, { useState, useEffect } from 'react';
import { X, User, Lock, CheckCircle2, Eye, EyeOff, ShieldCheck, Key, Mail } from 'lucide-react';
import axios from '@/api/axios';

const ProfilePage = ({ isOpen, onClose, user: initialUser }) => {
  const [mode, setMode] = useState('profile');
  const [step, setStep] = useState(1);
  const [showPw, setShowPw] = useState(false);
  const [formData, setFormData] = useState({ 
    authCode: '', 
    newPassword: '', 
    confirmPassword: '',
    resetProof: '' 
  });
  
  const [serverUser, setServerUser] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      const id = initialUser?.id || initialUser?.userId;
      if (isOpen && id) {
        try {
          const response = await axios.get(`/users/${id}`);
          setServerUser(response.data);
        } catch (error) {
          console.error("❌ 상세조회 실패:", error);
        }
      }
    };
    fetchUserData();
  }, [isOpen, initialUser]);

  if (!isOpen) return null;

  const d = serverUser?.data || serverUser || initialUser || {};

  const displayInfo = {
    name: d.name || "이름 미확인",
    // [수정] FindIdPage처럼 loginId 또는 userId를 우선적으로 가져옵니다.
    // 서버 데이터(d.loginId)가 없으면 로컬 스토리지에서 가져오기
    id: d.loginId || localStorage.getItem('userLoginId') || d.userId || "ID 미확인",
    email: d.email || "이메일 미확인",
    // [추가] 직급 데이터
    position: d.position || "직급 미확인",
    dept: d.departmentName || d.department || d.departmentCode || "소속 부서 미지정",
    leave: d.remainingAnnualLeave ?? 15
  };

  const handleClose = () => {
    setMode('profile');
    setStep(1);
    setFormData({ authCode: '', newPassword: '', confirmPassword: '', resetProof: '' });
    onClose();
  };

  const handleRequestAuth = async () => {
    try {
      const response = await axios.post('/auth/password/reset/request', { email: displayInfo.email });
      if (response.data.success) {
        alert("인증번호가 발송되었습니다.");
        setStep(2);
      }
    } catch (error) {
      alert(error.response?.data?.message || "발송 실패");
    }
  };

  const handleVerifyCode = async () => {
    try {
      const response = await axios.post('/auth/password/reset/verify', { 
        email: displayInfo.email, 
        verificationCode: formData.authCode 
      });
      if (response.data.success) {
        setFormData(prev => ({ ...prev, resetProof: response.data.data.resetProof }));
        setStep(3);
      }
    } catch (error) {
      alert("인증번호가 올바르지 않습니다.");
    }
  };

  const handleConfirmReset = async () => {
    if (formData.newPassword !== formData.confirmPassword) {
      return alert("비밀번호가 일치하지 않습니다.");
    }
    try {
      const response = await axios.post('/auth/password/reset/confirm', {
        resetProof: formData.resetProof,
        newPassword: formData.newPassword,
        newPasswordConfirm: formData.confirmPassword
      });
      if (response.data.success) {
        setStep(4);
      }
    } catch (error) {
      alert(error.response?.data?.message || "변경 실패");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 text-gray-900">
      <div className="bg-white w-full max-w-sm rounded-[32px] shadow-2xl overflow-hidden transition-all">
        
        <div className="flex justify-between items-center p-6 pb-2">
          <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            {mode === 'profile' ? <><User size={20} className="text-blue-600" /> 내 프로필</> : <><Key size={20} className="text-blue-600" /> 비밀번호 변경</>}
          </h3>
          <button onClick={handleClose} className="p-1 hover:bg-gray-100 rounded-full text-gray-400">
            <X size={24} />
          </button>
        </div>

        {mode === 'profile' && (
          <>
            <div className="flex flex-col items-center py-6">
              <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center text-white text-3xl font-black shadow-lg mb-3">
                {displayInfo.name.charAt(0)}
              </div>
              <h4 className="text-xl font-extrabold text-gray-800">{displayInfo.name}</h4>
              {/* [수정] 부서 대신 직급(Position)을 뱃지에 표시 */}
              <p className="text-sm text-blue-600 font-bold bg-blue-50 px-3 py-1 rounded-full mt-1">
                {displayInfo.position}
              </p>
            </div>
            
            <div className="px-6 space-y-2 pb-8">
              <InfoItem label="아이디" value={displayInfo.id} />
              <InfoItem label="이메일" value={displayInfo.email} />             
              <InfoItem label="소속 부서" value={displayInfo.dept} />
              <InfoItem label="잔여 연차" value={`${displayInfo.leave}일`} highlight />
            </div>

            <div className="flex gap-2 p-6 pt-0">
              <button onClick={handleClose} className="flex-1 py-3.5 bg-gray-100 text-gray-600 font-bold rounded-2xl text-sm transition-all hover:bg-gray-200">닫기</button>
              <button onClick={() => setMode('changePw')} className="flex-[2] py-3.5 bg-blue-600 text-white font-bold rounded-2xl shadow-lg text-sm transition-all hover:bg-blue-700">비밀번호 변경</button>
            </div>
          </>
        )}

        {mode === 'changePw' && (
          <div className="p-6 pt-2 space-y-5">
            {step === 1 && (
              <div className="space-y-6 text-center">
                <div className="py-4"><Mail size={48} className="mx-auto text-blue-100" /></div>
                <p className="text-sm text-gray-500 leading-relaxed">보안을 위해 <b>{displayInfo.email}</b>로<br/>인증번호를 발송합니다.</p>
                <button onClick={handleRequestAuth} className="w-full py-3.5 bg-blue-600 text-white font-bold rounded-2xl text-sm shadow-lg hover:bg-blue-700 transition-all">인증번호 발송</button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <p className="text-xs text-gray-500 text-center font-medium">이메일로 발송된 6자리 번호를 입력하세요.</p>
                <input 
                  type="text" 
                  value={formData.authCode} 
                  onChange={(e) => setFormData({...formData, authCode: e.target.value})}
                  className="w-full py-3 bg-gray-50 border border-gray-200 rounded-xl text-center text-lg font-bold tracking-widest outline-none focus:border-blue-400" 
                  placeholder="000000" 
                />
                <button onClick={handleVerifyCode} className="w-full py-3.5 bg-blue-600 text-white font-bold rounded-2xl text-sm shadow-lg hover:bg-blue-700 transition-all">인증 확인</button>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4">
                <div className="space-y-3">
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input 
                      type={showPw ? "text" : "password"} 
                      value={formData.newPassword}
                      onChange={(e) => setFormData({...formData, newPassword: e.target.value})}
                      className="w-full pl-10 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-400" 
                      placeholder="새 비밀번호" 
                    />
                    <button onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                      {showPw ? <EyeOff size={16}/> : <Eye size={16}/>}
                    </button>
                  </div>
                  <input 
                    type={showPw ? "text" : "password"} 
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-400" 
                    placeholder="비밀번호 확인" 
                  />
                </div>
                <button onClick={handleConfirmReset} className="w-full py-3.5 bg-blue-600 text-white font-bold rounded-2xl text-sm shadow-lg hover:bg-blue-700 transition-all">비밀번호 변경 완료</button>
              </div>
            )}

            {step === 4 && (
              <div className="py-6 text-center space-y-4">
                <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="text-green-500" size={32} />
                </div>
                <p className="text-gray-800 font-bold">비밀번호가 변경되었습니다.</p>
                <button onClick={handleClose} className="w-full py-3.5 bg-blue-600 text-white font-bold rounded-2xl text-sm shadow-lg">확인</button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const InfoItem = ({ label, value, highlight }) => (
  <div className="flex justify-between items-center bg-slate-50/80 p-4 rounded-2xl border border-gray-50 transition-all hover:bg-white hover:shadow-sm">
    <span className="text-xs text-gray-400 font-semibold">{label}</span>
    <span className={`text-sm font-bold ${highlight ? 'text-blue-600' : 'text-gray-700'}`}>{value}</span>
  </div>
);

export default ProfilePage;
