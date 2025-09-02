import React, { useState, useEffect } from 'react';
// createPortal을 사용하기 위해 react-dom을 import 해야 할 수 있습니다.
// 만약 다른 모달에서 이미 사용 중이라면 이 파일에도 추가하는 것이 좋습니다.
import { createPortal } from 'react-dom';
import { getComments, getHistory, addComment, addHistory, deleteComment } from '../../api/inspectionAPI.js';
import styles from './InspectionDetailModal.module.css';
import formStyles from '../AddInspectionModal/AddInspectionModal.module.css';

function InspectionDetailModal({ item, user, onClose, onSuccess }) {
    const [comments, setComments] = useState([]);
    const [history, setHistory] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [isEditMode, setIsEditMode] = useState(false);
    const [formData, setFormData] = useState({ ...item });

    // ... (모든 함수 로직은 그대로입니다) ...
    useEffect(() => { if (item.id) { const fetchData = async () => { const [commentsData, historyData] = await Promise.all([getComments(item.id), getHistory(item.id)]); setComments(commentsData); setHistory(historyData); }; fetchData(); } }, [item.id]);
    const handleCommentSubmit = async (e) => { e.preventDefault(); if (!newComment.trim() || !user) return; const commentData = { user: user.name, text: newComment, date: new Date().toISOString().split('T')[0], }; const added = await addComment(item.id, commentData); setComments(prev => [...prev, added]); setNewComment(''); };
    const handleChange = (e) => { const { name, value } = e.target; setFormData(prev => ({ ...prev, [name]: value })); };
    const handleSliderChange = (e) => { const progress = parseInt(e.target.value, 10); let status = 'inProgress'; if (progress === 100) { status = 'completed'; } setFormData(prev => ({ ...prev, progress, status })); };
    const handleCommentDelete = async (commentId) => { if (window.confirm("정말로 이 코멘트를 삭제하시겠습니까?")) { try { await deleteComment(item.id, commentId); setComments(prev => prev.filter(c => c.id !== commentId)); } catch (error) { alert("코멘트 삭제에 실패했습니다."); } } };
    const handleUpdateSubmit = async (e) => { e.preventDefault(); const keyToLabelMap = { company: '업체명', partName: '부품명', defectCount: '불량품 수량', reason: '불량 사유', solution: '조치 방법', dueDate: '목표일', progress: '진행률', }; const changes = []; for (const key in formData) { if (formData[key] !== item[key] && keyToLabelMap[key]) { const label = keyToLabelMap[key]; changes.push(`[${label}] 항목 수정: '${item[key]}' -> '${formData[key]}'`); } } if (changes.length > 0 && user) { const logMessage = { user: user.name, action: changes.join(', '), date: new Date().toISOString().split('T')[0], }; await addHistory(item.id, logMessage); } onSuccess(formData); onClose(); };
    const canEdit = user && user.name === item.manager;

    // React Portal을 사용하여 z-index 문제를 근본적으로 해결하는 것을 추천합니다.
    return createPortal(
        <div className={styles.modalBackdrop} onMouseDown={onClose}>
            <div className={`${styles.modalContent} ${isEditMode ? formStyles.modalContent : ''}`} onMouseDown={e => e.stopPropagation()}>
                <div className={styles.header}>
                    <h3>{isEditMode ? '출장검사 정보 수정' : '출장검사 상세 정보'}</h3>
                    <button className={styles.closeButton} onClick={onClose}>&times;</button>
                </div>

                {isEditMode ? (
                    /* --- 수정 모드 --- */
                    <form onSubmit={handleUpdateSubmit} className={`${formStyles.modalForm} ${styles.scrollableArea}`}>
                        {/* ... 수정 모드 JSX ... */}
                        <div className={formStyles.formRow}><div className={formStyles.labelContainer}><label>담당자명</label></div><div className={formStyles.inputContainer}><input type="text" value={formData.manager} disabled /></div></div>
                        <div className={formStyles.formRow}><div className={formStyles.labelContainer}><label>업체명</label></div><div className={formStyles.inputContainer}><input type="text" name="company" value={formData.company} onChange={handleChange} required /></div></div>
                        <div className={formStyles.formRow}><div className={formStyles.labelContainer}><label>부품명</label></div><div className={formStyles.inputContainer}><input type="text" name="partName" value={formData.partName} onChange={handleChange} required /></div></div>
                        <div className={formStyles.formRow}><div className={formStyles.labelContainer}><label>불량 / 검사수</label></div><div className={`${formStyles.inputContainer} ${formStyles.doubleInput}`}><input type="number" name="defectCount" value={formData.defectCount} onChange={handleChange} min="0" required placeholder="불량 수량" /><input type="number" name="totalCount" value={formData.totalCount} onChange={handleChange} min="1" required placeholder="총 검사 수량" /></div></div>
                        <div className={formStyles.formRow}><div className={formStyles.labelContainer}><label>불량 사유</label></div><div className={formStyles.inputContainer}><textarea name="reason" value={formData.reason} onChange={handleChange} rows="4" required /></div></div>
                        <div className={formStyles.formRow}><div className={formStyles.labelContainer}><label>조치 방법</label></div><div className={formStyles.inputContainer}><textarea name="solution" value={formData.solution} onChange={handleChange} rows="4" required /></div></div>
                        <div className={formStyles.formRow}><div className={formStyles.labelContainer}><label>접수일 / 마감일</label></div><div className={`${formStyles.inputContainer} ${formStyles.doubleInput}`}><input type="date" name="receivedDate" value={formData.receivedDate} onChange={handleChange} required /><input type="date" name="dueDate" value={formData.dueDate} onChange={handleChange} required /></div></div>
                        <div className={formStyles.formRow}><div className={formStyles.labelContainer}><label>진행률 ({formData.progress}%)</label></div><div className={formStyles.inputContainer}><input type="range" name="progress" value={formData.progress} onChange={handleSliderChange} min="0" max="100" step="5" className={formStyles.slider} style={{ '--progress-percent': `${formData.progress}%` }} /></div></div>
                        <div className={formStyles.formActions}><button type="button" onClick={() => setIsEditMode(false)} className={formStyles.cancelButton}>취소</button><button type="submit" className={formStyles.submitButton}>저장</button></div>
                    </form>
                ) : (
                    /* --- 상세보기 모드 --- */
                    <>
                        <div className={styles.scrollableArea}>
                            {/* ... detailsGrid ... */}
                            <div className={styles.detailsGrid}>
                                <div><label>담당자</label><span>{item.manager}</span></div>
                                <div><label>업체명</label><span>{item.company}</span></div>
                                <div className={styles.fullWidth}><label>부품명</label><span>{item.partName}</span></div>
                                <div><label>총 검사 수량</label><span>{item.totalCount}</span></div>
                                <div><label>불량품 수량</label><span>{item.defectCount}</span></div>
                                <div className={styles.fullWidth}><label>불량 사유</label><p>{item.reason}</p></div>
                                <div className={styles.fullWidth}><label>조치 방법</label><p>{item.solution}</p></div>
                                <div><label>접수일</label><span>{item.receivedDate}</span></div>
                                <div><label>목표일</label><span>{item.dueDate}</span></div>
                                <div className={styles.fullWidth}><label>진행률</label> <div className={styles.progressBarContainer}>  <div className={styles.progressBarWrapper}> <div className={styles.progressBar} style={{ width: `${item.progress}%` }}></div> </div> <span>{item.progress}%</span> </div> </div>
                            </div>

                            <div className={styles.commentSection}>
                                <h4>코멘트</h4>
                                {comments.length > 0 ? comments.map((c) => (
                                    <div key={c.id} className={styles.comment}>
                                        <p><strong>{c.user}:</strong> {c.text} <span>({c.date})</span></p>
                                        {user && user.name === c.user && (<button onClick={() => handleCommentDelete(c.id)} className={styles.deleteButton}>삭제</button>)}
                                    </div>
                                )) : <p>코멘트가 없습니다.</p>}
                                {user && (<form onSubmit={handleCommentSubmit} className={styles.commentForm}><input type="text" value={newComment} onChange={(e) => setNewComment(e.target.value)} placeholder="코멘트를 입력하세요..." /><button type="submit">등록</button></form>)}
                            </div>

                            <div className={styles.historySection}>
                                <h4>수정 내역 (로그)</h4>
                                {/* ▼▼▼ key={i}를 key={h.id}로 변경합니다 (history 데이터에 id가 있다고 가정) ▼▼▼ */}
                                {history.length > 0 ? history.map((h) => (
                                    <p key={h.id}><strong>{h.user}:</strong> {h.action} <span>({h.date})</span></p>
                                )) : <p>수정 내역이 없습니다.</p>}
                            </div>
                        </div>
                        {canEdit && (<div className={styles.actions}><button onClick={() => setIsEditMode(true)} className={styles.editButton}>수정</button></div>)}
                    </>
                )}
            </div>
        </div>,
        document.body
    );
}

export default InspectionDetailModal;