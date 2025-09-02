import React, { useMemo } from 'react';
import KpiPieChart from '../KpiPieChart.jsx';
import styles from './KpiSection.module.css';
import { calculateStatus } from '../../utils';

import { calculateStatus } from '../../utils';

function KpiSection({ inspections, onKpiClick }) {
    const kpiData = useMemo(() => {
        return inspections.reduce((acc, item) => {
            const status = calculateStatus(item); // Use calculated status
            if (status === 'completed') {
                acc.completed += 1;
            } else if (status === 'inProgress') {
                acc.inProgress += 1;
            } else if (status === 'delayed') {
                acc.delayed += 1;
            }
            return acc;
        }, { completed: 0, inProgress: 0, delayed: 0 });
    }, [inspections]);

    const total = inspections.length;

    return (
        <section className={styles.kpiSection}>
            <div className={styles.sectionHeader}>
                <h2>주요 지표</h2>
            </div>
            <div className={styles.kpiContentWrapper}>
                <div className={styles.kpiChartContainer}>
                    {total > 0 && <KpiPieChart kpiData={{...kpiData, total}} />}
                </div>
                <div className={styles.kpiCardsContainer}>
                    <div className={`${styles.kpiCard} ${styles.total}`} onClick={() => onKpiClick('all')}>
                        <span className={styles.kpiValue}>{total}</span>
                        <p className={styles.kpiLabel}>전체 항목</p>
                    </div>
                    <div className={`${styles.kpiCard} ${styles.inProgress}`} onClick={() => onKpiClick('inProgress')}>
                        <span className={styles.kpiValue}>{kpiData.inProgress}</span>
                        <p className={styles.kpiLabel}>진행 중</p>
                    </div>
                    <div className={`${styles.kpiCard} ${styles.delayed}`} onClick={() => onKpiClick('delayed')}>
                        <span className={styles.kpiValue}>{kpiData.delayed}</span>
                        <p className={styles.kpiLabel}>지연</p>
                    </div>
                    <div className={`${styles.kpiCard} ${styles.completed}`} onClick={() => onKpiClick('completed')}>
                        <span className={styles.kpiValue}>{kpiData.completed}</span>
                        <p className={styles.kpiLabel}>완료</p>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default KpiSection;