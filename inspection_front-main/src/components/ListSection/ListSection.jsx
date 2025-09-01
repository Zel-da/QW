// src/components/ListSection/ListSection.jsx

import React, { useState, useEffect } from 'react';
import { getInspections } from '../../api/inspectionAPI.js';
import styles from './ListSection.module.css';
import { FaPlus } from 'react-icons/fa';
import AddInspectionModal from '../AddInspectionModal/AddInspectionModal.jsx';
import InspectionDetailModal from '../InspectionDetailModal/InspectionDetailModal.jsx';

// 1. props에서 inspections, onSuccess를 제거합니다.
function ListSection({ user }) {
    // 2. 데이터 관리 state들을 다시 ListSection 내부에서 선언합니다.
    const [allInspections, setAllInspections] = useState([]);
    const [filteredInspections, setFilteredInspections] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);

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

    // 3. 데이터 로딩 useEffect를 다시 ListSection 내부에서 실행합니다.
    useEffect(() => {
        const fetchData = async () => {
            const data = await getInspections();
            setAllInspections(data);
        };
        fetchData();
    }, []); // 처음 마운트될 때 한 번만 데이터를 불러옵니다.

    // 필터링 로직은 allInspections state를 기준으로 작동합니다.
    useEffect(() => {
        let result = allInspections;
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

        if (allInspections.length > 0) {
            const managers = [...new Set(allInspections.map(item => item.manager))];
            const companies = [...new Set(allInspections.map(item => item.company))];
            const partNames = [...new Set(allInspections.map(item => item.partName))];
            setFilterOptions(prev => ({
                ...prev,
                managers: ['all', ...managers],
                companies: ['all', ...companies],
                partNames: ['all', ...partNames],
            }));
        }
    }, [filters, allInspections]);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const handleOpenModal = () => {
        if (!user) {
            alert('로그인이 필요합니다.');
            return;
        }
        setIsModalOpen(true);
    };

    // 4. 새 항목 추가 성공 시 ListSection의 state를 직접 업데이트하는 함수를 다시 만듭니다.
    const handleSuccess = (updatedOrNewEntry) => {
        setAllInspections(prevInspections => {
            // 전달받은 데이터에 id가 있고, 기존 목록에도 해당 id가 있는지 확인
            const existingIndex = prevInspections.findIndex(item => item.id === updatedOrNewEntry.id);

            if (existingIndex > -1) {
                // id가 존재하면 '수정' 로직 수행
                const newInspections = [...prevInspections];
                newInspections[existingIndex] = updatedOrNewEntry; // 기존 항목을 새 데이터로 교체
                return newInspections;
            } else {
                // id가 없거나 새 id이면 '추가' 로직 수행
                return [updatedOrNewEntry, ...prevInspections];
            }
        });
        // KPI 데이터도 다시 불러오도록 트리거가 필요하다면, 이 부분은 InspectionDashboard로 옮겨야 합니다.
    };

    const handleRowClick = (item) => {
        setSelectedItem(item);
        setIsDetailModalOpen(true);
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
                            <th>조치방법</th>
                            <th>목표일</th>
                            <th>진행률</th>
                            <th>상태</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredInspections.map((item, index) => (
                            <tr key={index} onClick={() => handleRowClick(item)} className={styles.clickableRow}>
                                <td>{item.manager}</td>
                                <td>{item.company}</td>
                                <td>{item.partName}</td>
                                <td>{`${item.defectCount}/${item.totalCount}`}</td>
                                <td>{item.reason}</td>
                                <td>{item.solution}</td>
                                <td>{item.dueDate}</td>
                                <td>
                                    <div className={styles.progressBarContainer}>
                                        <div className={styles.progressBarWrapper}> {/* 새로운 래퍼 추가 */}
                                            <div className={styles.progressBar} style={{ width: `${item.progress}%` }}></div>
                                        </div>
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

            {isDetailModalOpen && (
                <InspectionDetailModal
                    item={selectedItem}
                    user={user}
                    onClose={() => setIsDetailModalOpen(false)}
                    onSuccess={handleSuccess}
                />
            )}

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