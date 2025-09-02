import React, { useState, useEffect, useMemo } from 'react';
import styles from './QualityImprovement.module.css';
import qualityApi from '../api/qualityApi.js';
import KpiPieChart from '../components/KpiPieChart.jsx';
import QualityListSection from '../components/QualityListSection/QualityListSection.jsx';
import { calculateStatus, statusMap } from '../utils';

// --- KPI Section --- //
function QualityKpiSection({ items, onKpiClick }) {
    const kpiData = useMemo(() => {
        return items.reduce((acc, item) => {
            const calculatedStatus = calculateStatus(item); // Use calculated status
            if (calculatedStatus === 'completed') acc.completed += 1;
            else if (calculatedStatus === 'inProgress') acc.inProgress += 1;
            else if (calculatedStatus === 'delayed') acc.delayed += 1;
            return acc;
        }, { completed: 0, inProgress: 0, delayed: 0 });
    }, [items]);

    const total = items.length;

    return (
        <section className={styles.kpiSection}>
            <div className={styles.sectionHeader}><h2>주요 지표</h2></div>
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

// --- Main Page Component --- //
function QualityImprovement({ user }) {
    const [allItems, setAllItems] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [statusFilter, setStatusFilter] = useState('all');

    const fetchData = async () => {
        try {
            setIsLoading(true);
            const data = await qualityApi.getQualityImprovements();
            setAllItems(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (user) {
            fetchData();
        }
    }, [user]);

    const handleKpiClick = (status) => {
        setStatusFilter(status);
    };

    const filteredByKpi = useMemo(() => {
        if (statusFilter === 'all') {
            return allItems;
        }
        return allItems.filter(item => calculateStatus(item) === statusFilter);
    }, [statusFilter, allItems]);

    if (isLoading) return <div>로딩 중...</div>;
    if (error) return <div>오류: {error}</div>;

    return (
        <>
            <div className={styles.contentTitleArea}>
                <h2 className={styles.contentMainTitle}>품질 개선 현황</h2>
                <p className={styles.contentSubTitle}>업체별 품질 개선 진행도를 확인하세요.</p>
            </div>
            <div className={styles.scrollableContent}>
                <QualityKpiSection items={allItems} onKpiClick={handleKpiClick} />
                <QualityListSection user={user} items={filteredByKpi} onAddSuccess={fetchData} />
            </div>
        </>
    );
}

export default QualityImprovement;