import React, { useState, useEffect } from 'react';
import { getInspections, getInspectionById } from '../../api/inspectionAPI.js';
import styles from './ListSection.module.css';
import { FaPlus } from 'react-icons/fa';
import AddInspectionModal from '../AddInspectionModal/AddInspectionModal.jsx';
import InspectionDetailModal from '../InspectionDetailModal/InspectionDetailModal.jsx';

function ListSection({ user }) {
    const [allInspections, setAllInspections] = useState([]);
    const [filteredInspections, setFilteredInspections] = useState([]);
    const [filters, setFilters] = useState({
        username: 'all',
        company_name: 'all',
        product_name: 'all',
        status: 'all',
    });
    const [filterOptions, setFilterOptions] = useState({
        usernames: [],
        company_names: [],
        product_names: [],
        statuses: ['all', 'inProgress', 'completed', 'delayed'],
    });

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [selectedInspection, setSelectedInspection] = useState(null);
    const [error, setError] = useState(null);

    const handleOpenAddModal = () => {
        if (!user) {
            alert('로그인이 필요합니다.');
            return;
        }
        setIsAddModalOpen(true);
    };

    const handleRowClick = async (id) => {
        try {
            const data = await getInspectionById(id);
            setSelectedInspection(data);
            setIsDetailModalOpen(true);
        } catch (err) {
            setError(err.message);
            alert(`상세 정보를 불러오는 데 실패했습니다: ${err.message}`);
        }
    };

    const fetchData = async () => {
        try {
            const data = await getInspections();
            setAllInspections(data);
            const usernames = [...new Set(data.map(item => item.username))];
            const company_names = [...new Set(data.map(item => item.company_name))];
            const product_names = [...new Set(data.map(item => item.product_name))];
            setFilterOptions(prev => ({ ...prev, usernames: ['all', ...usernames], company_names: ['all', ...company_names], product_names: ['all', ...product_names] }));
        } catch (err) {
            console.error("Failed to fetch inspections:", err);
            setError(err.message);
            setAllInspections([]);
        }
    };

    const handleSuccess = () => {
        fetchData();
    };

    useEffect(() => {
        if (user) {
            fetchData();
        } else {
            setAllInspections([]);
        }
    }, [user]);

    useEffect(() => {
        let result = allInspections;
        if (filters.username !== 'all') result = result.filter(item => item.username === filters.username);
        if (filters.company_name !== 'all') result = result.filter(item => item.company_name === filters.company_name);
        if (filters.product_name !== 'all') result = result.filter(item => item.product_name === filters.product_name);
        if (filters.status !== 'all') result = result.filter(item => item.status === filters.status); // Simplified status filter
        setFilteredInspections(result);
    }, [filters, allInspections]);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
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
                    <div className={styles.filters}>
                        <select name="username" value={filters.username} onChange={handleFilterChange}>{filterOptions.usernames.map(o => (<option key={o} value={o}>{o === 'all' ? '담당자 전체' : o}</option>))}</select>
                        <select name="company_name" value={filters.company_name} onChange={handleFilterChange}>{filterOptions.company_names.map(o => (<option key={o} value={o}>{o === 'all' ? '업체 전체' : o}</option>))}</select>
                        <select name="product_name" value={filters.product_name} onChange={handleFilterChange}>{filterOptions.product_names.map(o => (<option key={o} value={o}>{o === 'all' ? '제품 전체' : o}</option>))}</select>
                        <select name="status" value={filters.status} onChange={handleFilterChange}>{filterOptions.statuses.map(o => (<option key={o} value={o}>{o === 'all' ? '상태 전체' : (statusMap[o]?.text || o)}</option>))}</select>
                    </div>
                    <button onClick={handleOpenAddModal} className={styles.addButton}><FaPlus size={12} /><span>새 검사</span></button>
                </div>

                {error && <p className={styles.error}>데이터 로딩 실패: {error}</p>}

                <table className={styles.inspectionTable}>
                    <thead>
                        <tr>
                            <th>담당자</th><th>업체명</th><th>제품명</th><th>불량/검사 수량</th><th>불량사유</th><th>대처방안</th><th>목표일</th><th>진행률</th><th>상태</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredInspections.map((item) => {
                            const statusInfo = statusMap[item.status] || {};
                            return (
                                <tr key={item.id} onClick={() => handleRowClick(item.id)} className={styles.clickableRow}>
                                    <td>{item.username}</td>
                                    <td>{item.company_name}</td>
                                    <td>{item.product_name}</td>
                                    <td>{`${item.defective_quantity} / ${item.inspected_quantity}`}</td>
                                    <td className={styles.truncate}>{item.defect_reason}</td>
                                    <td className={styles.truncate}>{item.solution}</td>
                                    <td>{item.target_date ? new Date(item.target_date).toLocaleDateString() : '-'}</td>
                                    <td>
                                        <div className={styles.progressBarContainer}>
                                            <div className={styles.progressBar} style={{ width: `${item.progress_percentage}%` }}></div>
                                            <span>{item.progress_percentage}%</span>
                                        </div>
                                    </td>
                                    <td><span className={`${styles.statusTag} ${statusInfo.className}`}>{statusInfo.text}</span></td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </section>

            {isAddModalOpen && user && (
                <AddInspectionModal user={user} onClose={() => setIsAddModalOpen(false)} onSuccess={handleSuccess} />
            )}

            {isDetailModalOpen && (
                <InspectionDetailModal item={selectedInspection} onClose={() => setIsDetailModalOpen(false)} />
            )}
        </>
    );
}

export default ListSection;