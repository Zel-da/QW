import React, { useState } from 'react';
import qualityApi from '../../api/qualityApi.js';
import styles from '../AddInspectionModal/AddInspectionModal.module.css'; // Reuse styles

function AddQualityItemModal({ user, onClose, onSuccess }) {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: '공정', // Default category
        status: 'Open' // Default status
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.title || !formData.description) {
            setError('제목과 상세 설명은 필수 항목입니다.');
            return;
        }
        setIsSubmitting(true);
        setError('');
        try {
            // The payload now matches the backend API
            const payload = {
                title: formData.title,
                description: formData.description,
                category: formData.category,
                status: formData.status,
            };
            await qualityApi.addQualityItem(payload);
            onSuccess(); // Re-fetch data on the parent component
            onClose();
        } catch (err) {
            setError(err.message || "제출에 실패했습니다.");
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
                        <label>제목</label>
                        <input type="text" name="title" value={formData.title} onChange={handleChange} required />
                    </div>
                    <div className={styles.fullWidth}>
                        <label>상세 설명</label>
                        <textarea name="description" value={formData.description} onChange={handleChange} rows="5" required />
                    </div>
                    <div>
                        <label>분류</label>
                        <select name="category" value={formData.category} onChange={handleChange}>
                            <option value="공정">공정</option>
                            <option value="자재">자재</option>
                            <option value="작업방식">작업방식</option>
                            <option value="기타">기타</option>
                        </select>
                    </div>
                    <div>
                        <label>상태</label>
                        <select name="status" value={formData.status} onChange={handleChange}>
                            <option value="Open">Open</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Resolved">Resolved</option>
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
