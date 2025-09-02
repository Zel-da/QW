import React, { useState, useEffect } from 'react';
import { updateInspection } from '../../api/inspectionAPI';
import styles from '../AddInspectionModal/AddInspectionModal.module.css'; // Reuse styles

function EditInspectionModal({ item, onClose, onSuccess }) {
    const [formData, setFormData] = useState({
        company_name: '',
        product_name: '',
        product_code: '',
        inspected_quantity: '',
        defective_quantity: '',
        defect_reason: '',
        solution: '',
        start_date: '',
        target_date: '',
        progress_percentage: 0,
        status: 'inProgress',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (item) {
            setFormData({
                company_name: item.company_name || '',
                product_name: item.product_name || '',
                product_code: item.product_code || '',
                inspected_quantity: item.inspected_quantity || '',
                defective_quantity: item.defective_quantity || '',
                defect_reason: item.defect_reason || '',
                solution: item.solution || '',
                start_date: item.start_date ? new Date(item.start_date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
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
        try {
            await updateInspection(item.id, formData);
            onSuccess();
            onClose();
        } catch (error) {
            alert(`수정에 실패했습니다: ${error.message}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className={styles.modalBackdrop}>
            <div className={styles.modalContent}>
                <h3>검사 수정</h3>
                <form onSubmit={handleSubmit} className={styles.newFormLayout}>
                    {/* 1줄: 담당자명 */}
                    <div className={styles.fullWidth}>
                        <label>담당자명</label>
                        <input type="text" value={item.username} disabled />
                    </div>
                    {/* 2줄: 업체명 */}
                    <div className={styles.fullWidth}>
                        <label>업체명</label>
                        <input type="text" name="company_name" value={formData.company_name} onChange={handleChange} required />
                    </div>
                    {/* 3줄: 부품명 / 부품코드 */}
                    <div className={styles.formRow}>
                        <div>
                            <label>부품명</label>
                            <input type="text" name="product_name" value={formData.product_name} onChange={handleChange} required />
                        </div>
                        <div>
                            <label>부품코드</label>
                            <input type="text" name="product_code" value={formData.product_code} onChange={handleChange} required />
                        </div>
                    </div>
                    {/* 4줄: 총 검사 수량 / 불량 수량 */}
                    <div className={styles.formRow}>
                        <div>
                            <label>총 검사 수량</label>
                            <input type="number" name="inspected_quantity" value={formData.inspected_quantity} onChange={handleChange} required />
                        </div>
                        <div>
                            <label>불량 수량</label>
                            <input type="number" name="defective_quantity" value={formData.defective_quantity} onChange={handleChange} required />
                        </div>
                    </div>
                    {/* 5줄: 불량 사유 */}
                    <div className={styles.fullWidth}>
                        <label>불량 사유</label>
                        <textarea name="defect_reason" value={formData.defect_reason} onChange={handleChange} rows="2" />
                    </div>
                    {/* 6줄: 조치 방법 */}
                    <div className={styles.fullWidth}>
                        <label>조치 방법</label>
                        <textarea name="solution" value={formData.solution} onChange={handleChange} rows="2" />
                    </div>
                    {/* 7줄: 접수일 / 마감일 */}
                    <div className={styles.formRow}>
                        <div>
                            <label>접수일</label>
                            <input type="date" name="start_date" value={formData.start_date} onChange={handleChange} />
                        </div>
                        <div>
                            <label>마감일</label>
                            <input type="date" name="target_date" value={formData.target_date} onChange={handleChange} />
                        </div>
                    </div>
                    {/* 8줄: 진행률 */}
                    <div className={styles.fullWidth}>
                        <label>진행률: {formData.progress_percentage}%</label>
                        <input type="range" name="progress_percentage" value={formData.progress_percentage} onChange={handleChange} min="0" max="100" step="5" className={styles.slider} style={{ '--progress-percent': `${formData.progress_percentage}%` }} />
                    </div>
                    
                    <div className={styles.formActions}>
                        <button type="button" onClick={onClose} className={styles.cancelButton}>취소</button>
                        <button type="submit" className={styles.submitButton} disabled={isSubmitting}>{isSubmitting ? '저장 중...' : '저장'}</button>
                    </div>
                </form>
            </div>
        </div>
    );

export default EditInspectionModal;