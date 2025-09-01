import React, { useState, useEffect, useMemo } from 'react';
import styles from './QualityImprovement.module.css';
import qualityApi from '../api/qualityApi.js';
import KpiPieChart from '../components/KpiPieChart.jsx';
import AddQualityItemModal from '../components/AddQualityItemModal/AddQualityItemModal.jsx';
import QualityDetailModal from '../components/QualityDetailModal/QualityImprovementDetailModal.jsx';
import { FaPlus } from 'react-icons/fa';

// --- KPI Section --- //
function QualityKpiSection({ items, onKpiClick }) { // onKpiClick prop 추가
    const kpiData = useMemo(() => {
        return items.reduce((acc, item) => {
            const status = item.status ? item.status.toLowerCase() : 'inprogress';
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
                    {total > 0 && <KpiPieChart kpiData={{...kpiData, total}} />}
                </div>
                <div className={styles.kpiCardsContainer}>
                    {/* 순서 변경 및 onClick 핸들러 추가 */}
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
                    <button onClick={handleOpenModal} className={styles.addButton}><FaPlus size={12} /><span>등록</span></button>
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
    const [statusFilter, setStatusFilter] = useState('all'); // 필터 상태 추가

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
            setIsLoading(false);
            setAllItems([]);
        }
    }, [user]);

    const handleKpiClick = (status) => {
        setStatusFilter(status);
    };

    const handleRowClick = async (id) => {
        try {
            const data = await qualityApi.getQualityImprovementById(id);
            setSelectedItem(data);
            setIsDetailModalOpen(true);
        } catch (err) {
            alert(`상세 정보 조회 실패: ${err.message}`);
        }
    };

    const filteredByKpi = useMemo(() => {
        if (statusFilter === 'all') {
            return allItems;
        }
        // status 필드가 없는 경우를 대비하여 안전 장치 추가
        return allItems.filter(item => (item.status || 'inProgress') === statusFilter);
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
                <QualityListSection user={user} items={filteredByKpi} onRowClick={handleRowClick} onAddSuccess={fetchData} />
            </div>
            {isDetailModalOpen && (
                <QualityDetailModal item={selectedItem} onClose={() => setIsDetailModalOpen(false)} />
            )}
        </>
    );
}

export default QualityImprovement;