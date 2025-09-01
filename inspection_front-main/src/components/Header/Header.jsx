// src/components/Header.jsx
import React, { useState } from 'react';
import LoginModal from '../LoginModal/LoginModal.jsx';
import styles from './Header.module.css';

// App.jsx로부터 user, onLoginSuccess, onLogout props를 받음
function Header({ user, onLoginSuccess, onLogout }) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <header className={styles.header}>
        {/* user 정보가 있으면 환영 메시지와 로그아웃 버튼을, 없으면 로그인 버튼을 보여줌 */}
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