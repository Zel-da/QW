import React, { useState, useEffect } from 'react';
import { getMyInspections, deleteInspection } from '../api/inspectionAPI';
import styles from './MyPosts.module.css';

const MyPosts = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        const data = await getMyInspections();
        setPosts(data);
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('정말로 이 항목을 삭제하시겠습니까?')) {
      try {
        await deleteInspection(id);
        // Update state to reflect deletion
        setPosts(posts.filter(post => post.id !== id));
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
      {posts.length === 0 ? (
        <p className={styles.message}>작성한 내역이 없습니다.</p>
      ) : (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>업체명</th>
              <th>품명</th>
              <th>수량</th>
              <th>불량 수량</th>
              <th>등록일</th>
              <th>조치</th>
            </tr>
          </thead>
          <tbody>
            {posts.map((post) => (
              <tr key={post.id}>
                <td>{post.company_name}</td>
                <td>{post.product_name}</td>
                <td>{post.inspected_quantity}</td>
                <td>{post.defective_quantity}</td>
                <td>{new Date(post.received_date).toLocaleDateString()}</td>
                <td>
                  <button className={`${styles.button} ${styles.editButton}`}>
                    수정
                  </button>
                  <button 
                    className={`${styles.button} ${styles.deleteButton}`}
                    onClick={() => handleDelete(post.id)}
                  >
                    삭제
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default MyPosts;
