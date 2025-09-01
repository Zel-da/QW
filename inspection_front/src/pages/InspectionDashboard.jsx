// src/pages/InspectionDashboard.jsx

import React from 'react';
// import KpiSection from '../components/KpiSection/KpiSection.jsx'; // 백엔드 API 준비 후 활성화 예정
import ListSection from '../components/ListSection/ListSection.jsx';
import styles from './InspectionDashboard.module.css';

function InspectionDashboard({ user }) {
    return (
        <>
            <div className={styles.contentTitleArea}>
                <h2 className={styles.contentMainTitle}>외주업체 출장검사 현황 대시보드</h2>
                <p className={styles.contentSubTitle}>실시간으로 업체별 현황을 확인하세요.</p>
            </div>
            <div className={styles.scrollableContent}>
                {/* <KpiSection /> */}
                <ListSection user={user} />
            </div>
        </>
    );
}

export default InspectionDashboard;