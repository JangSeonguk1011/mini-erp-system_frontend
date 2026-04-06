import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '@/api/axios'; 
import { Building, User, Mail, Lock, Eye, EyeOff, UserPlus, Briefcase, Users, CheckCircle2 } from 'lucide-react';

export default function SignupPage() {
  const navigate = useNavigate();
  
  // 1. 폼 데이터 상태 관리
  const [formData, setFormData] = useState({
    userName: '',
    rank: '',
    userId: '', 
    email: '',
    password: '',
    confirmPassword: '',
    department: '', 
  });

  const [showPassword, setShowPassword] = useState(false);

  // 2. 비밀번호 유효성 상세 상태 관리 (대/소문자/숫자/특수문자/길이)
  const [passwordValid, setPasswordValid] = useState({
    isLengthValid: false, // 8자 이상 20자 이하
    hasUpperCase: false,  // 영어 대문자 포함
    hasLowerCase: false,  // 영어 소문자 포함
    hasNumber: false,     // 숫자 포함
    hasSpecial: false,    // 특수문자 포함
    isMatch: false        // 비밀번호 확인 일치 여부
  });

  const [isEmailValid, setIsEmailValid] = useState(false);

  /**
   * 입력값 변경 및 실시간 유효성 검사 핸들러
   */
  const handleChange = (e) => {
    const { id, value } = e.target;
    
    setFormData(prev => {
      const newData = { ...prev, [id]: value };
      
      // 이메일 형식 체크 (RegEx)
      if (id === 'email') {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        setIsEmailValid(emailRegex.test(value));
      }

      // 비밀번호 복합 조건 체크 (대문자, 소문자, 숫자, 특수문자, 8~20자)
      if (id === 'password' || id === 'confirmPassword') {
        const pw = newData.password;
        setPasswordValid({
          isLengthValid: pw.length >= 8 && pw.length <= 20,
          hasUpperCase: /[A-Z]/.test(pw),
          hasLowerCase: /[a-z]/.test(pw),
          hasNumber: /[0-9]/.test(pw),
          hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(pw),
          isMatch: pw === newData.confirmPassword && newData.confirmPassword !== ''
        });
      }
      return newData;
    });
  };

  /**
   * 모든 조건이 충족되었는지 확인 (버튼 활성화 기준)
   */
  const isFormValid = 
    formData.userId && 
    formData.userName && 
    formData.rank && 
    formData.department && //
    isEmailValid && 
    passwordValid.isLengthValid &&
    passwordValid.hasUpperCase &&
    passwordValid.hasLowerCase &&
    passwordValid.hasNumber &&
    passwordValid.hasSpecial &&
    passwordValid.isMatch;

  /**
 * 회원가입 제출 처리
 */
const handleSignup = async (e) => {
  e.preventDefault();
  
  if (!isFormValid) {
    alert("비밀번호 정책을 다시 확인해주세요.");
    return;
  }

  try {
    const response = await api.post('/auth/signup', {
      id: formData.userId,
      name: formData.userName,
      email: formData.email,
      password: formData.password,
      position: formData.rank,
      // [수정] 백엔드 DTO 필드명인 departmentCode와 일치시킵니다!
      departmentCode: formData.department 
    });

    if (response.data.success) {
      alert("회원가입이 완료되었습니다!");
      navigate('/login');
    }
  } catch (error) {
    // 에러 메시지 추출 로직 개선 (대리님 에러 구조 반영)
    const errorMsg = error.response?.data?.error?.message || 
                     error.response?.data?.message || 
                     "서버 통신 중 에러가 발생했습니다.";
    alert(errorMsg);
    console.error("Signup Error:", error.response?.data);
  }
};
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6 py-12">
      <div className="bg-white p-10 rounded-3xl shadow-lg w-full max-w-[500px]">
        
        {/* 상단 로고 영역 */}
        <div className="flex flex-col items-center mb-8 text-center">
          <div className="bg-blue-100 p-3 rounded-2xl mb-4">
            <Building className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-950 mb-1">WorkFlow</h1>
          <p className="text-sm text-gray-500">새 계정을 만들어 업무를 시작하세요</p>
        </div>

        {/* 로그인/회원가입 전환 탭 */}
        <div className="flex border border-gray-200 rounded-full p-1 bg-gray-50 mb-8">
          <button 
            type="button" 
            onClick={() => navigate('/login')} 
            className="flex-1 text-center text-sm font-medium py-3 px-6 text-gray-500"
          >
            로그인
          </button>
          <button 
            type="button" 
            className="flex-1 text-center text-sm font-semibold py-3 px-6 rounded-full bg-white text-blue-600 shadow-sm"
          >
            회원가입
          </button>
        </div>

        <form onSubmit={handleSignup} className="space-y-5">
          
          {/* 아이디 입력 */}
          <div className="space-y-1.5">
            <label className="text-sm text-gray-700 font-bold">아이디 *</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input 
                id="userId" 
                type="text" 
                onChange={handleChange} 
                placeholder="영문/숫자 조합 아이디" 
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-400" 
                required 
              />
            </div>
          </div>

          {/* 이름 & 직급 그리드 */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm text-gray-700 font-bold">이름 *</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input 
                  id="userName" 
                  type="text" 
                  onChange={handleChange} 
                  placeholder="이름" 
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-400" 
                  required 
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm text-gray-700 font-bold">직급 *</label>
              <div className="relative">
                <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <select 
                  id="rank" 
                  onChange={handleChange} 
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-400 appearance-none" 
                  required
                >
                  <option value="">선택</option>
                  <option value="사원">사원</option>
                  <option value="대리">대리</option>
                  <option value="과장">과장</option>
                  <option value="팀장">팀장</option>
                </select>
              </div>
            </div>
          </div>

          {/* 이메일 입력 */}
          <div className="space-y-1.5">
            <label className="text-sm text-gray-700 font-bold">이메일 *</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input 
                id="email" 
                type="email" 
                onChange={handleChange} 
                placeholder="company@email.com" 
                className={`w-full pl-10 pr-4 py-2.5 bg-gray-50 border ${formData.email ? (isEmailValid ? 'border-green-500' : 'border-red-400') : 'border-gray-200'} rounded-xl text-sm outline-none focus:border-blue-400 transition-all`} 
                required 
              />
            </div>
            {formData.email && !isEmailValid && (
              <p className="text-[10px] text-red-500 px-1 font-medium">올바른 이메일 형식이 아닙니다.</p>
            )}
          </div>

          {/* 비밀번호 & 확인 그리드 */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm text-gray-700 font-bold">비밀번호 *</label>
              <div className="relative">
                <input 
                  id="password" 
                  type={showPassword ? "text" : "password"} 
                  onChange={handleChange} 
                  placeholder="8~20자 입력" 
                  className={`w-full px-4 py-2.5 bg-gray-50 border ${passwordValid.isLengthValid && passwordValid.hasNumber ? 'border-green-500' : 'border-gray-200'} rounded-xl text-sm outline-none focus:border-blue-400 transition-all`} 
                  required 
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)} 
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm text-gray-700 font-bold">비밀번호 확인 *</label>
              <input 
                id="confirmPassword" 
                type={showPassword ? "text" : "password"} 
                onChange={handleChange} 
                placeholder="재입력" 
                className={`w-full px-4 py-2.5 bg-gray-50 border ${formData.confirmPassword ? (passwordValid.isMatch ? 'border-green-500' : 'border-red-500') : 'border-gray-200'} rounded-xl text-sm outline-none focus:border-blue-400 transition-all`} 
                required 
              />
            </div>
          </div>

          {/* 비밀번호 유효성 실시간 가이드 */}
          <div className="px-1 py-2 bg-blue-50/50 rounded-xl space-y-1">
            <p className="text-[10px] font-bold text-blue-600 px-1 mb-1 italic">비밀번호 보안 정책 (필수):</p>
            <div className="grid grid-cols-2 gap-x-2 gap-y-1">
              <PolicyItem label="8~20자 이내" isDone={passwordValid.isLengthValid} />
              <PolicyItem label="대문자 포함" isDone={passwordValid.hasUpperCase} />
              <PolicyItem label="소문자 포함" isDone={passwordValid.hasLowerCase} />
              <PolicyItem label="숫자 포함" isDone={passwordValid.hasNumber} />
              <PolicyItem label="특수문자 포함" isDone={passwordValid.hasSpecial} />
              <PolicyItem label="비밀번호 일치" isDone={passwordValid.isMatch} />
            </div>
          </div>

          {/* 부서 입력 */}
          <div className="space-y-1.5">
            <label className="text-sm text-gray-700 font-bold">부서</label>
            <div className="relative">
              <Users className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <select 
                id="department"      // 👈 handleChange가 이 id를 보고 formData.department에 저장합니다.
                name="department" 
                value={formData.department} // 👈 상태와 동기화
                onChange={handleChange} 
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-400 appearance-none"
              >
                <option value="">부서 선택</option>
                <option value="01">개발팀</option>
                <option value="02">유지보수팀</option>
                <option value="03">모바일개발팀</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-400">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
              </div>
            </div>
          </div>

          {/* 회원가입 제출 버튼 */}
          <button 
            type="submit" 
            disabled={!isFormValid}
            className={`w-full py-3.5 ${isFormValid ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-100' : 'bg-blue-300 cursor-not-allowed'} text-white font-semibold rounded-xl text-sm transition-all flex items-center justify-center gap-2 shadow-lg`}
          >
            <UserPlus className="w-5 h-5" />
            회원가입
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-gray-500">
          이미 계정이 있으신가요?{" "}
          <button 
            onClick={() => navigate('/login')} 
            className="text-blue-600 hover:underline font-medium"
          >
            로그인하러 가기
          </button>
        </p>
      </div>
    </div>
  ); 
}

/**
 * 비밀번호 정책 체크용 내부 컴포넌트
 */
const PolicyItem = ({ label, isDone }) => (
  <div className="flex items-center gap-1.5 px-1">
    <CheckCircle2 size={12} className={isDone ? 'text-green-500' : 'text-gray-300'} />
    <span className={`text-[10px] ${isDone ? 'text-green-600 font-bold' : 'text-gray-400'}`}>{label}</span>
  </div>
);