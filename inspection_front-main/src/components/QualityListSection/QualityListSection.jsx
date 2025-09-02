import React, { useState, useEffect } from 'react';
import { getQualityItems } from '../../api/qualityApi.js';
import styles from './QualityListSection.module.css';
import { FaPlus, FaFilter } from 'react-icons/fa';
import AddQualityItemModal from '../AddQualityItemModal/AddQualityItemModal.jsx';
import QualityDetailModal from '../QualityDetailModal/QualityDetailModal.jsx';
import FilterModal from '../FilterModal/FilterModal.jsx';

// ▼▼▼ 1. 상태 계산 함수를 컴포넌트 바깥이나 안쪽 헬퍼 함수로 분리합니다 ▼▼▼
const getStatus = (item) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const endDate = new Date(item.endDate);

    // progress 값을 숫자로 변환하여 비교합니다.
    if (parseInt(item.progress, 10) === 100) return 'completed';

    if (endDate < today && parseInt(item.progress, 10) < 100) return 'delayed';

    return 'inProgress';
};

function QualityListSection({ user }) {
    const [allItems, setAllItems] = useState([]);
    const [filteredItems, setFilteredItems] = useState([]);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [filters, setFilters] = useState({ manager: 'all', company: 'all', status: 'all' });
    const [filterOptions, setFilterOptions] = useState({ managers: [], companies: [], statuses: ['all', 'delayed', 'inProgress', 'completed'] });

    useEffect(() => {
        const fetchData = async () => {
            const data = await getQualityItems();
            // ▼▼▼ 2. 데이터를 불러온 직후, 각 항목의 상태를 계산하여 추가합니다 ▼▼▼
            const processedData = data.map(item => ({
                ...item,
                status: getStatus(item)
            }));
            setAllItems(processedData);
        };
        fetchData();
    }, []);

    useEffect(() => {
        let result = allItems;
        if (filters.manager !== 'all') result = result.filter(item => item.manager === filters.manager);
        if (filters.company !== 'all') result = result.filter(item => item.company === filters.company);
        if (filters.status !== 'all') result = result.filter(item => item.status === filters.status);
        setFilteredItems(result);

        if (allItems.length > 0) {
            const managers = [...new Set(allItems.map(item => item.manager))];
            const companies = [...new Set(allItems.map(item => item.company))];
            setFilterOptions(prev => ({ ...prev, managers: ['all', ...managers], companies: ['all', ...companies] }));
        }
    }, [filters, allItems]);

    const handleOpenAddModal = () => { if (!user) { alert('로그인이 필요합니다.'); return; } setIsAddModalOpen(true); };
    const handleFilterChange = (e) => { const { name, value } = e.target; setFilters(prev => ({ ...prev, [name]: value })); };
    const handleRowClick = (item) => { setSelectedItem(item); setIsDetailModalOpen(true); };

    // ▼▼▼ 3. handleSuccess 함수도 분리된 getStatus 함수를 사용하도록 수정합니다 ▼▼▼
    const handleSuccess = (updatedOrNewEntry) => {
        const entryWithStatus = { ...updatedOrNewEntry, status: getStatus(updatedOrNewEntry) };

        setAllItems(prevItems => {
            const existingIndex = prevItems.findIndex(item => item.id === entryWithStatus.id);
            if (existingIndex > -1) {
                const newItems = [...prevItems];
                newItems[existingIndex] = entryWithStatus;
                return newItems;
            } else {
                return [entryWithStatus, ...prevItems];
            }
        });
    };

    const applyFiltersFromModal = (newFilters) => { setFilters(newFilters); };

    return (
        <>
            <section className={styles.listSection}>
                <div className={styles.sectionHeader}>
                    <h2>상세 목록</h2>
                    <div className={styles.desktopFilters}>
                        <select name="manager" value={filters.manager} onChange={handleFilterChange}>
                            {filterOptions.managers.map(opt => <option key={opt} value={opt}>{opt === 'all' ? '담당자 전체' : opt}</option>)}
                        </select>
                        <select name="company" value={filters.company} onChange={handleFilterChange}>
                            {filterOptions.companies.map(opt => <option key={opt} value={opt}>{opt === 'all' ? '업체 전체' : opt}</option>)}
                        </select>
                        <select name="status" value={filters.status} onChange={handleFilterChange}>
                            {filterOptions.statuses.map(opt => (<option key={opt} value={opt}>{opt === 'all' && '상태 전체'}{opt === 'delayed' && '지연'}{opt === 'inProgress' && '진행중'}{opt === 'completed' && '완료'}</option>))}
                        </select>
                    </div>
                    {user && (
                        <button onClick={handleOpenAddModal} className={styles.desktopAddButton}>
                            <FaPlus size={12} /><span>추가</span>
                        </button>
                    )}
                    <div className={styles.mobileActions}>
                        <button className={styles.mobileButton} onClick={() => setIsFilterModalOpen(true)}><FaFilter size={12} /><span>필터</span></button>
                        {user && (
                            <button className={styles.mobileButton} onClick={handleOpenAddModal}>
                                <FaPlus size={12} /><span>추가</span>
                            </button>
                        )}
                    </div>
                </div>
                <table className={styles.inspectionTable}>
                    <thead>
                        <tr>
                            <th>담당자</th><th>업체명</th><th>개선항목</th><th>시작일</th><th>목표일</th><th>진행률</th><th>상태</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredItems.map((item) => (
                            <tr key={item.id} onClick={() => handleRowClick(item)} className={styles.clickableRow}>
                                <td>{item.manager}</td>
                                <td>{item.company}</td>
                                <td className={styles.improvementItem}>{item.improvementItem}</td>
                                <td>{item.startDate}</td>
                                <td>{item.endDate}</td>
                                <td><div className={styles.progressBarContainer}><div className={styles.progressBarWrapper}><div className={styles.progressBar} style={{ width: `${item.progress}%` }}></div></div><span>{item.progress}%</span></div></td>
                                <td><span className={`${styles.statusTag} ${styles[item.status]}`}>{item.status === 'inProgress' ? '진행중' : item.status === 'completed' ? '완료' : '지연'}</span></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <div className={styles.cardList}>
                    {filteredItems.map(item => (
                        <div key={item.id} className={styles.card} onClick={() => handleRowClick(item)}>
                            <div className={styles.cardRow}>
                                <div className={styles.cardItem}>
                                    <span className={styles.cardLabel}>개선항목</span>
                                    <span className={styles.cardValue}>{item.improvementItem}</span>
                                </div>
                                <div className={`${styles.cardItem} ${styles.alignRight}`}>
                                    <span className={`${styles.statusTag} ${styles[item.status]}`}>{item.status === 'inProgress' ? '진행중' : item.status === 'completed' ? '완료' : '지연'}</span>
                                </div>
                            </div>
                            <div className={styles.cardRow}>
                                <div className={styles.cardItem}>
                                    <span className={styles.cardLabel}>담당자</span>
                                    <span className={styles.cardValue}>{item.manager}</span>
                                </div>
                                <div className={`${styles.cardItem} ${styles.alignRight}`}>
                                    <span className={styles.cardLabel}>업체명</span>
                                    <span className={styles.cardValue}>{item.company}</span>
                                </div>
                            </div>
                            <div className={styles.cardRow}>
                                <div className={styles.cardItem}>
                                    <span className={styles.cardLabel}>목표일</span>
                                    <span className={styles.cardValue}>{item.endDate}</span>
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

            <section>
                {isAddModalOpen && user && (<AddQualityItemModal user={user} onClose={() => setIsAddModalOpen(false)} onSuccess={handleSuccess} />)}
                {isDetailModalOpen && (<QualityDetailModal item={selectedItem} user={user} onClose={() => setIsDetailModalOpen(false)} onSuccess={handleSuccess} />)}
                {isFilterModalOpen && (
                    <FilterModal
                        onClose={() => setIsFilterModalOpen(false)}
                        onApplyFilters={applyFiltersFromModal}
                        initialFilters={filters}
                        filterOptions={filterOptions}
                        type="quality"
                    />
                )}
            </section>
        </>
    );
}

export default QualityListSection;