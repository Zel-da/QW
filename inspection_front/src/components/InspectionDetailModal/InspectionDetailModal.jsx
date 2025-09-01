import React, { useState, useEffect } from 'react';
import historyApi from '../../api/historyApi';
import styles from './InspectionDetailModal.module.css';

const InspectionDetailModal = ({ item, onClose }) => {
  const [histories, setHistories] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

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

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString();
  };
  
  const formatHistoryDate = (dateString) => {
      if (!dateString) return '';
      return new Date(dateString).toLocaleString();
  }

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>검수 상세 정보</h2>
          <button className={styles.closeButton} onClick={onClose}>&times;</button>
        </div>
        <div className={styles.content}>
          <div className={styles.grid}>
            <div className={styles.gridItem}><strong>작성자:</strong> {item.username}</div>
            <div className={styles.gridItem}><strong>업체명:</strong> {item.company_name}</div>
            <div className={styles.gridItem}><strong>품명:</strong> {item.product_name}</div>
            <div className={styles.gridItem}><strong>품번:</strong> {item.product_code}</div>
            <div className={styles.gridItem}><strong>검수 수량:</strong> {item.inspected_quantity?.toLocaleString()}</div>
            <div className={styles.gridItem}><strong>불량 수량:</strong> {item.defective_quantity?.toLocaleString()}</div>
            <div className={styles.gridItem}><strong>조치 수량:</strong> {item.actioned_quantity?.toLocaleString() || '-'}</div>
            <div className={styles.gridItem}><strong>진행률:</strong> {item.progress_percentage}%</div>
            <div className={styles.gridItem}><strong>접수일:</strong> {formatDate(item.received_date)}</div>
            <div className={styles.gridItem}><strong>조치 기한:</strong> {formatDate(item.target_date)}</div>
          </div>
          <div className={styles.fullWidthItem}>
            <strong>불량 원인:</strong>
            <p>{item.defect_reason || '-'}</p>
          </div>
          <div className={styles.fullWidthItem}>
            <strong>해결 방안:</strong>
            <p>{item.solution || '-'}</p>
          </div>
          
          {/* History Section */}
          <div className={styles.historySection}>
            <h4 className={styles.historyTitle}>수정 내역</h4>
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
        <div className={styles.footer}>
          <button className={styles.footerButton} onClick={onClose}>닫기</button>
        </div>
      </div>
    </div>
  );
};

export default InspectionDetailModal;