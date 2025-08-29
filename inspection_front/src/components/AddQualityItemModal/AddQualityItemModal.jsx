// src/components/AddQualityItemModal.jsx

import React, { useState } from 'react';
import { addQualityItem } from '../../api/qualityApi.js'; 
import styles from '../AddInspectionModal/AddInspectionModal.module.css'; // 기존 모달 스타일 재사용!

function AddQualityItemModal({ user, onClose, onSuccess }) {
    const [formData, setFormData] = useState({
        manager: user.name,
        company: '',
        improvementItem: '',
        startDate: new Date().toISOString().split('T')[0], // 오늘 날짜 기본값
        endDate: '',
        progress: 0,
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const newEntry = await addQualityItem(formData);
            onSuccess(newEntry);
            onClose();
        } catch (error) {
            alert("제출에 실패했습니다.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className={styles.modalBackdrop}>
            <div className={styles.modalContent}>
                <h3>새 품질 개선 항목 등록</h3>
                <form onSubmit={handleSubmit}>
                    <div><label>담당자</label><input type="text" value={formData.manager} disabled /></div>
                    <div><label>업체명</label><input type="text" name="company" value={formData.company} onChange={handleChange} required /></div>
                    <div className={styles.fullWidth}><label>개선항목</label><textarea name="improvementItem" value={formData.improvementItem} onChange={handleChange} rows="4" required /></div>
                    <div><label>시작일</label><input type="date" name="startDate" value={formData.startDate} onChange={handleChange} required /></div>
                    <div><label>마감일</label><input type="date" name="endDate" value={formData.endDate} onChange={handleChange} required /></div>
                    <div className={styles.fullWidth}>
                        <label>진행률: {formData.progress}%</label>
                        <input type="range" name="progress" value={formData.progress} onChange={handleChange} min="0" max="100" step="5" className={styles.slider} style={{ '--progress-percent': `${formData.progress}%` }} />
                    </div>
                    <div className={styles.formActions}>
                        <button type="button" onClick={onClose} className={styles.cancelButton}>취소</button>
                        <button type="submit" className={styles.submitButton} disabled={isSubmitting}>{isSubmitting ? '제출 중...' : '제출'}</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default AddQualityItemModal;