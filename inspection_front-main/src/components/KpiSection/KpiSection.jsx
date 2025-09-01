// src/components/KpiSection.jsx

import React, { useState, useEffect } from 'react';
import KpiPieChart from '../KpiPieChart'; // KpiPieChart는 CSS 모듈화가 필요 없습니다.
import { getKpiSummary } from '../../api/inspectionAPI.js';
import styles from './KpiSection.module.css'; // 1. KpiSection 전용 CSS 모듈을 import 합니다.

function KpiSection() {
    const [kpiData, setKpiData] = useState({
        delayed: 0,
        inProgress: 0,
        completed: 0,
        total: 0,
    });

    useEffect(() => {
        const fetchKpiData = async () => {
            const summaryData = await getKpiSummary();
            setKpiData(summaryData);
        };
        fetchKpiData();
    }, []);

    return (
        // 2. 모든 className을 styles 객체를 사용하도록 변경합니다.
        <section className={styles.kpiSection}>
            <div className={styles.sectionHeader}>
                <h2>주요 지표</h2>

            </div>

            <div className={styles.kpiContentWrapper}>
                <div className={styles.kpiChartContainer}>
                    {kpiData.total > 0 && <KpiPieChart kpiData={kpiData} />}
                </div>
                <div className={styles.kpiCardsContainer}>
                    {/* 1. 전체 항목 */}
                    <div className={`${styles.kpiCard} ${styles.total}`}>
                        <span className={styles.kpiValue}>{kpiData.total}</span>
                        <p className={styles.kpiLabel}>전체 항목</p>
                    </div>

                    {/* 2. 진행 중 */}
                    <div className={`${styles.kpiCard} ${styles.inProgress}`}>
                        <span className={styles.kpiValue}>{kpiData.inProgress}</span>
                        <p className={styles.kpiLabel}>진행 중</p>
                    </div>

                    {/* 3. 지연 항목 */}
                    <div className={`${styles.kpiCard} ${styles.delayed}`}>
                        <span className={styles.kpiValue}>{kpiData.delayed}</span>
                        <p className={styles.kpiLabel}>지연 항목</p>
                    </div>

                    {/* 4. 완료 */}
                    <div className={`${styles.kpiCard} ${styles.completed}`}>
                        <span className={styles.kpiValue}>{kpiData.completed}</span>
                        <p className={styles.kpiLabel}>완료</p>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default KpiSection;