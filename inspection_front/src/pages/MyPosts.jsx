import React, { useState, useEffect, useCallback } from 'react';
import { getMyInspections, deleteInspection } from '../api/inspectionAPI';
import qualityApi from '../api/qualityApi';
import styles from './MyPosts.module.css';

import EditInspectionModal from '../components/EditInspectionModal/EditInspectionModal.jsx';
import EditQualityItemModal from '../components/EditQualityItemModal/EditQualityItemModal.jsx';

// --- Pagination Component ---
const Pagination = ({ currentPage, pageCount, onPageChange }) => {
    if (pageCount <= 1) return null;
    return (
        <div className={styles.pagination}>
            <button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1} className={styles.pageButton}>이전</button>
            {Array.from({ length: pageCount }, (_, index) => (
                <button
                    key={index + 1}
                    onClick={() => onPageChange(index + 1)}
                    className={`${styles.pageButton} ${currentPage === index + 1 ? styles.active : ''}`}>
                    {index + 1}
                </button>
            ))}
            <button onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === pageCount} className={styles.pageButton}>다음</button>
        </div>
    );
};

// --- Inspections Table Component ---
const MyInspectionsTable = ({ inspections, onEdit, onDelete, currentPage, setCurrentPage }) => {
    const itemsPerPage = 10;
    const pageCount = Math.ceil(inspections.length / itemsPerPage);
    const paginatedInspections = inspections.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    if (inspections.length === 0) {
        return <p className={styles.message}>작성한 출장검사 내역이 없습니다.</p>;
    }
    return (
        <>
            <table className={styles.table}>
                <thead><tr><th>업체명</th><th>품명</th><th>검수 수량</th><th>불량 수량</th><th>수정일</th><th>조치</th></tr></thead>
                <tbody>
                    {paginatedInspections.map((post) => (
                        <tr key={post.id}>
                            <td>{post.company_name}</td>
                            <td>{post.product_name}</td>
                            <td>{post.inspected_quantity}</td>
                            <td>{post.defective_quantity}</td>
                            <td>{post.updated_at ? new Date(post.updated_at).toLocaleDateString() : new Date(post.created_at).toLocaleDateString()}</td>
                            <td>
                                <button className={`${styles.button} ${styles.editButton}`} onClick={() => onEdit(post)}>수정</button>
                                <button className={`${styles.button} ${styles.deleteButton}`} onClick={() => onDelete(post.id)}>삭제</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <Pagination currentPage={currentPage} pageCount={pageCount} onPageChange={setCurrentPage} />
        </>
    );
};

// --- Quality Improvements Table Component ---
const MyQualityTable = ({ items, onEdit, onDelete, currentPage, setCurrentPage }) => {
    const itemsPerPage = 10;
    const pageCount = Math.ceil(items.length / itemsPerPage);
    const paginatedItems = items.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    if (items.length === 0) {
        return <p className={styles.message}>작성한 품질 개선 제안이 없습니다.</p>;
    }
    return (
        <>
            <table className={styles.table}>
                <thead><tr><th>개선항목</th><th>업체명</th><th>상태</th><th>수정일</th><th>조치</th></tr></thead>
                <tbody>
                    {paginatedItems.map((item) => (
                        <tr key={item.id}>
                            <td>{item.item_description}</td>
                            <td>{item.company_name}</td>
                            <td>{item.status}</td>
                            <td>{item.updated_at ? new Date(item.updated_at).toLocaleDateString() : new Date(item.created_at).toLocaleDateString()}</td>
                            <td>
                                <button className={`${styles.button} ${styles.editButton}`} onClick={() => onEdit(item)}>수정</button>
                                <button className={`${styles.button} ${styles.deleteButton}`} onClick={() => onDelete(item.id)}>삭제</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <Pagination currentPage={currentPage} pageCount={pageCount} onPageChange={setCurrentPage} />
        </>
    );
};

// --- Main MyPosts Page Component ---
const MyPosts = () => {
    const [inspections, setInspections] = useState([]);
    const [qualityItems, setQualityItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // State for pagination
    const [inspectionsPage, setInspectionsPage] = useState(1);
    const [qualityPage, setQualityPage] = useState(1);

    // State for modals
    const [editingItem, setEditingItem] = useState(null);
    const [isEditInspectionModalOpen, setIsEditInspectionModalOpen] = useState(false);
    const [isEditQualityModalOpen, setIsEditQualityModalOpen] = useState(false);

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const [inspectionsData, qualityData] = await Promise.all([
                getMyInspections(),
                qualityApi.getMyQualityImprovements()
            ]);
            setInspections(inspectionsData);
            setQualityItems(qualityData);
            setError(null);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // --- Edit Handlers ---
    const handleEditInspection = (inspection) => {
        setEditingItem(inspection);
        setIsEditInspectionModalOpen(true);
    };

    const handleEditQualityItem = (item) => {
        setEditingItem(item);
        setIsEditQualityModalOpen(true);
    };

    const handleUpdateSuccess = () => {
        setEditingItem(null);
        setIsEditInspectionModalOpen(false);
        setIsEditQualityModalOpen(false);
        fetchData(); // Refresh data after update
    };

    // --- Delete Handlers ---
    const handleDeleteInspection = async (id) => {
        if (window.confirm('정말로 이 항목을 삭제하시겠습니까?')) {
            try {
                await deleteInspection(id);
                fetchData(); // Refresh data
            } catch (err) {
                alert(`삭제 실패: ${err.message}`);
            }
        }
    };

    const handleDeleteQualityItem = async (id) => {
        if (window.confirm('정말로 이 항목을 삭제하시겠습니까?')) {
            try {
                await qualityApi.deleteQualityImprovement(id);
                fetchData(); // Refresh data
            } catch (err) {
                alert(`삭제 실패: ${err.message}`);
            }
        }
    };

    if (loading) {
        return <div className={styles.message}>로딩 중...</div>;
    }

    if (error) {
        return <div className={`${styles.message} ${styles.error}`}>오류: {error}</div>;
    }

    return (
        <>
            <div className={styles.container}>
                <h1 className={styles.title}>작성 내역</h1>
                
                <div className={styles.section}>
                    <h2 className={styles.sectionTitle}>나의 출장검사 현황</h2>
                    <MyInspectionsTable 
                        inspections={inspections} 
                        onEdit={handleEditInspection} 
                        onDelete={handleDeleteInspection} 
                        currentPage={inspectionsPage} 
                        setCurrentPage={setInspectionsPage} 
                    />
                </div>

                <div className={styles.section}>
                    <h2 className={styles.sectionTitle}>나의 품질 개선 제안</h2>
                    <MyQualityTable 
                        items={qualityItems} 
                        onEdit={handleEditQualityItem} 
                        onDelete={handleDeleteQualityItem} 
                        currentPage={qualityPage} 
                        setCurrentPage={setQualityPage} 
                    />
                </div>
            </div>

            {isEditInspectionModalOpen && (
                <EditInspectionModal
                    item={editingItem}
                    onClose={() => setIsEditInspectionModalOpen(false)}
                    onSuccess={handleUpdateSuccess}
                />
            )}

            {isEditQualityModalOpen && (
                <EditQualityItemModal
                    item={editingItem}
                    onClose={() => setIsEditQualityModalOpen(false)}
                    onSuccess={handleUpdateSuccess}
                />
            )}
        </>
    );
};

export default MyPosts;