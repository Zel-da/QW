import React from 'react';
import styles from './Header.module.css';

// App.jsx로부터 user, onLoginClick, onLogout props를 받음
function Header({ user, onLoginClick, onLogout }) {
  return (
    <header className={styles.header}>
      {user ? (
        <div className={styles.userInfo}>
          <span>안녕하세요 {user.name}님</span>
          <button onClick={onLogout} className={styles.logoutButton}>로그아웃</button>
        </div>
      ) : (
        <button onClick={onLoginClick} className={styles.loginButton}>
          로그인
        </button>
      )}
    </header>
  );
}

export default Header;