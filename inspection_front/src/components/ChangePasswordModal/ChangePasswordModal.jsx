import React, { useState } from 'react';
import styles from './ChangePasswordModal.module.css';
import * as authAPI from '../../api/authAPI'; // Assuming authAPI handles user-related API calls

const ChangePasswordModal = ({ onClose }) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setIsError(false);

    if (newPassword !== confirmNewPassword) {
      setMessage('새 비밀번호가 일치하지 않습니다.');
      setIsError(true);
      return;
    }

    if (newPassword.length < 6) {
      setMessage('새 비밀번호는 최소 6자 이상이어야 합니다.');
      setIsError(true);
      return;
    }

    try {
      const response = await authAPI.changePassword({
        current_password: currentPassword,
        new_password: newPassword,
        confirm_new_password: confirmNewPassword,
      });
      setMessage(response.message);
      setIsError(false);
      // Optionally close modal after a short delay or on user action
      setTimeout(onClose, 2000); 
    } catch (error) {
      setMessage(error.message || '비밀번호 변경 중 오류가 발생했습니다.');
      setIsError(true);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2>비밀번호 변경</h2>
          <button className={styles.closeButton} onClick={onClose}>&times;</button>
        </div>
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="currentPassword">현재 비밀번호</label>
            <input
              type="password"
              id="currentPassword"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="newPassword">새 비밀번호</label>
            <input
              type="password"
              id="newPassword"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="confirmNewPassword">새 비밀번호 확인</label>
            <input
              type="password"
              id="confirmNewPassword"
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)}
              required
            />
          </div>
          {message && (
            <p className={isError ? styles.errorMessage : styles.successMessage}>
              {message}
            </p>
          )}
          <button type="submit" className={styles.submitButton}>비밀번호 변경</button>
        </form>
      </div>
    </div>
  );
};

export default ChangePasswordModal;
