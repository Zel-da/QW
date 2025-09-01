import React, { useState } from 'react';
import qualityApi from '../../api/qualityApi.js';
import styles from '../AddInspectionModal/AddInspectionModal.module.css'; // Reuse styles

function AddQualityItemModal({ user, onClose, onSuccess }) {
    const [formData, setFormData] = useState({
        company_name: '',
        item_description: '',
        start_date: new Date().toISOString().split('T')[0], // Default to today
        end_date: '',
        status: 'inProgress', // Default status
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.company_name || !formData.item_description || !formData.start_date) {
            setError('업체명, 개선항목, 시작일은 필수 항목입니다.');
            return;
        }
        setIsSubmitting(true);
        setError('');
        try {
            // The payload now matches the backend API
            const payload = {
                company_name: formData.company_name,
                item_description: formData.item_description,
                start_date: formData.start_date,
                end_date: formData.end_date || null, // Send null if empty
                status: formData.status,
                progress: 0, // Default progress
            };
            await qualityApi.addQualityItem(payload); // Use the existing function name
            onSuccess(); // Re-fetch data on the parent component
            onClose();
        } catch (err) {
            setError(err.response?.data?.message || err.message || "제출에 실패했습니다.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className={styles.modalBackdrop}>
            <div className={styles.modalContent}>
                <h3>새 품질 개선 항목 등록</h3>
                <form onSubmit={handleSubmit}>
                    <div className={styles.fullWidth}>
                        <label>업체명</label>
                        <input type="text" name="company_name" value={formData.company_name} onChange={handleChange} required />
                    </div>
                    <div className={styles.fullWidth}>
                        <label>개선항목 (상세 설명)</label>
                        <textarea name="item_description" value={formData.item_description} onChange={handleChange} rows="5" required />
                    </div>
                    <div>
                        <label>시작일</label>
                        <input type="date" name="start_date" value={formData.start_date} onChange={handleChange} required />
                    </div>
                    <div>
                        <label>마감일</label>
                        <input type="date" name="end_date" value={formData.end_date} onChange={handleChange} />
                    </div>
                    <div>
                        <label>상태</label>
                        <select name="status" value={formData.status} onChange={handleChange}>
                            <option value="inProgress">진행중</option>
                            <option value="completed">완료</option>
                            <option value="delayed">지연</option>
                        </select>
                    </div>
                    {error && <p className={styles.error}>{error}</p>}
                    <div className={styles.formActions}>
                        <button type="button" onClick={onClose} className={styles.cancelButton}>취소</button>
                        <button type="submit" className={styles.submitButton} disabled={isSubmitting}>
                            {isSubmitting ? '제출 중...' : '제출'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default AddQualityItemModal;