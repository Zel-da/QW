import React, { useState, useEffect } from 'react';
import styles from './ListSection.module.css';
import { FaPlus, FaFilter } from 'react-icons/fa';
import AddInspectionModal from '../AddInspectionModal/AddInspectionModal.jsx';
import InspectionDetailModal from '../InspectionDetailModal/InspectionDetailModal.jsx';
import FilterModal from '../FilterModal/FilterModal.jsx';
import { calculateStatus, statusMap } from '../../utils';

function ListSection({ user, inspections, onSuccess, currentPage, setCurrentPage }) {
    const [filteredInspections, setFilteredInspections] = useState([]);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [filters, setFilters] = useState({ username: 'all', company_name: 'all', product_name: 'all', status: 'all' });
    const [filterOptions, setFilterOptions] = useState({ usernames: [], company_names: [], product_names: [], statuses: ['all', 'delayed', 'inProgress', 'completed'] });

    useEffect(() => {
        const processedData = inspections.map(item => ({
            ...item,
            status: calculateStatus(item)
        }));

        let result = processedData;
        if (filters.username !== 'all') result = result.filter(item => item.username === filters.username);
        if (filters.company_name !== 'all') result = result.filter(item => item.company_name === filters.company_name);
        if (filters.product_name !== 'all') result = result.filter(item => item.product_name === filters.product_name);
        if (filters.status !== 'all') result = result.filter(item => item.status === filters.status);
        setFilteredInspections(result);

        if (inspections.length > 0) {
            const usernames = [...new Set(inspections.map(item => item.username))];
            const company_names = [...new Set(inspections.map(item => item.company_name))];
            const product_names = [...new Set(inspections.map(item => item.product_name))];
            setFilterOptions(prev => ({ ...prev, usernames: ['all', ...usernames], company_names: ['all', ...company_names], product_names: ['all', ...product_names] }));
        }
    }, [filters, inspections]);

    // --- 페이지네이션 로직 ---
    const itemsPerPage = 10;
    const pageCount = Math.ceil(filteredInspections.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const paginatedInspections = filteredInspections.slice(indexOfFirstItem, indexOfLastItem);

    const handlePageChange = (pageNumber) => {
        if (pageNumber > 0 && pageNumber <= pageCount) {
            setCurrentPage(pageNumber);
        }
    };
    // --- 페이지네이션 로직 끝 ---

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
        setCurrentPage(1); // 필터 변경 시 1페이지로 리셋
    };

    const handleOpenAddModal = () => {
        if (!user) { alert('로그인이 필요합니다.'); return; }
        setIsAddModalOpen(true);
    };

    const handleRowClick = (item) => {
        setSelectedItem(item);
        setIsDetailModalOpen(true);
    };

    const applyFiltersFromModal = (newFilters) => {
        setFilters(newFilters);
        setCurrentPage(1); // 필터 변경 시 1페이지로 리셋
    };

    return (
        <>
            <section className={styles.listSection}>
                <div className={styles.sectionHeader}>
                    <h2>상세 목록</h2>

                    <div className={styles.desktopFilters}>
                        <select name="username" value={filters.username} onChange={handleFilterChange}>
                            {filterOptions.usernames.map(option => (<option key={option} value={option}>{option === 'all' ? '담당자 전체' : option}</option>))}
                        </select>
                        <select name="company_name" value={filters.company_name} onChange={handleFilterChange}>
                            {filterOptions.company_names.map(option => (<option key={option} value={option}>{option === 'all' ? '업체 전체' : option}</option>))}
                        </select>
                        <select name="product_name" value={filters.product_name} onChange={handleFilterChange}>
                            {filterOptions.product_names.map(option => (<option key={option} value={option}>{option === 'all' ? '부품 전체' : option}</option>))}
                        </select>
                        <select name="status" value={filters.status} onChange={handleFilterChange}>
                            {filterOptions.statuses.map(option => (<option key={option} value={option}>{option === 'all' && '상태 전체'}{option === 'delayed' && '지연'}{option === 'inProgress' && '진행중'}{option === 'completed' && '완료'}</option>))}
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
                            <th>담당자</th><th>업체명</th><th>제품명</th><th>검사/불량 수량</th><th>불량사유</th><th>대처방안</th><th>접수일</th><th>마감일</th><th>진행률</th><th>상태</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedInspections.map((item) => (
                            <tr key={item.id} onClick={() => handleRowClick(item)} className={styles.clickableRow}>
                                <td>{item.username}</td>
                                <td>{item.company_name}</td>
                                <td>{item.product_name}</td>
                                <td>{`${item.inspected_quantity} / ${item.defective_quantity}`}</td>
                                <td className={styles.truncate}>{item.defect_reason}</td>
                                <td className={styles.truncate}>{item.solution}</td>
                                <td>{item.received_date ? new Date(item.received_date).toLocaleDateString() : '-'}</td>
                                <td>{item.target_date ? new Date(item.target_date).toLocaleDateString() : '-'}</td>
                                <td><div className={styles.progressBarContainer}><div className={styles.progressBarWrapper}><div className={styles.progressBar} style={{ width: `${item.progress_percentage}%` }}></div></div><span>{item.progress_percentage}%</span></div></td>
                                <td><span className={`${styles.statusTag} ${styles[item.status]}`}>{statusMap[item.status]?.text}</span></td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                <div className={styles.cardList}>
                    {paginatedInspections.map(item => (
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
                                    <span className={styles.cardLabel}>제품명</span>
                                    <span className={styles.cardValue}>{item.product_name}</span>
                                </div>
                            </div>
                            <div className={styles.cardRow}>
                                <div className={styles.cardItem}>
                                    <span className={styles.cardLabel}>목표기간</span>
                                    <span className={styles.cardValue}>{item.target_date ? new Date(item.target_date).toLocaleDateString() : '-'}</span>
                                </div>
                                <div className={`${styles.cardItem} ${styles.alignRight}`}>
                                    <span className={styles.cardLabel}>진행률</span>
                                    <span className={styles.cardValue}>{item.progress_percentage}%</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {pageCount > 1 && (
                    <div className={styles.pagination}>
                        <button
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className={styles.pageButton}
                        >
                            이전
                        </button>
                        {Array.from({ length: pageCount }, (_, index) => (
                            <button
                                key={index + 1}
                                onClick={() => handlePageChange(index + 1)}
                                className={`${styles.pageButton} ${currentPage === index + 1 ? styles.active : ''}`}
                            >
                                {index + 1}
                            </button>
                        ))}
                        <button
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === pageCount}
                            className={styles.pageButton}
                        >
                            다음
                        </button>
                    </div>
                )}
            </section>

            {isDetailModalOpen && (<InspectionDetailModal user={user} item={selectedItem} onClose={() => setIsDetailModalOpen(false)} onUpdate={onSuccess} />)}
            {isAddModalOpen && user && (<AddInspectionModal user={user} onClose={() => setIsAddModalOpen(false)} onSuccess={onSuccess} />)}
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