import React from 'react';
import styles from './QualityImprovementDetailModal.module.css';

const QualityImprovementDetailModal = ({ item, onClose }) => {
  if (!item) return null;

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString(); // Show time as well
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>품질 개선 상세 정보</h2>
          <button className={styles.closeButton} onClick={onClose}>&times;</button>
        </div>
        <div className={styles.content}>
          <div className={styles.grid}>
            <div className={styles.gridItem}><strong>ID:</strong> {item.id}</div>
            <div className={styles.gridItem}><strong>작성자:</strong> {item.username}</div>
            <div className={styles.gridItem}><strong>분류:</strong> {item.category || '-'}</div>
            <div className={styles.gridItem}><strong>상태:</strong> {item.status}</div>
            <div className={styles.gridItemFull}><strong>생성일:</strong> {formatDate(item.created_at)}</div>
            <div className={styles.gridItemFull}><strong>해결일:</strong> {formatDate(item.resolved_at)}</div>
          </div>
          <div className={styles.fullWidthItem}>
            <strong>제목:</strong>
            <h3>{item.title}</h3>
          </div>
          <div className={styles.fullWidthItem}>
            <strong>상세 설명:</strong>
            <p>{item.description || '-'}</p>
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
