import api from '../api';

const commentApi = {
  getComments: async (parentType, parentId) => {
    try {
      const response = await api.get(`/api/comments/${parentType}/${parentId}`);
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch comments for ${parentType} ${parentId}:`, error);
      throw new Error(error.response?.data?.message || '댓글을 불러오는 데 실패했습니다.');
    }
  },

  addComment: async (commentData) => {
    try {
      const response = await api.post('/api/comments', commentData);
      return response.data;
    } catch (error) {
      console.error('Failed to add comment:', error);
      throw new Error(error.response?.data?.message || '댓글 추가에 실패했습니다.');
    }
  },

  updateComment: async (commentId, commentData) => {
    try {
      const response = await api.put(`/api/comments/${commentId}`, commentData);
      return response.data;
    } catch (error) {
      console.error(`Failed to update comment ${commentId}:`, error);
      throw new Error(error.response?.data?.message || '댓글 수정에 실패했습니다.');
    }
  },

  deleteComment: async (commentId) => {
    try {
      const response = await api.delete(`/api/comments/${commentId}`);
      return response.data;
    } catch (error) {
      console.error(`Failed to delete comment ${commentId}:`, error);
      throw new Error(error.response?.data?.message || '댓글 삭제에 실패했습니다.');
    }
  },
};

export default commentApi;
