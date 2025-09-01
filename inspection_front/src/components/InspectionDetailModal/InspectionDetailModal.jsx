import React from 'react';
import styles from './InspectionDetailModal.module.css';

const InspectionDetailModal = ({ item, onClose }) => {
  if (!item) return null;

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString();
  };

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
        </div>
        <div className={styles.footer}>
          <button className={styles.footerButton} onClick={onClose}>닫기</button>
        </div>
      </div>
    </div>
  );
};

export default InspectionDetailModal;
