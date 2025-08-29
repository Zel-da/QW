// src/pages/QualityImprovement.jsx

import React, { useState, useEffect } from 'react';
import styles from './QualityImprovement.module.css'; // 페이지 전용 CSS
import { getQualityItems, getQualityKpiSummary, addQualityItem } from '../api/qualityApi.js';
import KpiPieChart from '../components/KpiPieChart.jsx';
import AddQualityItemModal from '../components/AddQualityItemModal/AddQualityItemModal.jsx';
import { FaPlus } from 'react-icons/fa';

// QualityImprovement 페이지 내에 KPI와 List 컴포넌트를 직접 정의 (파일을 더 만들지 않고 단순화)
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
                    <div className={`${styles.kpiCard} ${styles.delayed}`}>
                        <span className={styles.kpiValue}>{kpiData.delayed}</span>
                        <p className={styles.kpiLabel}>지연 항목</p>
                    </div>
                    <div className={`${styles.kpiCard} ${styles.inProgress}`}>
                        <span className={styles.kpiValue}>{kpiData.inProgress}</span>
                        <p className={styles.kpiLabel}>진행 중</p>
                    </div>
                    <div className={`${styles.kpiCard} ${styles.completed}`}>
                        <span className={styles.kpiValue}>{kpiData.completed}</span>
                        <p className={styles.kpiLabel}>완료</p>
                    </div>
                    <div className={`${styles.kpiCard} ${styles.total}`}>
                        <span className={styles.kpiValue}>{kpiData.total}</span>
                        <p className={styles.kpiLabel}>전체 항목</p>
                    </div>
                </div>
            </div>
        </section>
    );
}

function QualityListSection({ user }) {
    const [allItems, setAllItems] = useState([]);
    const [filteredItems, setFilteredItems] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const [filters, setFilters] = useState({
        manager: 'all',
        company: 'all',
        status: 'all',
    });

    const [filterOptions, setFilterOptions] = useState({
        managers: [],
        companies: [],
        statuses: ['all', 'delayed', 'inProgress', 'completed'],
    });

    // 데이터 로딩 및 필터 옵션 생성
    useEffect(() => {
        const fetchData = async () => {
            const data = await getQualityItems();
            setAllItems(data);
            setFilteredItems(data);

            const managers = [...new Set(data.map(item => item.manager))];
            const companies = [...new Set(data.map(item => item.company))];

            setFilterOptions(prev => ({
                ...prev,
                managers: ['all', ...managers],
                companies: ['all', ...companies],
            }));
        };
        fetchData();
    }, []);

    // 필터링 로직
    useEffect(() => {
        let result = allItems;
        if (filters.manager !== 'all') {
            result = result.filter(item => item.manager === filters.manager);
        }
        if (filters.company !== 'all') {
            result = result.filter(item => item.company === filters.company);
        }
        if (filters.status !== 'all') {
            result = result.filter(item => item.status === filters.status);
        }
        setFilteredItems(result);
    }, [filters, allItems]);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const handleOpenModal = () => { if (!user) { alert('로그인이 필요합니다.'); return; } setIsModalOpen(true); };
    const getStatus = (item) => { if (item.progress === 100) return 'completed'; if (new Date(item.endDate) < new Date() && item.progress < 100) return 'delayed'; return 'inProgress'; };
    const handleSuccess = (newItem) => { const newItemWithStatus = { ...newItem, status: getStatus(newItem) }; setAllItems(prev => [newItemWithStatus, ...prev]); };

    return (
        <>
            <section className={styles.listSection}>
                <div className={styles.sectionHeader}>
                    <h2>상세 목록</h2>
                    {/* ▼▼▼ 필터 UI 추가 ▼▼▼ */}
                    <div className={styles.filters}>
                        <select name="manager" value={filters.manager} onChange={handleFilterChange}>
                            {filterOptions.managers.map(opt => <option key={opt} value={opt}>{opt === 'all' ? '담당자 전체' : opt}</option>)}
                        </select>
                        <select name="company" value={filters.company} onChange={handleFilterChange}>
                            {filterOptions.companies.map(opt => <option key={opt} value={opt}>{opt === 'all' ? '업체 전체' : opt}</option>)}
                        </select>
                        <select name="status" value={filters.status} onChange={handleFilterChange}>
                            {filterOptions.statuses.map(opt => (
                                <option key={opt} value={opt}>
                                    {opt === 'all' && '상태 전체'}
                                    {opt === 'delayed' && '지연'}
                                    {opt === 'inProgress' && '진행중'}
                                    {opt === 'completed' && '완료'}
                                </option>
                            ))}
                        </select>
                    </div>
                    <button onClick={handleOpenModal} className={styles.addButton}><FaPlus size={12} /><span>새 항목</span></button>
                </div>
                <table className={styles.inspectionTable}>
                    <thead>
                        <tr>
                            <th className={styles.managerColumn}>담당자</th>
                            <th className={styles.companyColumn}>업체명</th>
                            <th className={styles.improvementItemColumn}>개선항목</th>
                            <th className={styles.dateColumn}>시작일</th>
                            <th className={styles.dateColumn}>마감일</th>
                            <th className={styles.progressColumn}>진행률</th>
                            <th className={styles.statusColumn}>상태</th>
                        </tr>
                    </thead>
                    <tbody>
                        {/* filteredItems를 렌더링하도록 변경 */}
                        {filteredItems.map((item) => (
                            <tr key={item.id}>
                                <td>{item.manager}</td>
                                <td>{item.company}</td>
                                <td className={styles.improvementItem}>{item.improvementItem}</td>
                                <td>{item.startDate}</td>
                                <td>{item.endDate}</td>
                                <td>
                                    <div className={styles.progressBarContainer}>
                                        <div className={styles.progressBar} style={{ width: `${item.progress}%` }}></div>
                                        <span>{item.progress}%</span>
                                    </div>
                                </td>
                                <td>
                                    <span className={`${styles.statusTag} ${styles[item.status]}`}>
                                        {item.status === 'inProgress' ? '진행중' : item.status === 'completed' ? '완료' : '지연'}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </section>
            {isModalOpen && user && <AddQualityItemModal user={user} onClose={() => setIsModalOpen(false)} onSuccess={handleSuccess} />}
        </>
    );
}


// --- Main Page Component ---
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