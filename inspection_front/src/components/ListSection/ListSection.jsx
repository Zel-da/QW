// src/components/ListSection.jsx

import React, { useState, useEffect } from 'react';
import { getInspections } from '../../api/inspectionAPI.js';
import styles from './ListSection.module.css';
import { FaPlus } from 'react-icons/fa';
import AddInspectionModal from '../AddInspectionModal/AddInspectionModal.jsx';

function ListSection({ user }) {
    const [allInspections, setAllInspections] = useState([]);
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
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleOpenModal = () => {
        if (!user) {
            alert('로그인이 필요합니다.');
            return;
        }
        setIsModalOpen(true);
    };

    const handleSuccess = () => {
        // 데이터 추가/수정 성공 시, 목록을 다시 불러옴
        fetchData();
    };

    const fetchData = async () => {
        try {
            const data = await getInspections();
            setAllInspections(data);
            setFilteredInspections(data);

            // 데이터로부터 중복 없는 필터 옵션 목록을 동적으로 생성
            const usernames = [...new Set(data.map(item => item.username))];
            const company_names = [...new Set(data.map(item => item.company_name))];
            const product_names = [...new Set(data.map(item => item.product_name))];

            setFilterOptions(prevOptions => ({
                ...prevOptions,
                usernames: ['all', ...usernames],
                company_names: ['all', ...company_names],
                product_names: ['all', ...product_names],
            }));
        } catch (error) {
            console.error("Failed to fetch inspections:", error);
            setAllInspections([]);
        }
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

        if (filters.username !== 'all') {
            result = result.filter(item => item.username === filters.username);
        }
        if (filters.company_name !== 'all') {
            result = result.filter(item => item.company_name === filters.company_name);
        }
        if (filters.product_name !== 'all') {
            result = result.filter(item => item.product_name === filters.product_name);
        }

        setFilteredInspections(result);
    }, [filters, allInspections]);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prevFilters => ({
            ...prevFilters,
            [name]: value,
        }));
    };

    const getStatus = (item) => {
        if (item.progress_percentage === 100) return { text: '완료', className: styles.completed };
        if (new Date(item.target_date) < new Date()) return { text: '지연', className: styles.delayed };
        return { text: '진행중', className: styles.inProgress };
    };

    return (
        <>
            <section className={styles.listSection}>
                <div className={styles.sectionHeader}>
                    <h2>상세 목록</h2>
                    <div className={styles.filters}>
                        <select name="username" value={filters.username} onChange={handleFilterChange}>
                            {filterOptions.usernames.map(option => (
                                <option key={option} value={option}>{option === 'all' ? '담당자 전체' : option}</option>
                            ))}
                        </select>
                        <select name="company_name" value={filters.company_name} onChange={handleFilterChange}>
                            {filterOptions.company_names.map(option => (
                                <option key={option} value={option}>{option === 'all' ? '업체 전체' : option}</option>
                            ))}
                        </select>
                        <select name="product_name" value={filters.product_name} onChange={handleFilterChange}>
                            {filterOptions.product_names.map(option => (
                                <option key={option} value={option}>{option === 'all' ? '제품 전체' : option}</option>
                            ))}
                        </select>
                    </div>
                    <button onClick={handleOpenModal} className={styles.addButton}>
                        <FaPlus size={12} />
                        <span>새 검사</span>
                    </button>
                </div>

                <table className={styles.inspectionTable}>
                    <thead>
                        <tr>
                            <th>담당자</th>
                            <th>업체명</th>
                            <th>제품명</th>
                            <th>불량/검사 수량</th>
                            <th>불량사유</th>
                            <th>대처방안</th>
                            <th>목표일</th>
                            <th>진행률</th>
                            <th>상태</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredInspections.map((item) => {
                            const status = getStatus(item);
                            return (
                                <tr key={item.id}>
                                    <td>{item.username}</td>
                                    <td>{item.company_name}</td>
                                    <td>{item.product_name}</td>
                                    <td>{`${item.defective_quantity} / ${item.inspected_quantity}`}</td>
                                    <td>{item.defect_reason}</td>
                                    <td>{item.solution}</td>
                                    <td>{item.target_date}</td>
                                    <td>
                                        <div className={styles.progressBarContainer}>
                                            <div className={styles.progressBar} style={{ width: `${item.progress_percentage}%` }}></div>
                                            <span>{item.progress_percentage}%</span>
                                        </div>
                                    </td>
                                    <td>
                                        <span className={`${styles.statusTag} ${status.className}`}>
                                            {status.text}
                                        </span>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </section>

            {isModalOpen && user && (
                <AddInspectionModal
                    user={user}
                    onClose={() => setIsModalOpen(false)}
                    onSuccess={handleSuccess}
                />
            )}
        </>
    );
}

export default ListSection;