import React, { useState, useEffect } from 'react';
import historyApi from '../../api/historyApi';
import styles from './QualityImprovementDetailModal.module.css';

const QualityImprovementDetailModal = ({ item, onClose }) => {
  const [histories, setHistories] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

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
          <h2 className={styles.title}>품질 개선 상세 정보</h2>
          <button className={styles.closeButton} onClick={onClose}>&times;</button>
        </div>
        <div className={styles.content}>
          <div className={styles.grid}>
            <div className={styles.gridItem}><strong>작성자:</strong> {item.username}</div>
            <div className={styles.gridItem}><strong>업체명:</strong> {item.company_name}</div>
            <div className={styles.gridItem}><strong>상태:</strong> {item.status}</div>
            <div className={styles.gridItem}><strong>진행률:</strong> {item.progress}%</div>
            <div className={styles.gridItem}><strong>시작일:</strong> {formatDate(item.start_date)}</div>
            <div className={styles.gridItem}><strong>마감일:</strong> {formatDate(item.end_date)}</div>
          </div>
          <div className={styles.fullWidthItem}>
            <strong>개선 항목:</strong>
            <p>{item.item_description || '-'}</p>
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

export default QualityImprovementDetailModal;