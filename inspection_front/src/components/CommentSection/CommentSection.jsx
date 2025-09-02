import React, { useState, useEffect, useCallback } from 'react';
import commentApi from '../../api/commentApi';
import styles from './CommentSection.module.css';

function CommentSection({ user, parentId, parentType }) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [editingComment, setEditingComment] = useState({ id: null, content: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchComments = useCallback(async () => {
    if (!parentId) return;
    setIsLoading(true);
    try {
      const data = await commentApi.getComments(parentType, parentId);
      setComments(data);
    } catch (err) {
      setError('댓글을 불러오는데 실패했습니다.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [parentId, parentType]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const handlePostComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      const result = await commentApi.addComment({ content: newComment, parent_id: parentId, parent_type: parentType });
      setComments([...comments, result.comment]);
      setNewComment('');
    } catch (err) {
      alert('댓글 작성에 실패했습니다.');
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (window.confirm('정말로 이 댓글을 삭제하시겠습니까?')) {
      try {
        await commentApi.deleteComment(commentId);
        setComments(comments.filter(c => c.id !== commentId));
      } catch (err) {
        alert('댓글 삭제에 실패했습니다.');
      }
    }
  };

  const handleUpdateComment = async (e) => {
    e.preventDefault();
    if (!editingComment.content.trim()) return;

    try {
      await commentApi.updateComment(editingComment.id, { content: editingComment.content });
      fetchComments(); // Refresh all comments to show the update
      setEditingComment({ id: null, content: '' }); // Exit editing mode
    } catch (err) {
      alert('댓글 수정에 실패했습니다.');
    }
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className={styles.commentsContainer}>
      <h4 className={styles.title}>댓글</h4>
      {user && (
        <form onSubmit={handlePostComment} className={styles.commentForm}>
          <textarea
            className={styles.textarea}
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="댓글을 입력하세요..."
            rows="3"
          />
          <button type="submit" className={styles.submitButton}>등록</button>
        </form>
      )}

      <div className={styles.commentList}>
        {isLoading && <p>댓글 로딩 중...</p>}
        {error && <p>{error}</p>}
        {!isLoading && comments.length === 0 && <p>작성된 댓글이 없습니다.</p>}
        {comments.map(comment => (
          <div key={comment.id} className={styles.comment}>
            <div className={styles.commentHeader}>
              <span className={styles.author}>{comment.username}</span>
              <span className={styles.timestamp}>{formatDateTime(comment.updated_at)}</span>
            </div>
            {editingComment.id === comment.id ? (
              <form onSubmit={handleUpdateComment} className={styles.editForm}>
                <textarea
                  className={styles.edit_textarea}
                  value={editingComment.content}
                  onChange={(e) => setEditingComment({ ...editingComment, content: e.target.value })}
                  rows="3"
                />
                <div className={styles.editActions}>
                  <button type="button" onClick={() => setEditingComment({ id: null, content: '' })}>취소</button>
                  <button type="submit">저장</button>
                </div>
              </form>
            ) : (
              <p className={styles.content}>{comment.content}</p>
            )}

            {user && user.id === comment.user_id && editingComment.id !== comment.id && (
              <div className={styles.commentActions}>
                <button onClick={() => setEditingComment({ id: comment.id, content: comment.content })}>수정</button>
                <button onClick={() => handleDeleteComment(comment.id)}>삭제</button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default CommentSection;
