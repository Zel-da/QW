import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { addInspection } from '../../api/inspectionAPI.js';
import styles from './AddInspectionModal.module.css';

function AddInspectionModal({ user, onClose, onSuccess }) {
    const [formData, setFormData] = useState({ manager: user.name, company: '', partName: '', totalCount: '', defectCount: '', reason: '', solution: '', receivedDate: new Date().toISOString().split('T')[0], progress: 0, status: 'in-progress', });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formError, setFormError] = useState('');

    useEffect(() => {
        const total = parseInt(formData.totalCount, 10);
        const defect = parseInt(formData.defectCount, 10);
        if (!isNaN(total) && !isNaN(defect) && defect > total) {
            setFormError('불량 수량은 총 검사 수량을 초과할 수 없습니다.');
        } else {
            setFormError('');
        }
    }, [formData.totalCount, formData.defectCount]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSliderChange = (e) => {
        const progress = parseInt(e.target.value, 10);
        let status = 'inProgress';
        if (progress === 100) {
            status = 'completed';
        }
        setFormData(prev => ({ ...prev, progress, status }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formError) {
            alert(formError);
            return;
        }
        setIsSubmitting(true);
        try {
            const newEntry = await addInspection(formData);
            onSuccess(newEntry);
            onClose();
        } catch (error) {
            console.error("제출 실패:", error);
            alert("데이터 제출에 실패했습니다.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return createPortal(
        <div className={styles.modalBackdrop} onMouseDown={onClose}>
            <div className={styles.modalContent} onMouseDown={(e) => e.stopPropagation()}>
                <h3>새 검사 등록</h3>
                {/* ▼▼▼ 바로 이 부분입니다! form 태그에 className이 추가되었습니다. ▼▼▼ */}
                <form className={styles.modalForm} onSubmit={handleSubmit}>
                    <div className={styles.form}>
                        <div className={styles.formRow}><div className={styles.labelContainer}><label>담당자명</label></div><div className={styles.inputContainer}><input type="text" value={formData.manager} disabled /></div></div>
                        <div className={styles.formRow}><div className={styles.labelContainer}><label>업체명</label></div><div className={styles.inputContainer}><input type="text" name="company" value={formData.company} onChange={handleChange} required /></div></div>
                        <div className={styles.formRow}><div className={styles.labelContainer}><label>부품명</label></div><div className={styles.inputContainer}><input type="text" name="partName" value={formData.partName} onChange={handleChange} required /></div></div>
                        <div className={styles.formRow}><div className={styles.labelContainer}><label>불량품 수량 /<br />총 검사 수량</label></div><div className={`${styles.inputContainer} ${styles.doubleInput}`}><input type="number" name="defectCount" value={formData.defectCount} onChange={handleChange} min="0" required placeholder="불량 수량" /><input type="number" name="totalCount" value={formData.totalCount} onChange={handleChange} min="1" required placeholder="총 검사 수량" /></div></div>
                        {formError && (<div className={styles.formRow}><div className={styles.labelContainer}></div><div className={styles.inputContainer}><p className={styles.errorMessage}>{formError}</p></div></div>)}
                        <div className={styles.formRow}><div className={styles.labelContainer}><label>불량 사유</label></div><div className={styles.inputContainer}><textarea name="reason" value={formData.reason} onChange={handleChange} rows="4" required /></div></div>
                        <div className={styles.formRow}><div className={styles.labelContainer}><label>조치 방법</label></div><div className={styles.inputContainer}><textarea name="solution" value={formData.solution} onChange={handleChange} rows="4" required /></div></div>
                        <div className={styles.formRow}><div className={styles.labelContainer}><label>접수일 /<br />마감일</label></div><div className={`${styles.inputContainer} ${styles.doubleInput}`}><input type="date" name="receivedDate" value={formData.receivedDate} onChange={handleChange} required /><input type="date" name="dueDate" value={formData.dueDate} onChange={handleChange} required /></div></div>
                        <div className={styles.formRow}><div className={styles.labelContainer}><label>진행률 ({formData.progress}%)</label></div><div className={styles.inputContainer}><input type="range" name="progress" value={formData.progress} onChange={handleSliderChange} min="0" max="100" step="5" className={styles.slider} style={{ '--progress-percent': `${formData.progress}%` }} /></div></div>
                    </div>

                    <div className={styles.formActions}>
                        <button type="button" onClick={onClose} className={styles.cancelButton}>취소</button>
                        <button type="submit" className={styles.submitButton} disabled={isSubmitting}>{isSubmitting ? '저장 중...' : '저장'}</button>
                    </div>
                </form>
            </div>
        </div>,
        document.body
    );
}

export default AddInspectionModal;