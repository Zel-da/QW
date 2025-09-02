import React, { useState, useEffect } from 'react';
import { getInspections } from '../../api/inspectionAPI.js';
import styles from './ListSection.module.css';
import { FaPlus, FaFilter } from 'react-icons/fa'; // FaFilter 아이콘 추가
import AddInspectionModal from '../AddInspectionModal/AddInspectionModal.jsx';
import InspectionDetailModal from '../InspectionDetailModal/InspectionDetailModal.jsx';
import FilterModal from '../FilterModal/FilterModal.jsx';

function ListSection({ user }) {
    const [allInspections, setAllInspections] = useState([]);
    const [filteredInspections, setFilteredInspections] = useState([]);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    // ▼▼▼ 필터 모달 상태 추가 ▼▼▼
    const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);

    // ... (기존 filters, filterOptions, useEffect, handleFilterChange 로직은 그대로 둡니다) ...
    const [filters, setFilters] = useState({ manager: 'all', company: 'all', partName: 'all', status: 'all' });
    const [filterOptions, setFilterOptions] = useState({ managers: [], companies: [], partNames: [], statuses: ['all', 'delayed', 'inProgress', 'completed'] });

    useEffect(() => {
        const fetchData = async () => {
            const data = await getInspections();
            setAllInspections(data);
        };
        fetchData();
    }, []);

    useEffect(() => {
        let result = allInspections;
        if (filters.manager !== 'all') result = result.filter(item => item.manager === filters.manager);
        if (filters.company !== 'all') result = result.filter(item => item.company === filters.company);
        if (filters.partName !== 'all') result = result.filter(item => item.partName === filters.partName);
        if (filters.status !== 'all') result = result.filter(item => item.status === filters.status);
        setFilteredInspections(result);
        if (allInspections.length > 0) {
            const managers = [...new Set(allInspections.map(item => item.manager))];
            const companies = [...new Set(allInspections.map(item => item.company))];
            const partNames = [...new Set(allInspections.map(item => item.partName))];
            setFilterOptions(prev => ({ ...prev, managers: ['all', ...managers], companies: ['all', ...companies], partNames: ['all', ...partNames] }));
        }
    }, [filters, allInspections]);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const handleOpenAddModal = () => {
        if (!user) { alert('로그인이 필요합니다.'); return; }
        setIsAddModalOpen(true);
    };

    const handleSuccess = (updatedOrNewEntry) => {
        setAllInspections(prev => {
            const existingIndex = prev.findIndex(item => item.id === updatedOrNewEntry.id);
            if (existingIndex > -1) {
                const newItems = [...prev];
                newItems[existingIndex] = updatedOrNewEntry;
                return newItems;
            } else {
                return [updatedOrNewEntry, ...prev];
            }
        });
    };

    const handleRowClick = (item) => {
        setSelectedItem(item);
        setIsDetailModalOpen(true);
    };

    const applyFiltersFromModal = (newFilters) => {
        setFilters(newFilters);
    };

    return (
        <>
            <section className={styles.listSection}>
                <div className={styles.sectionHeader}>
                    <h2>상세 목록</h2>

                    {/* ▼▼▼ 데스크탑용 필터 ▼▼▼ */}
                    <div className={styles.desktopFilters}>
                        <select name="manager" value={filters.manager} onChange={handleFilterChange}>
                            {filterOptions.managers.map(option => (<option key={option} value={option}>{option === 'all' ? '담당자 전체' : option}</option>))}
                        </select>
                        <select name="company" value={filters.company} onChange={handleFilterChange}>
                            {filterOptions.companies.map(option => (<option key={option} value={option}>{option === 'all' ? '업체 전체' : option}</option>))}
                        </select>
                        <select name="partName" value={filters.partName} onChange={handleFilterChange}>
                            {filterOptions.partNames.map(option => (<option key={option} value={option}>{option === 'all' ? '부품 전체' : option}</option>))}
                        </select>
                        <select name="status" value={filters.status} onChange={handleFilterChange}>
                            {filterOptions.statuses.map(option => (<option key={option} value={option}>{option === 'all' && '상태 전체'}{option === 'delayed' && '지연'}{option === 'inProgress' && '진행중'}{option === 'completed' && '완료'}</option>))}
                        </select>
                    </div>

                    {/* ▼▼▼ 데스크탑용 추가 버튼 ▼▼▼ */}
                    {user && (
                        <button onClick={handleOpenAddModal} className={styles.desktopAddButton}>
                            <FaPlus size={12} /><span>추가</span>
                        </button>
                    )}

                    {/* ▼▼▼ 모바일용 필터/추가 버튼 ▼▼▼ */}
                    <div className={styles.mobileActions}>
                        <button className={styles.mobileButton} onClick={() => setIsFilterModalOpen(true)}><FaFilter size={12} /><span>필터</span></button>
                        {user && (
                            <button className={styles.mobileButton} onClick={handleOpenAddModal}>
                                <FaPlus size={12} /><span>추가</span>
                            </button>
                        )}
                    </div>
                </div>

                {/* ▼▼▼ 데스크탑용 테이블 ▼▼▼ */}
                <table className={styles.inspectionTable}>
                    {/* ... 기존 thead, tbody 내용 ... */}
                    <thead>
                        <tr>
                            <th>담당자</th><th>업체명</th><th>부품명</th><th>불량/검사</th><th>불량사유</th><th>조치방법</th><th>목표일</th><th>진행률</th><th>상태</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredInspections.map((item) => (
                            <tr key={item.id} onClick={() => handleRowClick(item)} className={styles.clickableRow}>
                                <td>{item.manager}</td><td>{item.company}</td><td>{item.partName}</td><td>{`${item.defectCount}/${item.totalCount}`}</td><td>{item.reason}</td><td>{item.solution}</td><td>{item.dueDate}</td>
                                <td><div className={styles.progressBarContainer}><div className={styles.progressBarWrapper}><div className={styles.progressBar} style={{ width: `${item.progress}%` }}></div></div><span>{item.progress}%</span></div></td>
                                <td><span className={`${styles.statusTag} ${styles[item.status]}`}>{item.status === 'inProgress' ? '진행중' : item.status === 'completed' ? '완료' : '지연'}</span></td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* ▼▼▼ 모바일용 카드 리스트 ▼▼▼ */}
                <div className={styles.cardList}>
                    {filteredInspections.map(item => (
                        <div key={item.id} className={styles.card} onClick={() => handleRowClick(item)}>
                            <div className={styles.cardRow}>
                                <div className={styles.cardItem}>
                                    <span className={styles.cardLabel}>담당자</span>
                                    <span className={styles.cardValue}>{item.manager}</span>
                                </div>
                                <div className={`${styles.cardItem} ${styles.alignRight}`}>
                                    <span className={`${styles.statusTag} ${styles[item.status]}`}>{item.status === 'inProgress' ? '진행중' : item.status === 'completed' ? '완료' : '지연'}</span>
                                </div>
                            </div>
                            <div className={styles.cardRow}>
                                <div className={styles.cardItem}>
                                    <span className={styles.cardLabel}>업체명</span>
                                    <span className={styles.cardValue}>{item.company}</span>
                                </div>
                                <div className={`${styles.cardItem} ${styles.alignRight}`}>
                                    <span className={styles.cardLabel}>부품명</span>
                                    <span className={styles.cardValue}>{item.partName}</span>
                                </div>
                            </div>
                            <div className={styles.cardRow}>
                                <div className={styles.cardItem}>
                                    <span className={styles.cardLabel}>목표기간</span>
                                    <span className={styles.cardValue}>{item.dueDate}</span>
                                </div>
                                <div className={`${styles.cardItem} ${styles.alignRight}`}>
                                    <span className={styles.cardLabel}>진행률</span>
                                    <span className={styles.cardValue}>{item.progress}%</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
            {/* ... 기존 모달들 ... */}
            {isDetailModalOpen && (<InspectionDetailModal item={selectedItem} user={user} onClose={() => setIsDetailModalOpen(false)} onSuccess={handleSuccess} />)}
            {isAddModalOpen && user && (<AddInspectionModal user={user} onClose={() => setIsAddModalOpen(false)} onSuccess={handleSuccess} />)}
            {isFilterModalOpen && (
                <FilterModal
                    onClose={() => setIsFilterModalOpen(false)}
                    onApplyFilters={applyFiltersFromModal}
                    initialFilters={filters}
                    filterOptions={filterOptions}
                    type="inspection"
                />
            )}

        </>
    );
}
export default ListSection;