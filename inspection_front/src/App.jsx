import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar/Sidebar.jsx';
import Header from './components/Header/Header.jsx';
import LoginModal from './components/LoginModal/LoginModal.jsx';
import InspectionDashboard from './pages/InspectionDashboard.jsx';
import QualityImprovement from './pages/QualityImprovement.jsx';
import MyPosts from './pages/MyPosts.jsx';
import UserManagement from './pages/UserManagement.jsx';
import Spinner from './components/Spinner/Spinner.jsx'; // Spinner 임포트
import './index.css';
import styles from './App.module.css';
import { subscribeToLoading } from './api/api.js';

const AppContent = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // 초기 인증 로딩
  const [globalLoadingState, setGlobalLoadingState] = useState({ isLoading: false, isColdStarting: false, loadingMessage: '' });
  const [isSidebarVisible, setIsSidebarVisible] = useState(window.innerWidth > 768);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setIsSidebarVisible(true);
      } else {
        setIsSidebarVisible(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const closeSidebar = () => setIsSidebarVisible(false);
  const toggleSidebar = () => setIsSidebarVisible(!isSidebarVisible);
  const isMobile = () => window.innerWidth <= 768;

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decodedUser = JSON.parse(atob(token.split('.')[1]));
        if (decodedUser.exp * 1000 > Date.now()) {
          setCurrentUser({ name: decodedUser.username, id: decodedUser.user_id });
        } else {
          localStorage.removeItem('token');
          setIsLoginModalOpen(true);
        }
      } catch (error) {
        console.error('Invalid token:', error);
        localStorage.removeItem('token');
        setIsLoginModalOpen(true);
      }
    } else {
      setIsLoginModalOpen(true);
    }
    setIsLoading(false);

    const unsubscribe = subscribeToLoading(setGlobalLoadingState);
    return () => unsubscribe();
  }, []);

  const handleLoginSuccess = (userData) => {
    setCurrentUser(userData);
    setIsLoginModalOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setCurrentUser(null);
    setIsLoginModalOpen(true);
  };

  // 초기 인증 확인 중일 때 전체 화면 스피너 표시
  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spinner size="60px" />
      </div>
    );
  }

  return (
    <>
      {globalLoadingState.isLoading && (
        <div className="global-loading-overlay">
          <div className="global-loading-message">
            <Spinner />
            <p>{globalLoadingState.isColdStarting ? globalLoadingState.loadingMessage : '로딩 중...'}</p>
          </div>
        </div>
      )}

      {isLoginModalOpen && (
        <LoginModal
          onClose={() => {}}
          onLoginSuccess={handleLoginSuccess}
        />
      )}
      <div className={styles.appContainer} style={{ filter: (isLoginModalOpen || globalLoadingState.isLoading) ? 'blur(4px)' : 'none', pointerEvents: (isLoginModalOpen || globalLoadingState.isLoading) ? 'none' : 'auto' }}>
        {isSidebarVisible && <Sidebar user={currentUser} onClose={closeSidebar} />}

        {isMobile() && isSidebarVisible && (
          <div className={styles.sidebarBackdrop} onClick={closeSidebar}></div>
        )}

        <main className={styles.mainContentContainer}>
          <Header
            user={currentUser}
            onLoginClick={() => setIsLoginModalOpen(true)}
            onLogout={handleLogout}
            onToggleSidebar={toggleSidebar}
          />
          <div className={styles.mainContent}>
            <Routes>
              <Route path="/" element={<InspectionDashboard user={currentUser} />} />
              <Route path="/quality" element={<QualityImprovement user={currentUser} />} />
              <Route path="/my-posts" element={<MyPosts user={currentUser} />} />
              {currentUser && currentUser.name === 'test' && (
                <Route path="/user-management" element={<UserManagement />} />
              )}
            </Routes>
          </div>
        </main>
      </div>
    </>
  );
};

const App = () => (
  <BrowserRouter>
    <AppContent />
  </BrowserRouter>
);

export default App;