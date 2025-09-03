import React, { useState, useEffect, useMemo } from 'react';
import { getInspections } from '../api/inspectionAPI.js';
import KpiSection from '../components/KpiSection/KpiSection.jsx';
import ListSection from '../components/ListSection/ListSection.jsx';
import styles from './InspectionDashboard.module.css';

import { calculateStatus } from '../utils';

function InspectionDashboard({ user }) {
    const [allInspections, setAllInspections] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'inProgress', 'completed', 'delayed'
    const [currentPage, setCurrentPage] = useState(1);

    const fetchData = async () => {
        if (!user) {
            setLoading(false);
            setAllInspections([]);
            return;
        }
        try {
            setLoading(true);
            const data = await getInspections();
            setAllInspections(data);
        } catch (err) {
            console.error("Failed to fetch inspections:", err);
            setError(err.message);
            setAllInspections([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [user]);

    const handleKpiClick = (status) => {
        setStatusFilter(status);
    };

    const filteredByKpi = useMemo(() => {
        if (statusFilter === 'all') {
            return allInspections;
        }
        return allInspections.filter(item => calculateStatus(item) === statusFilter);
    }, [statusFilter, allInspections]);

    // 필터가 변경되면 항상 1페이지로 리셋합니다.
    useEffect(() => {
        setCurrentPage(1);
    }, [statusFilter]);

    return (
        <>
            <div className={styles.contentTitleArea}>
                {/* Replace the h2 text with an image. Update the src path to your image. */}
                <h2 className={styles.contentMainTitle}>외주업체 출장검사 현황</h2>
                <p className={styles.contentSubTitle}>실시간으로 업체별 현황을 확인하세요.</p>
            </div>
            <div className={styles.scrollableContent}>
                <KpiSection inspections={allInspections} onKpiClick={handleKpiClick} />
                {loading && <p>로딩 중...</p>}
                {error && <p>데이터 로딩 실패: {error}</p>}
                {!loading && !error && (
                    <ListSection
                        user={user}
                        inspections={filteredByKpi}
                        onSuccess={fetchData}
                        currentPage={currentPage}
                        setCurrentPage={setCurrentPage}
                    />
                )}
            </div>
        </>
    );
}

export default InspectionDashboard;