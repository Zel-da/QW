import React, { useState, useEffect } from 'react';
import styles from './FilterModal.module.css';

// ▼▼▼ 1. props에 type 추가 (기본값 'inspection') ▼▼▼
function FilterModal({ onClose, onApplyFilters, initialFilters, filterOptions, type = 'inspection' }) {
    const [localFilters, setLocalFilters] = useState(initialFilters);

    useEffect(() => {
        const handleKeyDown = (e) => { if (e.key === 'Escape') onClose(); };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setLocalFilters(prev => ({ ...prev, [name]: value }));
    };

    // ▼▼▼ 2. type에 따라 초기화할 필터가 달라지도록 수정 ▼▼▼
    const handleReset = () => {
        const baseFilters = { manager: 'all', company: 'all', status: 'all' };
        const fullFilters = type === 'inspection'
            ? { ...baseFilters, partName: 'all' }
            : baseFilters;
        setLocalFilters(fullFilters);
    };

    const handleApply = () => {
        onApplyFilters(localFilters);
        onClose();
    };

    return (
        <div className={styles.modalBackdrop} onClick={onClose}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                <div className={styles.modalHeader}>
                    <h3>필터</h3>
                    <button className={styles.closeButton} onClick={onClose}>&times;</button>
                </div>
                <div className={styles.modalBody}>
                    <div className={styles.filterGroup}>
                        <label>담당자</label>
                        <select name="manager" value={localFilters.manager} onChange={handleChange}>
                            {filterOptions.managers.map(opt => <option key={opt} value={opt}>{opt === 'all' ? '전체' : opt}</option>)}
                        </select>
                    </div>
                    <div className={styles.filterGroup}>
                        <label>업체명</label>
                        <select name="company" value={localFilters.company} onChange={handleChange}>
                            {filterOptions.companies.map(opt => <option key={opt} value={opt}>{opt === 'all' ? '전체' : opt}</option>)}
                        </select>
                    </div>

                    {/* ▼▼▼ 3. type이 'inspection'일 때만 '부품명' 필터를 보여줌 ▼▼▼ */}
                    {type === 'inspection' && (
                        <div className={styles.filterGroup}>
                            <label>부품명</label>
                            <select name="partName" value={localFilters.partName} onChange={handleChange}>
                                {filterOptions.partNames.map(opt => <option key={opt} value={opt}>{opt === 'all' ? '전체' : opt}</option>)}
                            </select>
                        </div>
                    )}

                    <div className={styles.filterGroup}>
                        <label>상태</label>
                        <select name="status" value={localFilters.status} onChange={handleChange}>
                            {filterOptions.statuses.map(opt => <option key={opt} value={opt}>{opt === 'all' && '전체'}{opt === 'delayed' && '지연'}{opt === 'inProgress' && '진행중'}{opt === 'completed' && '완료'}</option>)}
                        </select>
                    </div>
                </div>
                <div className={styles.modalFooter}>
                    <button className={styles.resetButton} onClick={handleReset}>초기화</button>
                    <button className={styles.applyButton} onClick={handleApply}>적용</button>
                </div>
            </div>
        </div>
    );
}

export default FilterModal;