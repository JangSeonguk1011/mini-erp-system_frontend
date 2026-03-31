import React, { useState } from 'react';
//import { leaveApi } from '../../api/leaveApi';

const LeaveApplyForm = ({ remainingBalance = 15 }) => {

    // 1. [상태 관리] 입력 폼 데이터만 상태로 관리합니다.
    const [formData, setFormData] = useState({
        leaveType: 'ANNUAL',
        startDate: '',
        endDate: '',
        reason: ''
    });

    // 2. [비즈니스 로직] 사용 일수 계산 (주말 제외)
    const calculateUsedDays = () => {
        const { startDate, endDate, leaveType } = formData;
        if (!startDate || !endDate) return 0;

        // 반차 계열은 무조건 0.5일 (설계서 3.5.3 반영)
        if (leaveType.includes('HALF')) return 0.5;

        let start = new Date(startDate);
        let end = new Date(endDate);
        let count = 0;

        // 시작일부터 종료일까지 반복하며 평일만 카운트
        const current = new Date(start);
        while (current <= end) {
            const day = current.getDay();
            if (day !== 0 && day !== 6) { // 0: 일요일, 6: 토요일 제외
                count++;
            }
            current.setDate(current.getDate() + 1);
        }
        return count;
    };

    const calculatedDays = calculateUsedDays();
    const isBalanceExceeded = calculatedDays > remainingBalance;

    // 3. [핸들러] 입력값 변경 및 주말 선택 차단 
    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name === 'startDate' || name === 'endDate') {
            const day = new Date(value).getDay();
            if (day === 0 || day === 6) {
                alert("⚠️ 주말(토/일)은 선택할 수 없습니다.");
                return; // 상태 업데이트를 하지 않고 종료
            }
        }

        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // 4. [제출] 1차/2차 검증 후 API 호출 
    // 백엔드 전 
    // const handleSubmit = async (e) => {
    //     e.preventDefault();

    //     // 1차 검증: 잔여 연차 확인
    //     if (isBalanceExceeded) {
    //         alert("❌ 잔여 연차가 부족하여 신청할 수 없습니다.");
    //         return;
    //     }

    //     if (!formData.startDate || !formData.endDate) {
    //         alert("❌ 기간을 선택해주세요.");
    //         return;
    //     }

    //     try {
    //         const response = await leaveApi.createRequest(formData);
    //         if (response.success) {
    //             alert("✅ 연차 신청이 정상적으로 완료되었습니다.");
    //             navigate('/leaves/me'); // 성공 시 내역 페이지로 이동
    //         }
    //     } catch (error) {
    //         // 서버 검증 실패 메시지 표시 (예: LEAVE_DATE_NOT_WORKING_DAY)
    //         alert(`⚠️ 신청 실패: ${error.message}`);
    //     }
    // };

    // 4. [제출] 로컬 스토리지 저장 및 페이지 이동
    const handleSubmit = async (e) => {
        e.preventDefault();

        // 1차 검증: 잔여 연차 확인
        if (isBalanceExceeded) {
            alert("❌ 잔여 연차가 부족하여 신청할 수 없습니다.");
            return;
        }

        if (!formData.startDate || !formData.endDate) {
            alert("❌ 기간을 선택해주세요.");
            return;
        }

        // --- [테스트용 LocalStorage 로직 시작] ---
        try {
            //const requestId = Date.now(); 
            const now = new Date();
            const todayStr = now.toISOString().split('T')[0].replace(/-/g, '.');

            const newRequest = {
                id: new Date().getTime(),
                requestDate: todayStr, 
                leaveType: formData.leaveType === 'ANNUAL' ? '연차' : 
                            formData.leaveType === 'LONG_ANNUAL' ? '연속연차' :
                            formData.leaveType === 'HALF_MORNING' ? '오전반차' : '오후반차',
                startDate: formData.startDate.replace(/-/g, '.'),
                endDate: formData.endDate.replace(/-/g, '.'),
                usedDays: calculatedDays,
                reason: formData.reason || '개인 사유',
                status: '대기중'
            };

            // 2. 로컬 스토리지 저장 로직
            const existingHistory = JSON.parse(localStorage.getItem('leaveHistory') || '[]');

            // 중복 체크 
            const newStart = new Date(formData.startDate);
            const newEnd = new Date(formData.endDate);

            const isOverlapped = existingHistory.some(item => {
                // 반려된 연차는 무시 
                if (item.status === '반려') return false;

                // 저장된 날짜 포맷(2026.03.31)을 다시 Date 객체로 변환
                const existStart = new Date(item.startDate.replace(/\./g, '-'));
                const existEnd = new Date(item.endDate.replace(/\./g, '-'));

                // 날짜 겹침 공식 (새 시작일 <= 기존 종료일) AND (새 종료일 >= 기존 시작일)
                return newStart <= existEnd && newEnd >= existStart;
            });

            if (isOverlapped) {
                alert("⚠️ 선택한 기간에 이미 신청된 연차가 있습니다.\n날짜를 다시 확인해주세요.");
                return; // ❌ 저장을 하지 않고 여기서 함수를 종료합니다.
            }

            const updatedHistory = [newRequest, ...existingHistory];
            localStorage.setItem('leaveHistory', JSON.stringify(updatedHistory));

            alert("✅ 연차 신청이 정상적으로 완료되었습니다.");
            setFormData({
            leaveType: 'ANNUAL',
            startDate: '',
            endDate: '',
            reason: ''
            });

        } catch (err) {
            // ✅ 'error' is defined but never used 해결: 매개변수 이름을 'err'로 바꾸거나 
            // 아래처럼 실제로 사용해주면 됩니다.
            console.error("신청 중 에러 발생:", err); 
            alert(`⚠️ 신청 처리 중 오류가 발생했습니다.`);
        }
    // --- [테스트용 로직 끝] ---
    };


    return (
        <div style={styles.card}>
            <h3 style={styles.title}>📝 연차 신청서</h3>
            <form onSubmit={handleSubmit}>
                {/* 연차 유형 */}
                <div style={styles.inputGroup}>
                    <label style={styles.label}>연차 유형 *</label>
                    <select name="leaveType" value={formData.leaveType} onChange={handleChange} style={styles.select}>
                        <option value="ANNUAL">연차 (1일)</option>
                        <option value="LONG_ANNUAL">연속 연차 (2일 이상)</option>
                        <option value="HALF_MORNING">오전 반차 (0.5일)</option>
                        <option value="HALF_AFTERNOON">오후 반차 (0.5일)</option>
                    </select>
                </div>

                {/* 기간 선택 */}
                <div style={styles.row}>
                    <div style={{ flex: 1 }}>
                        <label style={styles.label}>시작일 *</label>
                        <input type="date" name="startDate" value={formData.startDate} onChange={handleChange} style={styles.input} />
                    </div>
                    <div style={{ flex: 1 }}>
                        <label style={styles.label}>종료일 *</label>
                        <input type="date" name="endDate" value={formData.endDate} onChange={handleChange} style={styles.input} />
                    </div>
                </div>

                <div style={styles.inputGroup}>
                    <label style={styles.label}>신청 사유</label>
                    <textarea name="reason" value={formData.reason} onChange={handleChange} style={styles.textarea} placeholder="사유를 입력하세요 (선택)" />
                </div>

                {/* [3.5.3] LeaveDaysPreview (사용 일수 미리보기) */}
                {calculatedDays > 0 && (
                    <div style={styles.previewBox}>
                    <span style={styles.previewLabel}>차감 예정 연차</span>
                    <div style={styles.previewContent}>
                        <strong>{calculatedDays.toFixed(1)}일 차감</strong>
                        <span style={styles.arrow}>→</span>
                        <span>잔여 <strong style={{color: '#254EDB'}}>{(remainingBalance - calculatedDays).toFixed(1)}일</strong></span>
                    </div>
                </div>
                )}


                {/* [3.5.4] 버튼 비활성화 로직 */}
                <button 
                type="submit" 
                disabled={isBalanceExceeded || calculatedDays === 0}
                style={{
                    ...styles.button, 
                    backgroundColor: (isBalanceExceeded || calculatedDays === 0) ? '#ccc' : '#254EDB',
                    marginTop: calculatedDays > 0 ? '10px' : '20px' // 박스가 있을 때 간격 조절
                }}
                >
                연차 신청하기
                </button>
            </form>
        </div>
    );
};

const styles = {
    card: { backgroundColor: 'white', padding: '15px 25px 25px 25px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', height: '100%', 
        boxSizing: 'border-box', display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between'},
    title: { fontSize: '18px', marginBottom: '20px', fontWeight: 'bold' },
    inputGroup: { marginBottom: '15px' },
    row: { display: 'flex', gap: '15px', marginBottom: '15px' },
    label: { display: 'block', fontSize: '14px', color: '#666', marginBottom: '8px' },
    select: { width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd', outline: 'none' },
    input: { width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd', outline: 'none', boxSizing: 'border-box' },
    textarea: { width: '100%', height: '80px', padding: '10px', borderRadius: '6px', border: '1px solid #ddd', outline: 'none', resize: 'none', boxSizing: 'border-box' },
    previewBadge: { padding: '15px', borderRadius: '8px', marginBottom: '20px', fontSize: '14px', border: '1px solid #e6f7ff' },
    button: { width: '100%', padding: '14px', color: 'white', border: 'none', borderRadius: '6px', fontSize: '16px', fontWeight: 'bold', transition: '0.3s' },
    previewBox: {
        backgroundColor: '#f0f4ff',
        padding: '15px 20px',
        borderRadius: '8px',
        marginBottom: '20px',
        border: '1px solid #d6e4ff'
    },
    previewLabel: {
        display: 'block',
        fontSize: '12px',
        color: '#888',
        marginBottom: '5px'
    },
    previewContent: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        fontSize: '16px',
        color: '#333'
    },
    arrow: {
        color: '#aaa',
        fontWeight: 'bold'
    }
};

export default LeaveApplyForm;