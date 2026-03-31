import React, { useEffect, useState } from 'react';
//import { leaveApi } from '../../api/leaveApi';

const LeaveBalanceCard = () => {
    const [balance, setBalance] = useState({
        totalAnnualLeave: 0,     // 총 연차
        usedAnnualLeave: 0,      // 남은 연차 
        remainingAnnualLeave: 0, // 사용 연차 
    });
    const [loading, setLoading] = useState(true);

    // 💡 사용률 계산 로직 (프론트에서 계산)
    // 사용률 = (사용 연차 / 총 연차) * 100
    const usageRate = balance.totalAnnualLeave > 0 
        ? ((balance.remainingAnnualLeave / balance.totalAnnualLeave) * 100).toFixed(1) 
        : 0;

    useEffect(() => {
        // const fetchBalance = async () => {
        //     try {
        //         const response = await leaveApi.getBalance();
        //         if (response.success) {
        //             setBalance(response.data);
        //         }
        //     } catch (error) {
        //         console.error("데이터 로드 실패:", error.message);
        //     } finally {
        //         setLoading(false);
        //     }
        // };
        // fetchBalance();
        const fetchBalance = () => {
            try {
                const savedData = localStorage.getItem('leaveHistory');
                const history = savedData ? JSON.parse(savedData) : [];

                // '승인'된 연차 합계 계산
                const approvedDays = history
                    .filter(item => item.status === '승인')
                    .reduce((acc, cur) => acc + Number(cur.usedDays), 0);

                const total = 15;

                setBalance({
                    totalAnnualLeave: total,
                    usedAnnualLeave: total - approvedDays,   // 잔여 (화면 큰 숫자)
                    remainingAnnualLeave: approvedDays       // 사용 (하단 작은 글씨)
                });
            } catch (error) {
                console.error("데이터 계산 실패:", error);
            } finally {
                setLoading(false);
            }
        }; // fetchBalance 정의 끝

        // 2. 함수 실행
        fetchBalance();

    }, []);

    if (loading) return <div>로딩 중...</div>;

    return (
        <div style={styles.container}>
            <div style={styles.infoWrapper}>
                <div>
                    <span style={styles.label}>잔여 연차</span>
                    <h2 style={styles.count}>{balance.usedAnnualLeave} <span style={{fontSize: '20px'}}>일</span></h2>
                    <p style={styles.subText}>
                        올해 총 {balance.totalAnnualLeave}일 | 사용 {balance.remainingAnnualLeave}일
                    </p>
                </div>
                <div style={{textAlign: 'right'}}>
                    <p style={{margin: 0, fontSize: '13px', opacity: 0.8}}>직급 기준 연차</p>
                    <strong style={{display: 'block', fontSize: '18px', margin: '5px 0'}}>{balance.totalAnnualLeave}일/년</strong>
                </div>
            </div>

            <div style={{marginTop: '20px'}}>
                <div style={{display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '8px'}}>
                    <span>사용률</span>
                    <span>{usageRate}%</span>
                </div>
                <div style={styles.progressBar}>
                    <div style={{...styles.progressFill, width: `${usageRate}%`}}></div>
                </div>
            </div>
        </div>
    );
};

const styles = {
    container: {
        background: 'linear-gradient(135deg, #254EDB 0%, #1A3BB0 100%)',
        color: 'white',
        padding: '30px',
        borderRadius: '12px',
    },
    infoWrapper: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start'
    },
    label: { fontSize: '14px', opacity: 0.8 },
    count: { fontSize: '42px', margin: '5px 0', fontWeight: 'bold' },
    subText: { fontSize: '13px', opacity: 0.7 },
    progressBar: {
        height: '8px',
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: '4px',
        overflow: 'hidden'
    },
    progressFill: {
        height: '100%',
        backgroundColor: 'white',
        transition: 'width 0.5s ease-out'
    }
};

export default LeaveBalanceCard;