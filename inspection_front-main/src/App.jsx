import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar/Sidebar.jsx';
import Header from './components/Header/Header.jsx';
import InspectionDashboard from './pages/InspectionDashboard.jsx';
import QualityImprovement from './pages/QualityImprovement.jsx';
import MyPosts from './pages/MyPosts.jsx';
import './index.css';
import styles from './App.module.css';

function App() {
  // --- 로그인 상태 관리 ---
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const storedUser = localStorage.getItem('user');
      return storedUser ? JSON.parse(storedUser) : null;
    } catch (error) {
      console.error("로컬 스토리지 파싱 에러:", error);
      return null;
    }
  });

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('user');
    }
  }, [currentUser]);

  const handleLoginSuccess = (userData) => {
    setCurrentUser(userData);
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  // --- 사이드바 반응형 상태 관리 ---
  const [isSidebarVisible, setIsSidebarVisible] = useState(window.innerWidth > 768);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setIsSidebarVisible(true);
      } else {
        // 화면이 작아지는 순간에는 사이드바를 닫는 것이
        // 일반적인 사용자 경험에 더 좋습니다.
        setIsSidebarVisible(false);
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // 사이드바 닫기 함수
  const closeSidebar = () => {
    setIsSidebarVisible(false);
  };

  // 사이드바 열기/닫기 토글 함수
  const toggleSidebar = () => {
    setIsSidebarVisible(!isSidebarVisible);
  };

  // ▼▼▼ 모바일 화면인지 실시간으로 확인하는 변수 ▼▼▼
  // (useEffect 외부에서 상태를 감지하는 대신, 렌더링 시점에 확인)
  const isMobile = () => window.innerWidth <= 768;

  return (
    <BrowserRouter>
      <div className={styles.appContainer}>
        {isSidebarVisible && <Sidebar user={currentUser} onClose={closeSidebar} />}

        {/* ▼▼▼ 모바일이고, 사이드바가 열려있을 때만 백드롭 표시 ▼▼▼ */}
        {isMobile() && isSidebarVisible && (
          <div className={styles.sidebarBackdrop} onClick={closeSidebar}></div>
        )}

        <main className={styles.mainContentContainer}>
          <Header
            user={currentUser}
            onLoginSuccess={handleLoginSuccess}
            onLogout={handleLogout}
            onToggleSidebar={toggleSidebar}
          />
          <div className={styles.mainContent}>
            <Routes>
              <Route path="/" element={<InspectionDashboard user={currentUser} />} />
              <Route path="/quality" element={<QualityImprovement user={currentUser} />} />
              <Route path="/my-posts" element={<MyPosts user={currentUser} />} />
            </Routes>
          </div>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;