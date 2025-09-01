import React, { useState, useEffect, useCallback } from 'react';
import { getMyInspections, deleteInspection } from '../api/inspectionAPI';
import qualityApi from '../api/qualityApi';
import styles from './MyPosts.module.css';

// --- Inspections Table Component ---
const MyInspectionsTable = ({ inspections, onDelete }) => {
  if (inspections.length === 0) {
    return <p className={styles.message}>작성한 출장검사 내역이 없습니다.</p>;
  }
  return (
    <table className={styles.table}>
      <thead>
        <tr>
          <th>업체명</th><th>품명</th><th>검수 수량</th><th>불량 수량</th><th>등록일</th><th>조치</th>
        </tr>
      </thead>
      <tbody>
        {inspections.map((post) => (
          <tr key={post.id}>
            <td>{post.company_name}</td>
            <td>{post.product_name}</td>
            <td>{post.inspected_quantity}</td>
            <td>{post.defective_quantity}</td>
            <td>{new Date(post.received_date).toLocaleDateString()}</td>
            <td>
              <button className={`${styles.button} ${styles.editButton}`} disabled>수정</button>
              <button className={`${styles.button} ${styles.deleteButton}`} onClick={() => onDelete(post.id)}>삭제</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

// --- Quality Improvements Table Component ---
const MyQualityTable = ({ items, onDelete }) => {
  if (items.length === 0) {
    return <p className={styles.message}>작성한 품질 개선 제안이 없습니다.</p>;
  }
  return (
    <table className={styles.table}>
      <thead>
        <tr>
          <th>제목</th><th>분류</th><th>상태</th><th>생성일</th><th>조치</th>
        </tr>
      </thead>
      <tbody>
        {items.map((item) => (
          <tr key={item.id}>
            <td>{item.title}</td>
            <td>{item.category}</td>
            <td>{item.status}</td>
            <td>{new Date(item.created_at).toLocaleDateString()}</td>
            <td>
              <button className={`${styles.button} ${styles.editButton}`} disabled>수정</button>
              <button className={`${styles.button} ${styles.deleteButton}`} onClick={() => onDelete(item.id)}>삭제</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

// --- Main MyPosts Page Component ---
const MyPosts = () => {
  const [inspections, setInspections] = useState([]);
  const [qualityItems, setQualityItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [inspectionsData, qualityData] = await Promise.all([
        getMyInspections(),
        qualityApi.getMyQualityImprovements()
      ]);
      setInspections(inspectionsData);
      setQualityItems(qualityData);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDeleteInspection = async (id) => {
    if (window.confirm('정말로 이 항목을 삭제하시겠습니까?')) {
      try {
        await deleteInspection(id);
        setInspections(inspections.filter(post => post.id !== id));
      } catch (err) {
        alert(`삭제 실패: ${err.message}`);
      }
    }
  };

  const handleDeleteQualityItem = async (id) => {
    if (window.confirm('정말로 이 항목을 삭제하시겠습니까?')) {
      try {
        await qualityApi.deleteQualityImprovement(id);
        setQualityItems(qualityItems.filter(item => item.id !== id));
      } catch (err) {
        alert(`삭제 실패: ${err.message}`);
      }
    }
  };

  if (loading) {
    return <div className={styles.message}>로딩 중...</div>;
  }

  if (error) {
    return <div className={`${styles.message} ${styles.error}`}>오류: {error}</div>;
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>작성 내역</h1>
      
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>나의 출장검사 현황</h2>
        <MyInspectionsTable inspections={inspections} onDelete={handleDeleteInspection} />
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>나의 품질 개선 제안</h2>
        <MyQualityTable items={qualityItems} onDelete={handleDeleteQualityItem} />
      </div>

    </div>
  );
};

export default MyPosts;