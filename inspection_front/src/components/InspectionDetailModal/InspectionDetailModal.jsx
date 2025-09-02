import React, { useState, useEffect } from 'react';
import historyApi from '../../api/historyApi';
import { deleteInspection } from '../../api/inspectionAPI';
import CommentSection from '../CommentSection/CommentSection.jsx';
import EditInspectionModal from '../EditInspectionModal/EditInspectionModal.jsx';
import styles from './InspectionDetailModal.module.css';

const InspectionDetailModal = ({ item, onClose, user, onUpdate }) => {
  const [histories, setHistories] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    if (item) {
      const fetchHistory = async () => {
        setLoadingHistory(true);
        try {
          const data = await historyApi.getHistories('inspection', item.id);
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
        await deleteInspection(item.id);
        alert('삭제되었습니다.');
        onUpdate(); // Refresh the list
        onClose();
      } catch (error) {
        console.error('Failed to delete inspection:', error);
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
            <h2 className={styles.title}>검수 상세 정보</h2>
            <button className={styles.closeButton} onClick={onClose}>&times;</button>
          </div>
          <div className={styles.content}>
            {/* Basic Info Layout */}
            <div className={styles.detailLayout}>
                {/* 1줄: 담당자명 */}
                <div className={styles.detailFullWidth}>
                    <label>담당자명</label>
                    <p>{item.username}</p>
                </div>
                {/* 2줄: 업체명 */}
                <div className={styles.detailFullWidth}>
                    <label>업체명</label>
                    <p>{item.company_name}</p>
                </div>
                {/* 3줄: 부품명 / 부품코드 */}
                <div className={styles.detailRow}>
                    <div>
                        <label>부품명</label>
                        <p>{item.product_name}</p>
                    </div>
                    <div>
                        <label>부품코드</label>
                        <p>{item.product_code}</p>
                    </div>
                </div>
                {/* 4줄: 총 검사 수량 / 불량 수량 */}
                <div className={styles.detailRow}>
                    <div>
                        <label>총 검사 수량</label>
                        <p>{item.inspected_quantity?.toLocaleString()}</p>
                    </div>
                    <div>
                        <label>불량 수량</label>
                        <p>{item.defective_quantity?.toLocaleString()}</p>
                    </div>
                </div>
                {/* 5줄: 불량 사유 */}
                <div className={styles.detailFullWidth}>
                    <label>불량 사유</label>
                    <p>{item.defect_reason || '-'}</p>
                </div>
                {/* 6줄: 조치 방법 */}
                <div className={styles.detailFullWidth}>
                    <label>조치 방법</label>
                    <p>{item.solution || '-'}</p>
                </div>
                {/* 7줄: 접수일 / 마감일 */}
                <div className={styles.detailRow}>
                    <div>
                        <label>접수일</label>
                        <p>{formatDate(item.start_date)}</p>
                    </div>
                    <div>
                        <label>마감일</label>
                        <p>{formatDate(item.target_date)}</p>
                    </div>
                </div>
            </div>

            {/* 8. Progress Bar */}
            <div className={styles.fullWidthItem}>
              <strong>진행률:</strong>
              <div className={styles.progressContainer}>
                <div className={styles.progressBar} style={{ width: `${item.progress_percentage}%` }}>
                  {item.progress_percentage}%
                </div>
              </div>
            </div>

            {/* 9. Comment Section */}
            <CommentSection user={user} parentId={item.id} parentType="inspection" />

            {/* 10. History Section */}
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
        <EditInspectionModal
          item={item}
          user={user}
          onClose={() => setIsEditModalOpen(false)}
          onSuccess={handleEditSuccess}
        />
      )}
    </>
  );
};

export default InspectionDetailModal;
