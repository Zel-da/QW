// src/pages/QualityImprovement.jsx

import React from 'react';
import styles from './QualityImprovement.module.css';
import QualityKpiSection from '../components/QualityKpiSection/QualityKpiSection.jsx';
import QualityListSection from '../components/QualityListSection/QualityListSection.jsx';

function QualityImprovement({ user }) {
    return (
        <>
            <div className={styles.contentTitleArea}>
                <h2 className={styles.contentMainTitle}>품질 개선 현황</h2>
                <p className={styles.contentSubTitle}>업체별 품질 개선 진행도를 확인하세요.</p>
            </div>
            <div className={styles.scrollableContent}>
                <QualityKpiSection />
                <QualityListSection user={user} />
            </div>
        </>
    );
}

export default QualityImprovement;