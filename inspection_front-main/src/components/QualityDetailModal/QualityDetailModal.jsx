import React, { useState, useEffect } from 'react';
import { getQualityComments, getQualityHistory, addQualityComment, addQualityHistory, deleteQualityComment } from '../../api/qualityApi.js';
import styles from './QualityDetailModal.module.css';
import formStyles from "../AddInspectionModal/AddInspectionModal.module.css";

function QualityDetailModal({ item, user, onClose, onSuccess }) {
    const [comments, setComments] = useState([]);
    const [history, setHistory] = useState([]);
    const [newComment, setNewComment] = useState('');

    const [isEditMode, setIsEditMode] = useState(false);
    const [formData, setFormData] = useState({ ...item });

    useEffect(() => {
        if (item.id) {
            const fetchData = async () => {
                const [commentsData, historyData] = await Promise.all([
                    getQualityComments(item.id),
                    getQualityHistory(item.id)
                ]);
                setComments(commentsData);
                setHistory(historyData);
            };
            fetchData();
        }
    }, [item.id]);

    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        if (!newComment.trim() || !user) return;

        const commentData = {
            user: user.name,
            text: newComment,
            date: new Date().toISOString().split('T')[0],
        };

        const added = await addQualityComment(item.id, commentData);
        setComments(prev => [...prev, added]);
        setNewComment('');
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };
    const handleCommentDelete = async (commentId) => {
        if (window.confirm("정말로 이 코멘트를 삭제하시겠습니까?")) {
            try {
                await deleteQualityComment(item.id, commentId);
                setComments(prev => prev.filter(c => c.id !== commentId));
            } catch (error) {
                alert("코멘트 삭제에 실패했습니다.");
            }
        }
    };

    const handleUpdateSubmit = async (e) => {
        e.preventDefault();
        const keyToLabelMap = {
            company: '업체명',
            improvementItem: '개선항목',
            startDate: '시작일',
            endDate: '마감일',
            progress: '진행률',
        };
        const changes = [];
        for (const key in formData) {
            if (formData[key] !== item[key] && keyToLabelMap[key]) {
                const label = keyToLabelMap[key];
                changes.push(`[${label}] 항목 수정: '${item[key]}' -> '${formData[key]}'`);
            }
        }
        if (changes.length > 0 && user) {
            const logMessage = { user: user.name, action: changes.join(', '), date: new Date().toISOString().split('T')[0] };
            await addQualityHistory(item.id, logMessage);
        }
        onSuccess(formData);
        onClose();
    };

    const canEdit = user && user.name === item.manager;

    return (
        <div className={styles.modalBackdrop} onClick={onClose}>
            <div className={`${styles.modalContent} ${isEditMode ? formStyles.modalContent : ''}`} onClick={e => e.stopPropagation()}>
                <div className={styles.header}>
                    <h3>{isEditMode ? '품질 개선 정보 수정' : '품질 개선 상세 정보'}</h3>
                    <button className={styles.closeButton} onClick={onClose}>&times;</button>
                </div>

                {isEditMode ? (
                    <form onSubmit={handleUpdateSubmit} className={`${formStyles.form} ${styles.scrollableArea}`}>
                        <div className={formStyles.formRow}>
                            <div className={formStyles.labelContainer}><label>담당자</label></div>
                            <div className={formStyles.inputContainer}><input type="text" value={formData.manager} disabled /></div>
                        </div>
                        <div className={formStyles.formRow}>
                            <div className={formStyles.labelContainer}><label>업체명</label></div>
                            <div className={formStyles.inputContainer}><input type="text" name="company" value={formData.company} onChange={handleChange} required /></div>
                        </div>
                        <div className={formStyles.formRow}>
                            <div className={formStyles.labelContainer}><label>개선항목</label></div>
                            <div className={formStyles.inputContainer}><textarea name="improvementItem" value={formData.improvementItem} onChange={handleChange} rows="4" required /></div>
                        </div>
                        <div className={formStyles.formRow}>
                            <div className={formStyles.labelContainer}><label>시작일 / 마감일</label></div>
                            <div className={`${formStyles.inputContainer} ${formStyles.doubleInput}`}>
                                <input type="date" name="startDate" value={formData.startDate} onChange={handleChange} required />
                                <input type="date" name="endDate" value={formData.endDate} onChange={handleChange} required />
                            </div>
                        </div>
                        <div className={formStyles.formRow}>
                            <div className={formStyles.labelContainer}><label>진행률 ({formData.progress}%)</label></div>
                            <div className={formStyles.inputContainer}>
                                <input type="range" name="progress" value={formData.progress} onChange={handleChange} min="0" max="100" step="5" className={formStyles.slider} style={{ '--progress-percent': `${formData.progress}%` }} />
                            </div>
                        </div>
                        <div className={formStyles.formActions}>
                            <button type="button" onClick={() => setIsEditMode(false)} className={formStyles.cancelButton}>취소</button>
                            <button type="submit" className={formStyles.submitButton}>저장</button>
                        </div>
                    </form>
                ) : (
                    <>
                        <div className={styles.scrollableArea}>
                            <div className={styles.detailsGrid}>
                                <div><label>담당자</label><span>{item.manager}</span></div>
                                <div><label>업체명</label><span>{item.company}</span></div>
                                <div className={styles.fullWidth}><label>개선항목</label><p>{item.improvementItem}</p></div>
                                <div><label>시작일</label><span>{item.startDate}</span></div>
                                <div><label>마감일</label><span>{item.endDate}</span></div>
                                <div className={styles.fullWidth}><label>진행률</label>
                                    <div className={styles.progressBarContainer}>

                                        <div className={styles.progressBarWrapper}>
                                            <div className={styles.progressBar} style={{ width: `${item.progress}%` }}></div>
                                        </div>
                                        <span>{item.progress}%</span>
                                    </div>
                                </div>
                            </div>

                            <div className={styles.commentSection}>
                                <h4>코멘트</h4>
                                {comments.length > 0 ? comments.map((c) => (
                                    <div key={c.id} className={styles.comment}>
                                        <p><strong>{c.user}:</strong> {c.text} <span>({c.date})</span></p>
                                        {user && user.name === c.user && (
                                            <button onClick={() => handleCommentDelete(c.id)} className={styles.deleteButton}>삭제</button>
                                        )}
                                    </div>
                                )) : <p>코멘트가 없습니다.</p>}
                                {user && (
                                    <form onSubmit={handleCommentSubmit} className={styles.commentForm}>
                                        <input
                                            type="text"
                                            value={newComment}
                                            onChange={(e) => setNewComment(e.target.value)}
                                            placeholder="코멘트를 입력하세요..."
                                        />
                                        <button type="submit">등록</button>
                                    </form>
                                )}
                            </div>

                            <div className={styles.historySection}>
                                <h4>수정 내역 (로그)</h4>
                                {history.length > 0 ? history.map((h, i) => (
                                    <p key={i}><strong>{h.user}:</strong> {h.action} <span>({h.date})</span></p>
                                )) : <p>수정 내역이 없습니다.</p>}
                            </div>
                        </div>
                        {canEdit && (
                            <div className={styles.actions}>
                                <button onClick={() => setIsEditMode(true)} className={styles.editButton}>수정</button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

export default QualityDetailModal;