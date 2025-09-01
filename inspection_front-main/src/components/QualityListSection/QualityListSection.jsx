// src/components/QualityListSection/QualityListSection.jsx

import React, { useState, useEffect } from 'react';
import { getQualityItems } from '../../api/qualityApi.js';
import AddQualityItemModal from '../AddQualityItemModal/AddQualityItemModal.jsx';
import styles from './QualityListSection.module.css'; // 전용 CSS 모듈 사용
import { FaPlus } from 'react-icons/fa';
import QualityDetailModal from '../QualityDetailModal/QualityDetailModal.jsx';

function QualityListSection({ user }) {
    const [allItems, setAllItems] = useState([]);
    const [filteredItems, setFilteredItems] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [filters, setFilters] = useState({ manager: 'all', company: 'all', status: 'all' });
    const [filterOptions, setFilterOptions] = useState({ managers: [], companies: [], statuses: ['all', 'delayed', 'inProgress', 'completed'] });

    const getStatus = (item) => { if (item.progress === 100) return 'completed'; if (new Date(item.endDate) < new Date() && item.progress < 100) return 'delayed'; return 'inProgress'; };

    useEffect(() => {
        const fetchData = async () => {
            const data = await getQualityItems();
            setAllItems(data);
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

    const handleOpenModal = () => { if (!user) { alert('로그인이 필요합니다.'); return; } setIsModalOpen(true); };


    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const handleRowClick = (item) => {
        setSelectedItem(item);
        setIsDetailModalOpen(true);
    };

    const handleSuccess = (updatedOrNewEntry) => {
        const getStatus = (item) => { if (item.progress === 100) return 'completed'; if (new Date(item.endDate) < new Date() && item.progress < 100) return 'delayed'; return 'inProgress'; };
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


    return (
        <>
            <section className={styles.listSection}>
                <div className={styles.sectionHeader}>
                    <h2>상세 목록</h2>
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
                    <button onClick={handleOpenModal} className={styles.addButton}><FaPlus size={12} /><span>새 개선 항목</span></button>
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
                        {filteredItems.map((item) => (
                            <tr key={item.id} onClick={() => handleRowClick(item)} className={styles.clickableRow}>
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

            {/* '새 개선 항목' 등록 모달 */}
            {isModalOpen && user && (
                <AddQualityItemModal
                    user={user}
                    onClose={() => setIsModalOpen(false)}
                    onSuccess={handleSuccess}
                />
            )}

            {/* 상세 정보 보기 모달 */}
            {isDetailModalOpen && (
                <QualityDetailModal
                    item={selectedItem}
                    user={user}
                    onClose={() => setIsDetailModalOpen(false)}
                    onSuccess={handleSuccess}
                />
            )}
        </>
    );
}

export default QualityListSection;