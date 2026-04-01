import React, { useEffect, useState } from 'react';
//import { leaveApi } from '../../api/leaveApi';

const LeaveHistoryTable = () => {
    const [history, setHistory] = useState([]);

    // useEffect(() => {
    //     const fetchHistory = async () => {
    //         try {
    //             const response = await leaveApi.getMyRequests();
    //             if (response.success) {
    //                 setHistory(response.data); // 서버에서 받은 배열 저장
    //             }
    //         } catch (error) {
    //             console.error("내역 로드 실패:", error.message);
    //         } finally {
    //             setLoading(false);
    //         }
    //     };
    //     fetchHistory();
    // }, []);

    useEffect(() => {
        const loadData = () => {
            const savedData = localStorage.getItem('leaveHistory');
            if (savedData) {
                setHistory(JSON.parse(savedData));
            }
        };
        loadData();
    }, []);

    // 상태에 따른 배지 색상 결정 함수
    const getStatusStyle = (status) => {
        switch (status) {
            case '승인': return { bg: '#eefaf3', color: '#2ecc71' };
            case '대기중': return { bg: '#fff9e6', color: '#f1c40f' };
            case '반려': return { bg: '#fdf2f2', color: '#e74c3c' };
            default: return { bg: '#f5f5f5', color: '#888' };
        }
    };


    return (
        <div style={styles.container}>
            <table style={styles.table}>
                <thead>
                    <tr style={styles.theadRow}>
                        <th style={styles.th}>신청일</th>
                        <th style={styles.th}>연차 유형</th>
                        <th style={styles.th}>시작일</th>
                        <th style={styles.th}>종료일</th>
                        <th style={styles.th}>일수</th>
                        <th style={styles.th}>사유</th>
                        <th style={styles.th}>상태</th>
                        <th style={styles.th}>비고</th>
                    </tr>
                </thead>
                <tbody>
                    {history.length > 0 ? (
                        history.map((item) => {
                            const status = getStatusStyle(item.status);
                            return (
                                <tr key={item.id} style={styles.tr}>
                                    <td style={styles.td}>{item.requestDate}</td>
                                    <td style={styles.td}>{item.leaveType}</td>
                                    <td style={styles.td}>{item.startDate}</td>
                                    <td style={styles.td}>{item.endDate}</td>
                                    <td style={{...styles.td, fontWeight: 'bold'}}>{item.usedDays}일</td>
                                    <td style={styles.td}>{item.reason}</td>
                                    <td style={styles.td}>
                                        <span style={{
                                            ...styles.badge,
                                            backgroundColor: status.bg,
                                            color: status.color
                                        }}>
                                            {item.status}
                                        </span>
                                    </td>
                                    <td style={styles.td}>-</td>
                                </tr>
                            );
                        })
                    ) : (
                        <tr>
                            <td colSpan="8" style={styles.noData}>신청 내역이 없습니다.</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};


const styles = {
    container: {
        backgroundColor: 'white',
        borderRadius: '12px',
        overflow: 'hidden',
        boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
    },
    table: { width: '100%', borderCollapse: 'collapse', fontSize: '14px' },
    theadRow: { backgroundColor: '#fafafa', borderBottom: '1px solid #eee' },
    th: { textAlign: 'left', padding: '15px', color: '#666', fontWeight: '600', backgroundColor: '#f5f5f5', },
    td: { padding: '15px', borderBottom: '1px solid #f9f9f9', color: '#333' },
    tr: { transition: '0.2s' },
    badge: {
        padding: '4px 10px',
        borderRadius: '6px',
        fontSize: '12px',
        fontWeight: 'bold'
    },
    noData: { padding: '50px', textAlign: 'center', color: '#999' }
};

export default LeaveHistoryTable;