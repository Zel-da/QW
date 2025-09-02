import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaClipboardList, FaChartLine, FaUserEdit, FaUsersCog, FaTimes } from 'react-icons/fa'; // FaUsersCog 아이콘 추가
import styles from './Sidebar.module.css';

function Sidebar({ user, onClose }) { // user prop을 받도록 수정
  const location = useLocation();

  return (
    <nav className={styles.sidebar}>
      <button className={styles.closeButton} onClick={onClose}>
        <FaTimes />
      </button>
      
      <ul className={styles.navMenu}>
        <li className={`${styles.navItem} ${location.pathname === '/' ? styles.active : ''}`}>
          <Link to="/"><FaClipboardList /><span>출장검사 현황</span></Link>
        </li>
        <li className={`${styles.navItem} ${location.pathname === '/quality' ? styles.active : ''}`}>
          <Link to="/quality"><FaChartLine /><span>품질 개선 현황</span></Link>
        </li>

        {/* ↓↓↓ user가 존재할 때만 이 메뉴가 보이도록 추가합니다. ↓↓↓ */}
        {user && (
          <li className={`${styles.navItem} ${location.pathname === '/my-posts' ? styles.active : ''}`}>
            <Link to="/my-posts"><FaUserEdit /><span>작성내역</span></Link>
          </li>
        )}

        {/* 'test' 사용자로 로그인했을 때만 사용자 관리 메뉴를 표시 */}
        {user && user.name === 'test' && (
          <li className={`${styles.navItem} ${location.pathname === '/user-management' ? styles.active : ''}`}>
            <Link to="/user-management"><FaUsersCog /><span>사용자 관리</span></Link>
          </li>
        )}
      </ul>
    </nav>
  );
}

export default Sidebar;