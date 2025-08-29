// src/components/AddInspectionModal.jsx

import React, { useState } from 'react';
import { addInspection } from '../../api/inspectionAPI.js';
import styles from './AddInspectionModal.module.css';

function AddInspectionModal({ user, onClose, onSuccess }) {
    // 폼의 각 입력 필드를 위한 State
    const [formData, setFormData] = useState({
        manager: user.name, // 담당자는 로그인 정보로 자동 설정
        company: '',
        partName: '',
        totalCount: '',
        defectCount: '',
        reason: '',
        solution: '',
        dueDate: '',
        progress: 0,
        status: 'in-progress', // 기본 상태값
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSliderChange = (e) => {
        const progress = parseInt(e.target.value, 10);
        let status = 'in-progress';
        if (progress === 100) {
            status = 'completed';
        }
        // 목표일이 지났는지 여부는 실제 로직에서 추가 필요 (여기서는 생략)
        setFormData(prev => ({ ...prev, progress, status }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true); // 제출 시작, 버튼 비활성화

        try {
            const newEntry = await addInspection(formData);
            onSuccess(newEntry);
            onClose();
        } catch (error) {
            console.error("제출 실패:", error);
            alert("데이터 제출에 실패했습니다.");
        } finally {
            setIsSubmitting(false); // 제출 완료, 버튼 다시 활성화
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
                        <input type="text" value={formData.manager} disabled />
                    </div>
                    {/* 업체명 */}
                    <div>
                        <label>업체명</label>
                        <input type="text" name="company" value={formData.company} onChange={handleChange} required />
                    </div>
                    {/* 부품명 */}
                    <div className={styles.fullWidth}>
                        <label>부품명</label>
                        <input type="text" name="partName" value={formData.partName} onChange={handleChange} required />
                    </div>
                    {/* 검사/불량 개수 */}
                    <div>
                        <label>검사 개수</label>
                        <input type="number" name="totalCount" value={formData.totalCount} onChange={handleChange} min="1" required />
                    </div>
                    <div>
                        <label>불량 개수</label>
                        <input type="number" name="defectCount" value={formData.defectCount} onChange={handleChange} min="0" required />
                    </div>
                    {/* 불량사유 */}
                    <div className={styles.fullWidth}>
                        <label>불량사유</label>
                        <textarea name="reason" value={formData.reason} onChange={handleChange} rows="3" required />
                    </div>
                    {/* 대처방안 */}
                    <div className={styles.fullWidth}>
                        <label>대처방안</label>
                        <textarea name="solution" value={formData.solution} onChange={handleChange} rows="3" required />
                    </div>
                    {/* 목표일 */}
                    <div>
                        <label>목표일</label>
                        <input type="date" name="dueDate" value={formData.dueDate} onChange={handleChange} required />
                    </div>
                    {/* 상태 */}
                    <div>
                        <label>상태</label>
                        <select name="status" value={formData.status} onChange={handleChange}>
                            <option value="in-progress">진행중</option>
                            <option value="completed">완료</option>
                            <option value="delayed">지연</option>
                        </select>
                    </div>
                    {/* 진행률 슬라이더 */}
                    <div className={styles.fullWidth}>
                        <label>진행률: {formData.progress}%</label>
                        <input
                            type="range"
                            name="progress"
                            value={formData.progress}
                            onChange={handleSliderChange}
                            min="0" max="100" step="5"
                            className={styles.slider}
                            style={{ '--progress-percent': `${formData.progress}%` }}

                        />
                    </div>

                    {/* 하단 버튼 */}
                    <div className={styles.formActions}>
                        <button type="button" onClick={onClose} className={styles.cancelButton}>취소</button>
                        <button
                            type="submit"
                            className={styles.submitButton}
                            disabled={isSubmitting} /* isSubmitting이 true일 때 버튼 비활성화 */
                        >
                            {isSubmitting ? '제출 중...' : '제출'} {/* 상태에 따라 문구 변경 */}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default AddInspectionModal;