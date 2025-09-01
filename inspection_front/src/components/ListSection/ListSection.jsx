// src/components/ListSection.jsx

import React, { useState, useEffect } from 'react';
import { getInspections } from '../../api/inspectionAPI.js';
import styles from './ListSection.module.css';
import { FaPlus } from 'react-icons/fa';
import AddInspectionModal from '../AddInspectionModal/AddInspectionModal.jsx';

function ListSection({ user }) {
    // --- State 선언 ---
    const [allInspections, setAllInspections] = useState([]);
    const [filteredInspections, setFilteredInspections] = useState([]);
    const [filters, setFilters] = useState({
        manager: 'all',
        company: 'all',
        partName: 'all',
        status: 'all',
    });
    const [filterOptions, setFilterOptions] = useState({
        managers: [],
        companies: [],
        partNames: [],
        statuses: ['all', 'delayed', 'inProgress', 'completed'],
    });
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleOpenModal = () => {
        if (!user) {
            alert('로그인이 필요합니다.');
            return;
        }
        setIsModalOpen(true);
    };

    const handleSuccess = (newEntry) => {
        // 새 항목이 추가되면, 전체 목록과 현재 필터링된 목록 모두에 반영
        setAllInspections(prev => [newEntry, ...prev]);
    };


    // --- 데이터 로딩 및 필터 옵션 생성 ---
    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await getInspections();
                setAllInspections(data);
                setFilteredInspections(data);

                // 데이터로부터 중복 없는 필터 옵션 목록을 동적으로 생성
                const managers = [...new Set(data.map(item => item.manager))];
                const companies = [...new Set(data.map(item => item.company))];
                const partNames = [...new Set(data.map(item => item.partName))];

                setFilterOptions(prevOptions => ({
                    ...prevOptions,
                    managers: ['all', ...managers],
                    companies: ['all', ...companies],
                    partNames: ['all', ...partNames],
                }));
            } catch (error) {
                console.error("Failed to fetch inspections:", error);
                setAllInspections([]); // Clear data on error
            }
        };

        // 로그인 상태일 때만 데이터를 가져옴
        if (user) {
            fetchData();
        } else {
            // 로그아웃 상태이면 목록을 비움
            setAllInspections([]);
        }
    }, [user]); // user 상태가 변경될 때마다 (로그인/로그아웃 시) 이 효과가 다시 실행됨

    // --- 필터링 로직 ---
    useEffect(() => {
        let result = allInspections;

        // 각 필터 조건에 따라 순차적으로 데이터를 필터링
        if (filters.manager !== 'all') {
            result = result.filter(item => item.manager === filters.manager);
        }
        if (filters.company !== 'all') {
            result = result.filter(item => item.company === filters.company);
        }
        if (filters.partName !== 'all') {
            result = result.filter(item => item.partName === filters.partName);
        }
        if (filters.status !== 'all') {
            result = result.filter(item => item.status === filters.status);
        }

        setFilteredInspections(result);
    }, [filters, allInspections]); // filters나 allInspections가 변경될 때마다 실행

    // 필터 값이 변경될 때 호출될 함수
    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prevFilters => ({
            ...prevFilters,
            [name]: value,
        }));
    };

    return (
        <>
            <section className={styles.listSection}>
                <div className={styles.sectionHeader}>
                    <h2>상세 목록</h2>

                    <div className={styles.filters}>
                        <select name="manager" value={filters.manager} onChange={handleFilterChange}>
                            {filterOptions.managers.map(option => (
                                <option key={option} value={option}>{option === 'all' ? '담당자 전체' : option}</option>
                            ))}
                        </select>
                        <select name="company" value={filters.company} onChange={handleFilterChange}>
                            {filterOptions.companies.map(option => (
                                <option key={option} value={option}>{option === 'all' ? '업체 전체' : option}</option>
                            ))}
                        </select>
                        <select name="partName" value={filters.partName} onChange={handleFilterChange}>
                            {filterOptions.partNames.map(option => (
                                <option key={option} value={option}>{option === 'all' ? '부품 전체' : option}</option>
                            ))}
                        </select>
                        <select name="status" value={filters.status} onChange={handleFilterChange}>
                            {filterOptions.statuses.map(option => (
                                <option key={option} value={option}>
                                    {option === 'all' && '상태 전체'}
                                    {option === 'delayed' && '지연'}
                                    {option === 'inProgress' && '진행중'}
                                    {option === 'completed' && '완료'}
                                </option>
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
                            <th>부품명</th>
                            <th>불량개수/검사개수</th>
                            <th>불량사유</th>
                            <th>대처방안</th>
                            <th>목표일</th>
                            <th>진행률</th>
                            <th>상태</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredInspections.map((item, index) => (
                            <tr key={index}>
                                <td>{item.manager}</td>
                                <td>{item.company}</td>
                                <td>{item.partName}</td>
                                <td>{`${item.defectCount}/${item.totalCount}`}</td>
                                <td>{item.reason}</td>
                                <td>{item.solution}</td>
                                <td>{item.dueDate}</td>
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

            {/* '새 검사' 모달을 조건부로 렌더링하는 부분 */}
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