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
            {/* Basic Info Grid */}
            <div className={styles.grid}>
              <div className={styles.gridItem}><strong>작성자:</strong> {item.username}</div>
              <div className={styles.gridItem}><strong>업체명:</strong> {item.company_name}</div>
              <div className={styles.gridItem}><strong>품명:</strong> {item.product_name}</div>
              <div className={styles.gridItem}><strong>품번:</strong> {item.product_code}</div>
              <div className={styles.gridItem}><strong>총 검사 수량:</strong> {item.inspected_quantity?.toLocaleString()}</div>
              <div className={styles.gridItem}><strong>불량 수량:</strong> {item.defective_quantity?.toLocaleString()}</div>
              <div className={styles.gridItem}><strong>접수일:</strong> {formatDate(item.start_date)}</div>
              <div className={styles.gridItem}><strong>마감일:</strong> {formatDate(item.target_date)}</div>
            </div>

            {/* Defect Reason and Solution */}
            <div className={styles.fullWidthItem}>
              <strong>불량 사유:</strong>
              <p>{item.defect_reason || '-'}</p>
            </div>
            <div className={styles.fullWidthItem}>
              <strong>조치 방법:</strong>
              <p>{item.solution || '-'}</p>
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
            <button className={styles.editButton} onClick={() => setIsEditModalOpen(true)}>수정</button>
            <button className={styles.deleteButton} onClick={handleDelete}>삭제</button>
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
