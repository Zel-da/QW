import React, { useState, useEffect, useMemo } from 'react';
import styles from './QualityImprovement.module.css';
import qualityApi from '../api/qualityApi.js';
import KpiPieChart from '../components/KpiPieChart.jsx';
import AddQualityItemModal from '../components/AddQualityItemModal/AddQualityItemModal.jsx';
import QualityDetailModal from '../components/QualityDetailModal/QualityImprovementDetailModal.jsx';
import { FaPlus } from 'react-icons/fa';

// --- KPI Section --- //
function QualityKpiSection({ items }) {
    const kpiData = useMemo(() => {
        return items.reduce((acc, item) => {
            const status = item.status.toLowerCase();
            if (status.includes('completed')) acc.completed += 1;
            else if (status.includes('progress')) acc.inProgress += 1;
            else acc.delayed += 1;
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
                    <div className={`${styles.kpiCard} ${styles.delayed}`}><span className={styles.kpiValue}>{kpiData.delayed}</span><p className={styles.kpiLabel}>지연</p></div>
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

    const statusMap = {
        inProgress: { text: '진행중', className: styles.inProgress },
        completed: { text: '완료', className: styles.completed },
        delayed: { text: '지연', className: styles.delayed },
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
                            <th>담당자</th><th>업체명</th><th>개선항목</th><th>시작일</th><th>마감일</th><th>진행률</th><th>상태</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map((item) => {
                            const statusInfo = statusMap[item.status] || {};
                            return (
                                <tr key={item.id} onClick={() => onRowClick(item.id)} className={styles.clickableRow}>
                                    <td>{item.username}</td>
                                    <td>{item.company_name}</td>
                                    <td className={styles.improvementItem}>{item.item_description}</td>
                                    <td>{new Date(item.start_date).toLocaleDateString()}</td>
                                    <td>{item.end_date ? new Date(item.end_date).toLocaleDateString() : '-'}</td>
                                    <td>
                                        <div className={styles.progressBarContainer}>
                                            <div className={styles.progressBar} style={{ width: `${item.progress}%` }}></div>
                                            <span>{item.progress}%</span>
                                        </div>
                                    </td>
                                    <td><span className={`${styles.statusTag} ${statusInfo.className}`}>{statusInfo.text}</span></td>
                                </tr>
                            );
                        })}
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
        } else {
            // 로그인하지 않은 경우, 로딩을 멈추고 데이터를 비웁니다.
            setIsLoading(false);
            setAllItems([]);
        }
    }, [user]); // user 상태가 변경될 때마다 이 로직이 다시 실행됩니다.

    const handleRowClick = async (id) => {
        try {
            const data = await qualityApi.getQualityImprovementById(id);
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
                <QualityDetailModal item={selectedItem} onClose={() => setIsDetailModalOpen(false)} />
            )}
        </>
    );
}

export default QualityImprovement;