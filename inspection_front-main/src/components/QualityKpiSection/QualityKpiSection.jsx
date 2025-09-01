// src/components/QualityKpiSection/QualityKpiSection.jsx

import React, { useState, useEffect } from 'react';
import { getQualityKpiSummary } from '../../api/qualityApi.js';
import KpiPieChart from '../KpiPieChart.jsx';
import styles from './QualityKpiSection.module.css'; // 전용 CSS 모듈 사용

function QualityKpiSection() {
    const [kpiData, setKpiData] = useState({ delayed: 0, inProgress: 0, completed: 0, total: 0 });

    useEffect(() => {
        const fetchKpiData = async () => {
            const summaryData = await getQualityKpiSummary();
            setKpiData(summaryData);
        };
        fetchKpiData();
    }, []);

    return (
        <section className={styles.kpiSection}>
            <div className={styles.sectionHeader}>
                <h2>주요 지표</h2>
            </div>
            <div className={styles.kpiContentWrapper}>
                <div className={styles.kpiChartContainer}>
                    {kpiData.total > 0 && <KpiPieChart kpiData={kpiData} />}
                </div>
                <div className={styles.kpiCardsContainer}>
                    <div className={`${styles.kpiCard} ${styles.total}`}>
                        <span className={styles.kpiValue}>{kpiData.total}</span>
                        <p className={styles.kpiLabel}>전체 항목</p>
                    </div>
                    <div className={`${styles.kpiCard} ${styles.inProgress}`}>
                        <span className={styles.kpiValue}>{kpiData.inProgress}</span>
                        <p className={styles.kpiLabel}>진행 중</p>
                    </div>
                    <div className={`${styles.kpiCard} ${styles.delayed}`}>
                        <span className={styles.kpiValue}>{kpiData.delayed}</span>
                        <p className={styles.kpiLabel}>지연 항목</p>
                    </div>
                    <div className={`${styles.kpiCard} ${styles.completed}`}>
                        <span className={styles.kpiValue}>{kpiData.completed}</span>
                        <p className={styles.kpiLabel}>완료</p>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default QualityKpiSection;