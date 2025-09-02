// src/components/Sidebar/index.jsx 또는 Sidebar.jsx

import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaClipboardList, FaChartLine, FaUserEdit, FaTimes } from 'react-icons/fa'; // FaUserEdit 아이콘 추가
import styles from './Sidebar.module.css';
import companyMark from '../../assets/cebotics-ci.png';



function Sidebar({ user, onClose }) {
  const location = useLocation();

  const handleLinkClick = () => {
    // 화면이 768px 이하일 때만 메뉴를 닫음
    if (window.innerWidth <= 768 && onClose) {
      onClose(); // props로 받은 onClose 함수를 호출
    }
  };

  return (
    <nav className={styles.sidebar}>
      <button className={styles.closeButton} onClick={onClose}>
        <FaTimes />
      </button>
      <h1 className={styles.logo}>외부업체 출장검사 대시보드</h1>
      <ul className={styles.navMenu}>
        <li className={`${styles.navItem} ${location.pathname === '/' ? styles.active : ''}`}>
          <Link to="/" onClick={handleLinkClick}><FaClipboardList /><span>출장검사 현황</span></Link>
        </li>
        <li className={`${styles.navItem} ${location.pathname === '/quality' ? styles.active : ''}`}>
          <Link to="/quality" onClick={handleLinkClick}><FaChartLine /><span>품질 개선 현황</span></Link>
        </li>

        {/* ↓↓↓ user가 존재할 때만 이 메뉴가 보이도록 추가합니다. ↓↓↓ */}
        {user && (
          <li className={`${styles.navItem} ${location.pathname === '/my-posts' ? styles.active : ''}`}>
            <Link to="/my-posts" onClick={handleLinkClick}><FaUserEdit /><span>내 작성내역</span></Link>
          </li>
        )}
      </ul>

      {/* === 하단 회사 아이콘 영역 ===
      <div className={styles.brandFooter}>
        
        <img src={companyMark} alt="수산세보틱스 CI" />


      </div> */}
    </nav>
  );
}

export default Sidebar;