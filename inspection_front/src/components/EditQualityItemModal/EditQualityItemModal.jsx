import React, { useState, useEffect } from 'react';
import qualityApi from '../../api/qualityApi.js';
import styles from '../AddInspectionModal/AddInspectionModal.module.css'; // Reuse styles

function EditQualityItemModal({ item, onClose, onSuccess }) {
    const [formData, setFormData] = useState({
        item_description: '',
        start_date: '',
        end_date: '',
        progress: 0,
        status: 'inProgress',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (item) {
            setFormData({
                item_description: item.item_description || '',
                start_date: item.start_date ? new Date(item.start_date).toISOString().split('T')[0] : '',
                end_date: item.end_date ? new Date(item.end_date).toISOString().split('T')[0] : '',
                progress: item.progress || 0,
                status: item.status || 'inProgress',
            });
        }
    }, [item]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError('');
        try {
            await qualityApi.updateQualityImprovement(item.id, formData);
            onSuccess();
            onClose();
        } catch (err) {
            setError(err.message || '수정에 실패했습니다.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!item) return null;

    return (
        <div className={styles.modalBackdrop}>
            <div className={styles.modalContent}>
                <h3>품질 개선 항목 수정</h3>
                <form onSubmit={handleSubmit}>
                    <div><label>업체명</label><input type="text" value={item.company_name} disabled /></div>
                    <div className={styles.fullWidth}><label>개선항목 (상세 설명)</label><textarea name="item_description" value={formData.item_description} onChange={handleChange} rows="5" required /></div>
                    <div><label>시작일</label><input type="date" name="start_date" value={formData.start_date} onChange={handleChange} required /></div>
                    <div><label>마감일</label><input type="date" name="end_date" value={formData.end_date} onChange={handleChange} /></div>
                    <div>
                        <label>진행률: {formData.progress}%</label>
                        <input type="range" name="progress" value={formData.progress} onChange={handleChange} min="0" max="100" step="5" className={styles.slider} style={{ '--progress-percent': `${formData.progress}%` }} />
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
                        <button type="submit" className={styles.submitButton} disabled={isSubmitting}>{isSubmitting ? '저장 중...' : '저장'}</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default EditQualityItemModal;