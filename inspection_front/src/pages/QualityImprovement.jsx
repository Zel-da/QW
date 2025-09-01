import React, { useState, useEffect, useMemo } from 'react';
import styles from './QualityImprovement.module.css';
import { getQualityImprovements, getQualityImprovementById, addQualityItem } from '../api/qualityApi.js';
import KpiPieChart from '../components/KpiPieChart.jsx';
import AddQualityItemModal from '../components/AddQualityItemModal/AddQualityItemModal.jsx';
import QualityImprovementDetailModal from '../components/QualityImprovementDetailModal/QualityImprovementDetailModal.jsx';
import { FaPlus } from 'react-icons/fa';

// --- KPI Section --- //
function QualityKpiSection({ items }) {
    const kpiData = useMemo(() => {
        return items.reduce((acc, item) => {
            const status = item.status.toLowerCase();
            if (status.includes('resolved')) acc.completed += 1;
            else if (status.includes('progress')) acc.inProgress += 1;
            else acc.delayed += 1; // Assuming others are delayed/open
            return acc;
        }, { completed: 0, inProgress: 0, delayed: 0 });
    }, [items]);

    const total = items.length;

    return (
        <section className={styles.kpiSection}>
            <div className={styles.sectionHeader}><h2>주요 지표</h2></div>
            <div className={styles.kpiContentWrapper}>
                <div className={styles.kpiChartContainer}>
                    {total > 0 && <KpiPieChart kpiData={kpiData} />}
                </div>
                <div className={styles.kpiCardsContainer}>
                    <div className={`${styles.kpiCard} ${styles.delayed}`}><span className={styles.kpiValue}>{kpiData.delayed}</span><p className={styles.kpiLabel}>검토/지연</p></div>
                    <div className={`${styles.kpiCard} ${styles.inProgress}`}><span className={styles.kpiValue}>{kpiData.inProgress}</span><p className={styles.kpiLabel}>진행 중</p></div>
                    <div className={`${styles.kpiCard} ${styles.completed}`}><span className={styles.kpiValue}>{kpiData.completed}</span><p className={styles.kpiLabel}>완료</p></div>
                    <div className={`${styles.kpiCard} ${styles.total}`}><span className={styles.kpiValue}>{total}</span><p className={styles.kpiLabel}>전체 항목</p></div>
                </div>
            </div>
        </section>
    );
}

// --- List Section --- //
function QualityListSection({ user, items, onRowClick, onAddSuccess }) {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleOpenModal = () => { 
        if (!user) { alert('로그인이 필요합니다.'); return; } 
        setIsModalOpen(true); 
    };

    return (
        <>
            <section className={styles.listSection}>
                <div className={styles.sectionHeader}>
                    <h2>상세 목록</h2>
                    <button onClick={handleOpenModal} className={styles.addButton}><FaPlus size={12} /><span>새 항목</span></button>
                </div>
                <table className={styles.inspectionTable}>
                    <thead>
                        <tr>
                            <th>작성자</th><th>제목</th><th>분류</th><th>상태</th><th>생성일</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map((item) => (
                            <tr key={item.id} onClick={() => onRowClick(item.id)} className={styles.clickableRow}>
                                <td>{item.username}</td>
                                <td>{item.title}</td>
                                <td>{item.category}</td>
                                <td><span className={`${styles.statusTag} ${styles[item.status.toLowerCase().replace(' ', '-')]}`}>{item.status}</span></td>
                                <td>{new Date(item.created_at).toLocaleDateString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </section>
            {isModalOpen && user && <AddQualityItemModal user={user} onClose={() => setIsModalOpen(false)} onSuccess={onAddSuccess} />}
        </>
    );
}

// --- Main Page Component --- //
function QualityImprovement({ user }) {
    const [allItems, setAllItems] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);

    const fetchData = async () => {
        try {
            setIsLoading(true);
            const data = await getQualityImprovements();
            setAllItems(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleRowClick = async (id) => {
        try {
            const data = await getQualityImprovementById(id);
            setSelectedItem(data);
            setIsDetailModalOpen(true);
        } catch (err) {
            alert(`상세 정보 조회 실패: ${err.message}`);
        }
    };

    if (isLoading) return <div>로딩 중...</div>;
    if (error) return <div>오류: {error}</div>;

    return (
        <>
            <div className={styles.contentTitleArea}>
                <h2 className={styles.contentMainTitle}>품질 개선 현황</h2>
                <p className={styles.contentSubTitle}>업체별 품질 개선 진행도를 확인하세요.</p>
            </div>
            <div className={styles.scrollableContent}>
                <QualityKpiSection items={allItems} />
                <QualityListSection user={user} items={allItems} onRowClick={handleRowClick} onAddSuccess={fetchData} />
            </div>
            {isDetailModalOpen && (
                <QualityImprovementDetailModal item={selectedItem} onClose={() => setIsDetailModalOpen(false)} />
            )}
        </>
    );
}

export default QualityImprovement;
