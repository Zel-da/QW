// src/components/Header.jsx
import React, { useState } from 'react';
import LoginModal from '../LoginModal/LoginModal.jsx';
import styles from './Header.module.css';
import { FaBars } from 'react-icons/fa';

// App.jsx로부터 user, onLoginSuccess, onLogout props를 받음
function Header({ user, onLoginSuccess, onLogout, onToggleSidebar }) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <header className={styles.header}>
        <button onClick={onToggleSidebar} className={styles.menuButton}>
          <FaBars />
        </button>
        <div className={styles.rightSection}>
          {user ? (
            <div className={styles.userInfo}>
              <span>안녕하세요 {user.name}님</span>
              <button onClick={onLogout} className={styles.logoutButton}>로그아웃</button>
            </div>
          ) : (
            <button onClick={() => setIsModalOpen(true)} className={styles.loginButton}>
              로그인
            </button>
          )}
        </div>
      </header>

      {/* isModalOpen이 true일 때만 LoginModal을 렌더링 */}
      {isModalOpen && (
        <LoginModal
          onClose={() => setIsModalOpen(false)}
          onLoginSuccess={onLoginSuccess}
        />
      )}
    </>
  );
}

export default Header;