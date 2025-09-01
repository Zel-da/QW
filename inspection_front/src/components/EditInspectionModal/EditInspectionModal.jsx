import React, { useState, useEffect } from 'react';
import { updateInspection } from '../../api/inspectionAPI';
import styles from '../AddInspectionModal/AddInspectionModal.module.css'; // Reuse styles

function EditInspectionModal({ item, onClose, onSuccess }) {
    const [formData, setFormData] = useState({
        inspected_quantity: '',
        defective_quantity: '',
        defect_reason: '',
        solution: '',
        target_date: '',
        progress_percentage: 0,
        status: 'inProgress',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (item) {
            setFormData({
                inspected_quantity: item.inspected_quantity || '',
                defective_quantity: item.defective_quantity || '',
                defect_reason: item.defect_reason || '',
                solution: item.solution || '',
                target_date: item.target_date ? new Date(item.target_date).toISOString().split('T')[0] : '',
                progress_percentage: item.progress_percentage || 0,
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
            await updateInspection(item.id, formData);
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
                <h3>검수 항목 수정</h3>
                <form onSubmit={handleSubmit}>
                    <div><label>업체명</label><input type="text" value={item.company_name} disabled /></div>
                    <div><label>품명</label><input type="text" value={item.product_name} disabled /></div>
                    <div><label>품번</label><input type="text" value={item.product_code} disabled /></div>
                    <div><label>검사수량</label><input type="number" name="inspected_quantity" value={formData.inspected_quantity} onChange={handleChange} required /></div>
                    <div><label>불량수량</label><input type="number" name="defective_quantity" value={formData.defective_quantity} onChange={handleChange} required /></div>
                    <div><label>조치 목표일</label><input type="date" name="target_date" value={formData.target_date} onChange={handleChange} /></div>
                    <div className={styles.fullWidth}><label>불량 원인</label><textarea name="defect_reason" value={formData.defect_reason} onChange={handleChange} rows="3" /></div>
                    <div className={styles.fullWidth}><label>해결 방안</label><textarea name="solution" value={formData.solution} onChange={handleChange} rows="3" /></div>
                    <div className={styles.fullWidth}>
                        <label>진행률: {formData.progress_percentage}%</label>
                        <input type="range" name="progress_percentage" value={formData.progress_percentage} onChange={handleChange} min="0" max="100" step="5" className={styles.slider} style={{ '--progress-percent': `${formData.progress_percentage}%` }} />
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

export default EditInspectionModal;