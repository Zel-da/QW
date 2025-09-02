import React, { useState, useEffect } from 'react';
import historyApi from '../../api/historyApi';
import qualityApi from '../../api/qualityApi';
import CommentSection from '../CommentSection/CommentSection.jsx';
import EditQualityItemModal from '../EditQualityItemModal/EditQualityItemModal.jsx';
import styles from './QualityImprovementDetailModal.module.css';
import { calculateStatus, statusMap } from '../../utils';

const QualityImprovementDetailModal = ({ item, onClose, user, onUpdate }) => {
  const [histories, setHistories] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    if (item) {
      const fetchHistory = async () => {
        setLoadingHistory(true);
        try {
          const data = await historyApi.getHistories('quality', item.id);
          setHistories(data);
        } catch (error) {
          console.error("Failed to fetch histories:", error);
        } finally {
          setLoadingHistory(false);
        }
      };
      fetchHistory();
    }
  }, [item]);

  if (!item) return null;

  const handleDelete = async () => {
    if (window.confirm('정말로 이 항목을 삭제하시겠습니까?')) {
      try {
        await qualityApi.deleteQualityImprovement(item.id);
        alert('삭제되었습니다.');
        onUpdate(); // Refresh the list
        onClose();
      } catch (error) {
        console.error('Failed to delete quality improvement item:', error);
        alert(`삭제에 실패했습니다: ${error.message}`);
      }
    }
  };

  const handleEditSuccess = () => {
    setIsEditModalOpen(false);
    onUpdate(); // Refresh data in the detail view and the main list
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString();
  };

  const formatHistoryDate = (dateString) => {
      if (!dateString) return '';
      return new Date(dateString).toLocaleString();
  }

  

  return (
    <>
      <div className={styles.overlay} onClick={onClose}>
        <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
          <div className={styles.header}>
            <h2 className={styles.title}>품질 개선 상세 정보</h2>
            <button className={styles.closeButton} onClick={onClose}>&times;</button>
          </div>
          <div className={styles.content}>
            {/* Basic Info Layout */}
            <div className={styles.detailLayout}>
                {/* 1열: 담당자 / 업체명 */}
                <div className={styles.detailRow}>
                    <div>
                        <label>담당자</label>
                        <p>{item.username}</p>
                    </div>
                    <div>
                        <label>업체명</label>
                        <p>{item.company_name}</p>
                    </div>
                </div>
                {/* 2열: 개선 항목 */}
                <div className={styles.detailFullWidth}>
                    <label>개선 항목</label>
                    <p>{item.item_description || '-'}</p>
                </div>
                {/* 3열: 시작일 / 마감일 */}
                <div className={styles.detailRow}>
                    <div>
                        <label>시작일</label>
                        <p>{formatDate(item.start_date)}</p>
                    </div>
                    <div>
                        <label>마감일</label>
                        <p>{formatDate(item.end_date)}</p>
                    </div>
                </div>
                {/* 4열: 상태 */}
                <div className={styles.detailFullWidth}>
                    <label>상태</label>
                    <p>{statusMap[calculateStatus(item)]?.text || item.status}</p>
                </div>
                {/* 5열: 진행률 */}
                <div className={styles.detailFullWidth}>
                    <label>진행률</label>
                    <div className={styles.progressContainer}>
                        <div className={styles.progressBar} style={{ width: `${item.progress}%` }}>
                            {item.progress}%
                        </div>
                    </div>
                </div>
            </div>

            {/* 6열: 댓글 기능 */}
            <CommentSection user={user} parentId={item.id} parentType="quality" />

            {/* 7열: 수정 로그 */}
            <div className={styles.historySection}>
              <h4 className={styles.historyTitle}>수정 로그</h4>
              {loadingHistory ? (
                <p>내역 로딩 중...</p>
              ) : (
                <ul className={styles.historyList}>
                  {histories.length > 0 ? (
                    histories.map((log, index) => (
                      <li key={index} className={styles.historyItem}>
                        <span className={styles.historyDate}>({formatHistoryDate(log.created_at)})</span>
                        <span className={styles.historyUser}>[{log.username}]</span>
                        <span className={styles.historyAction}>{log.action}</span>
                      </li>
                    ))
                  ) : (
                    <p>수정 내역이 없습니다.</p>
                  )}
                </ul>
              )}
            </div>
          </div>

          {/* Footer with Buttons */}
          <div className={styles.footer}>
            <button className={styles.footerButton} onClick={onClose}>닫기</button>
            {user && (user.username === 'test' || user.id === item.user_id) && (
                <>
                    <button className={styles.editButton} onClick={() => setIsEditModalOpen(true)}>수정</button>
                    <button className={styles.deleteButton} onClick={handleDelete}>삭제</button>
                </>
            )}
          </div>
        </div>
      </div>

      {isEditModalOpen && (
        <EditQualityItemModal
          item={item}
          user={user}
          onClose={() => setIsEditModalOpen(false)}
          onSuccess={handleEditSuccess}
        />
      )}
    </>
  );
};

export default QualityImprovementDetailModal;