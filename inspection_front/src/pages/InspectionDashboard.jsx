// src/pages/InspectionDashboard.jsx

import React, { useEffect } from 'react';
import api from '../api'; // Import the centralized api instance
// import KpiSection from '../components/KpiSection/KpiSection.jsx'; // Temporarily disabled
import ListSection from '../components/ListSection/ListSection.jsx';
import styles from './InspectionDashboard.module.css'; // 페이지 전용 CSS 모듈 import

function InspectionDashboard({ user }) {

    // DEBUG: Add a useEffect to call the debug endpoint
    useEffect(() => {
        const debugRequest = async () => {
            if (user) { // Only run if logged in
                try {
                    console.log("Sending request to /debug-headers...");
                    const response = await api.get('/debug-headers');
                    console.log("Response from /debug-headers:", response.data);
                } catch (error) {
                    console.error("Error calling /debug-headers:", error);
                }
            }
        };

        debugRequest();
    }, [user]); // Rerun when user state changes

    return (
        <>
            <div className={styles.contentTitleArea}>
                <h2 className={styles.contentMainTitle}>외주업체 출장검사 현황 대시보드</h2>
                <p className={styles.contentSubTitle}>실시간으로 업체별 현황을 확인하세요.</p>
            </div>
            <div className={styles.scrollableContent}>
                {/* <KpiSection /> */}
                {/* 위 KPI 섹션은 백엔드 API 준비 후 활성화 예정입니다. */}
                <ListSection user={user} />
            </div>
        </>
    );
}

export default InspectionDashboard;