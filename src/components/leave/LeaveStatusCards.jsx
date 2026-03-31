// src/components/leave/LeaveStatusCards.jsx
import React, { useEffect, useState } from 'react';

const LeaveStatusCards = () => {
    const [stats, setStats] = useState({
        total: 0,
        approved: 0,
        pending: 0,
        rejected: 0
    });

    useEffect(() => {
        // 1. 로컬 스토리지에서 데이터 읽기
        const loadStats = () => {
            const savedData = localStorage.getItem('leaveHistory');
            if (savedData) {
                const history = JSON.parse(savedData);
                
                // 2. 상태별 개수 계산
                setStats({
                    total: history.length,
                    approved: history.filter(item => item.status === '승인').length,
                    pending: history.filter(item => item.status === '대기중').length,
                    rejected: history.filter(item => item.status === '반려').length
                });
            }
        };

        loadStats();

        // 다른 탭이나 페이지 이동 시 데이터 동기화를 위한 이벤트 (선택사항)
        window.addEventListener('storage', loadStats);
        return () => window.removeEventListener('storage', loadStats);
    }, []);

    const cardData = [
        { label: '전체 신청', count: stats.total, icon: '📋', color: '#333' },
        { label: '승인', count: stats.approved, icon: '✅', color: '#2ecc71' },
        { label: '대기중', count: stats.pending, icon: '⏳', color: '#f1c40f' },
        { label: '반려', count: stats.rejected, icon: '❌', color: '#e74c3c' },
    ];

    return (
        <div style={{ display: 'flex', gap: '20px', width: '100%' }}>
            {cardData.map((data, index) => (
                <div key={index} style={styles.card}>
                    <div style={styles.icon}>{data.icon}</div>
                    <div style={styles.info}>
                        <div style={{ ...styles.count, color: data.color }}>{data.count}</div>
                        <div style={styles.label}>{data.label}</div>
                    </div>
                </div>
            ))}
        </div>
    );
};

const styles = {
    card: {
        flex: 1,
        backgroundColor: 'white',
        padding: '20px 25px',
        borderRadius: '12px',
        display: 'flex',
        alignItems: 'center',
        gap: '20px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
    },
    icon: {
        fontSize: '28px',
        width: '50px',
        height: '50px',
        backgroundColor: '#f8f9fa',
        borderRadius: '10px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
    },
    info: { display: 'flex', flexDirection: 'column' },
    count: { fontSize: '26px', fontWeight: '800' },
    label: { fontSize: '13px', color: '#888', marginTop: '4px' }
};

export default LeaveStatusCards;