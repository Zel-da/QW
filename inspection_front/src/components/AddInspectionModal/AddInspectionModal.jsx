// src/components/AddInspectionModal.jsx

import React, { useState } from 'react';
import { addInspection } from '../../api/inspectionAPI.js';
import styles from './AddInspectionModal.module.css';

function AddInspectionModal({ user, onClose, onSuccess }) {
    // 폼의 각 입력 필드를 백엔드 API의 key와 일치시킴
    const [formData, setFormData] = useState({
        company_name: '',
        product_name: '',
        product_code: '', // 제품 코드 필드 추가
        inspected_quantity: '',
        defective_quantity: '',
        actioned_quantity: '',
        defect_reason: '',
        solution: '',
        target_date: '',
        progress_percentage: 0,
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
            // onSuccess 콜백은 이제 ListSection에서 직접 데이터를 재로딩하므로, 반환값이 필요 없음
            await addInspection(formData);
            onSuccess(); // 성공했다는 사실만 부모에게 알림
            onClose();
        } catch (error) {
            console.error("제출 실패:", error);
            alert("데이터 제출에 실패했습니다.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className={styles.modalBackdrop}>
            <div className={styles.modalContent}>
                <h3>새 검사 등록</h3>
                <form onSubmit={handleSubmit}>
                    {/* 담당자 (자동 입력, 수정 불가) */}
                    <div>
                        <label>담당자명</label>
                        <input type="text" value={user.name} disabled />
                    </div>
                    {/* 업체명 */}
                    <div>
                        <label>업체명</label>
                        <input type="text" name="company_name" value={formData.company_name} onChange={handleChange} required />
                    </div>
                    {/* 부품명 */}
                    <div className={styles.fullWidth}>
                        <label>제품명</label>
                        <input type="text" name="product_name" value={formData.product_name} onChange={handleChange} required />
                    </div>
                    {/* 제품코드 */}
                    <div className={styles.fullWidth}>
                        <label>제품 코드</label>
                        <input type="text" name="product_code" value={formData.product_code} onChange={handleChange} required />
                    </div>
                    {/* 검사/불량 개수 */}
                    <div>
                        <label>검사 수량</label>
                        <input type="number" name="inspected_quantity" value={formData.inspected_quantity} onChange={handleChange} min="1" required />
                    </div>
                    <div>
                        <label>불량 수량</label>
                        <input type="number" name="defective_quantity" value={formData.defective_quantity} onChange={handleChange} min="0" required />
                    </div>
                     <div>
                        <label>조치 수량</label>
                        <input type="number" name="actioned_quantity" value={formData.actioned_quantity} onChange={handleChange} min="0" />
                    </div>
                    {/* 불량사유 */}
                    <div className={styles.fullWidth}>
                        <label>불량 원인</label>
                        <textarea name="defect_reason" value={formData.defect_reason} onChange={handleChange} rows="3" required />
                    </div>
                    {/* 대처방안 */}
                    <div className={styles.fullWidth}>
                        <label>대처 방안</label>
                        <textarea name="solution" value={formData.solution} onChange={handleChange} rows="3" required />
                    </div>
                    {/* 목표일 */}
                    <div>
                        <label>조치 목표일</label>
                        <input type="date" name="target_date" value={formData.target_date} onChange={handleChange} required />
                    </div>
                    {/* 진행률 */}
                    <div className={styles.fullWidth}>
                        <label>진행률: {formData.progress_percentage}%</label>
                        <input
                            type="range"
                            name="progress_percentage"
                            value={formData.progress_percentage}
                            onChange={handleChange}
                            min="0" max="100" step="5"
                            className={styles.slider}
                        />
                    </div>

                    {/* 하단 버튼 */}
                    <div className={styles.formActions}>
                        <button type="button" onClick={onClose} className={styles.cancelButton}>취소</button>
                        <button
                            type="submit"
                            className={styles.submitButton}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? '제출 중...' : '제출'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default AddInspectionModal;