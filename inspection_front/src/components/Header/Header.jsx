import React, { useState } from 'react';
import styles from './Header.module.css';
import { FaBars } from 'react-icons/fa';
import ChangePasswordModal from '../ChangePasswordModal/ChangePasswordModal.jsx';

// App.jsx로부터 user, onLoginClick, onLogout props를 받음
function Header({ user, onLoginClick, onLogout, onToggleSidebar }) {
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);
  return (
    <header className={styles.header}>
      <button className={styles.sidebarToggleButton} onClick={onToggleSidebar}>
        <FaBars />
      </button>
      {user ? (
        <div className={styles.userInfo}>
          <span>안녕하세요 {user.name}님</span>
          <button onClick={onLogout} className={styles.logoutButton}>로그아웃</button>
          <button onClick={() => setIsChangePasswordModalOpen(true)} className={styles.changePasswordButton}>비밀번호 변경</button>
        </div>
      ) : (
        <button onClick={onLoginClick} className={styles.loginButton}>
          로그인
        </button>
      )}
    </header>
    {isChangePasswordModalOpen && <ChangePasswordModal onClose={() => setIsChangePasswordModalOpen(false)} />}
  );
}

export default Header;