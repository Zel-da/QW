import React, { useState } from 'react';
import { addInspection } from '../../api/inspectionAPI';
import styles from './AddInspectionModal.module.css';

function AddInspectionModal({ user, onClose, onSuccess }) {
    const [formData, setFormData] = useState({
        company_name: '',
        product_name: '',
        product_code: '',
        inspected_quantity: '',
        defective_quantity: '',
        defect_reason: '',
        solution: '',
        target_date: '',
        progress_percentage: 0,
        status: 'inProgress',
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
            await addInspection(formData);
            onSuccess();
            onClose();
        } catch (error) {
            alert(`제출에 실패했습니다: ${error.message}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className={styles.modalBackdrop}>
            <div className={styles.modalContent}>
                <h3>검사 등록</h3>
                <form onSubmit={handleSubmit} className={styles.newFormLayout}>
                    {/* Row 1 */}
                    <div className={styles.fullWidth}>
                        <label>담당자명</label>
                        <input type="text" value={user.name} disabled />
                    </div>
                    {/* Row 2 */}
                    <div className={styles.fullWidth}>
                        <label>업체명</label>
                        <input type="text" name="company_name" value={formData.company_name} onChange={handleChange} required />
                    </div>
                    {/* Row 3 */}
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
                    {/* Row 4 */}
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
                    {/* Row 5 */}
                    <div className={styles.fullWidth}>
                        <label>불량 사유</label>
                        <textarea name="defect_reason" value={formData.defect_reason} onChange={handleChange} rows="3" />
                    </div>
                    {/* Row 6 */}
                    <div className={styles.fullWidth}>
                        <label>조치 방법</label>
                        <textarea name="solution" value={formData.solution} onChange={handleChange} rows="3" />
                    </div>
                    {/* Row 7 */}
                    <div className={styles.formRow}>
                        <div>
                            <label>접수일</label>
                            <input type="text" value={new Date().toLocaleDateString()} disabled />
                        </div>
                        <div>
                            <label>마감일</label>
                            <input type="date" name="target_date" value={formData.target_date} onChange={handleChange} />
                        </div>
                    </div>
                    {/* Row 8 */}
                    <div className={styles.fullWidth}>
                        <label>진행률: {formData.progress_percentage}%</label>
                        <input type="range" name="progress_percentage" value={formData.progress_percentage} onChange={handleChange} min="0" max="100" step="5" className={styles.slider} style={{ '--progress-percent': `${formData.progress_percentage}%` }} />
                    </div>
                    
                    {/* Status (hidden or can be placed somewhere) */}
                    <input type="hidden" name="status" value={formData.status} />

                    <div className={styles.formActions}>
                        <button type="button" onClick={onClose} className={styles.cancelButton}>취소</button>
                        <button type="submit" className={styles.submitButton} disabled={isSubmitting}>{isSubmitting ? '등록 중...' : '등록'}</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default AddInspectionModal;