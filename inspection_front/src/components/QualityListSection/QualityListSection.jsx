import React, { useState, useEffect } from 'react';
import styles from './QualityListSection.module.css';
import { FaPlus, FaFilter } from 'react-icons/fa';
import AddQualityItemModal from '../AddQualityItemModal/AddQualityItemModal.jsx';
import QualityDetailModal from '../QualityDetailModal/QualityImprovementDetailModal.jsx';
import FilterModal from '../FilterModal/FilterModal.jsx';
import { calculateStatus, statusMap } from '../../utils';

function QualityListSection({ user, items, onRowClick, onAddSuccess }) {
    const [filteredItems, setFilteredItems] = useState([]);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [filters, setFilters] = useState({ username: 'all', company_name: 'all', status: 'all' });
    const [filterOptions, setFilterOptions] = useState({ usernames: [], company_names: [], statuses: ['all', 'delayed', 'inProgress', 'completed'] });

    useEffect(() => {
        const processedData = items.map(item => ({
            ...item,
            status: calculateStatus(item)
        }));

        let result = processedData;
        if (filters.username !== 'all') result = result.filter(item => item.username === filters.username);
        if (filters.company_name !== 'all') result = result.filter(item => item.company_name === filters.company_name);
        if (filters.status !== 'all') result = result.filter(item => item.status === filters.status);
        setFilteredItems(result);

        if (items.length > 0) {
            const usernames = [...new Set(items.map(item => item.username))];
            const company_names = [...new Set(items.map(item => item.company_name))];
            setFilterOptions(prev => ({ ...prev, usernames: ['all', ...usernames], company_names: ['all', ...company_names] }));
        }
    }, [filters, items]);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const handleOpenAddModal = () => { if (!user) { alert('로그인이 필요합니다.'); return; } setIsAddModalOpen(true); };
    const handleRowClick = (item) => { setSelectedItem(item); setIsDetailModalOpen(true); };

    const applyFiltersFromModal = (newFilters) => { setFilters(newFilters); };

    return (
        <>
            <section className={styles.listSection}>
                <div className={styles.sectionHeader}>
                    <h2>상세 목록</h2>
                    <div className={styles.desktopFilters}>
                        <select name="username" value={filters.username} onChange={handleFilterChange}>
                            {filterOptions.usernames.map(opt => <option key={opt} value={opt}>{opt === 'all' ? '담당자 전체' : opt}</option>)}
                        </select>
                        <select name="company_name" value={filters.company_name} onChange={handleFilterChange}>
                            {filterOptions.company_names.map(opt => <option key={opt} value={opt}>{opt === 'all' ? '업체 전체' : opt}</option>)}
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
                                <td>{item.username}</td>
                                <td>{item.company_name}</td>
                                <td className={styles.improvementItem}>{item.item_description}</td>
                                <td>{new Date(item.start_date).toLocaleDateString()}</td>
                                <td>{item.end_date ? new Date(item.end_date).toLocaleDateString() : '-'}</td>
                                <td><div className={styles.progressBarContainer}><div className={styles.progressBarWrapper}><div className={styles.progressBar} style={{ width: `${item.progress}%` }}></div></div><span>{item.progress}%</span></div></td>
                                <td><span className={`${styles.statusTag} ${styles[item.status]}`}>{statusMap[item.status]?.text}</span></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <div className={styles.cardList}>
                    {filteredItems.map(item => (
                        <div key={item.id} className={styles.card} onClick={() => handleRowClick(item)}>
                            <div className={styles.cardRow}>
                                <div className={styles.cardItem}>
                                    <span className={styles.cardLabel}>담당자</span>
                                    <span className={styles.cardValue}>{item.username}</span>
                                </div>
                                <div className={`${styles.cardItem} ${styles.alignRight}`}>
                                    <span className={`${styles.statusTag} ${styles[item.status]}`}>{statusMap[item.status]?.text}</span>
                                </div>
                            </div>
                            <div className={styles.cardRow}>
                                <div className={styles.cardItem}>
                                    <span className={styles.cardLabel}>업체명</span>
                                    <span className={styles.cardValue}>{item.company_name}</span>
                                </div>
                                <div className={`${styles.cardItem} ${styles.alignRight}`}>
                                    <span className={styles.cardLabel}>개선항목</span>
                                    <span className={styles.cardValue}>{item.item_description}</span>
                                </div>
                            </div>
                            <div className={styles.cardRow}>
                                <div className={styles.cardItem}>
                                    <span className={styles.cardLabel}>목표일</span>
                                    <span className={styles.cardValue}>{item.end_date ? new Date(item.end_date).toLocaleDateString() : '-'}</span>
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

            {isAddModalOpen && user && (<AddQualityItemModal user={user} onClose={() => setIsAddModalOpen(false)} onSuccess={onAddSuccess} />)}
            {isDetailModalOpen && (<QualityDetailModal item={selectedItem} user={user} onClose={() => setIsDetailModalOpen(false)} onUpdate={onAddSuccess} />)}
            {isFilterModalOpen && (
                <FilterModal
                    onClose={() => setIsFilterModalOpen(false)}
                    onApplyFilters={applyFiltersFromModal}
                    initialFilters={filters}
                    filterOptions={filterOptions}
                    type="quality"
                />
            )}
        </>
    );
}

export default QualityListSection;