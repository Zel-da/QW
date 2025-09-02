import React, { useState, useEffect } from 'react';
import { getInspectionById } from '../../api/inspectionAPI.js';
import { calculateStatus, statusMap } from '../../utils';
import styles from './ListSection.module.css';
import { FaPlus } from 'react-icons/fa';
import AddInspectionModal from '../AddInspectionModal/AddInspectionModal.jsx';
import InspectionDetailModal from '../InspectionDetailModal/InspectionDetailModal.jsx';

function ListSection({ user, inspections, onSuccess }) { // inspections를 prop으로 받음
    const [filteredInspections, setFilteredInspections] = useState([]);
    const [filters, setFilters] = useState({
        username: 'all',
        company_name: 'all',
        product_name: 'all',
    });
    const [filterOptions, setFilterOptions] = useState({
        usernames: [],
        company_names: [],
        product_names: [],
    });

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [selectedInspection, setSelectedInspection] = useState(null);
    const [error, setError] = useState(null);

    // inspections 데이터가 변경될 때마다 필터 옵션을 채움
    useEffect(() => {
        const usernames = [...new Set(inspections.map(item => item.username))];
        const company_names = [...new Set(inspections.map(item => item.company_name))];
        const product_names = [...new Set(inspections.map(item => item.product_name))];
        setFilterOptions({
            usernames: ['all', ...usernames],
            company_names: ['all', ...company_names],
            product_names: ['all', ...product_names],
        });
    }, [inspections]);

    // 드롭다운 필터 적용
    useEffect(() => {
        let result = inspections;
        if (filters.username !== 'all') result = result.filter(item => item.username === filters.username);
        if (filters.company_name !== 'all') result = result.filter(item => item.company_name === filters.company_name);
        if (filters.product_name !== 'all') result = result.filter(item => item.product_name === filters.product_name);
        setFilteredInspections(result);
    }, [filters, inspections]);


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

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
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
                    </div>
                    <button onClick={handleOpenAddModal} className={styles.addButton}><FaPlus size={12} /><span>등록</span></button>
                </div>

                <table className={styles.inspectionTable}>
                    <thead>
                        <tr>
                            <th>담당자</th><th>업체명</th><th>제품명</th><th>검사/불량 수량</th><th>불량사유</th><th>대처방안</th><th>접수일</th><th>마감일</th><th>진행률</th><th>상태</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredInspections.map((item) => {
                            const calculatedStatusKey = calculateStatus(item.progress_percentage, item.target_date);
                            const statusInfo = statusMap[calculatedStatusKey] || {};
                            return (
                                <tr key={item.id} onClick={() => handleRowClick(item.id)} className={styles.clickableRow}>
                                    <td>{item.username}</td>
                                    <td>{item.company_name}</td>
                                    <td>{item.product_name}</td>
                                    <td>{`${item.inspected_quantity} / ${item.defective_quantity}`}</td>
                                    <td className={styles.truncate}>{item.defect_reason}</td>
                                    <td className={styles.truncate}>{item.solution}</td>
                                    <td>{item.received_date ? new Date(item.received_date).toLocaleDateString() : '-'}</td>
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
                <AddInspectionModal user={user} onClose={() => setIsAddModalOpen(false)} onSuccess={onSuccess} />
            )}

            {isDetailModalOpen && (
                <InspectionDetailModal user={user} item={selectedInspection} onClose={() => setIsDetailModalOpen(false)} onUpdate={onSuccess} />
            )}
        </>
    );
}

export default ListSection;