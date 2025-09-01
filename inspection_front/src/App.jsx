import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import Sidebar from './components/Sidebar/Sidebar.jsx';
import Header from './components/Header/Header.jsx';
import InspectionDashboard from './pages/InspectionDashboard.jsx';
import QualityImprovement from './pages/QualityImprovement.jsx';
import MyPosts from './pages/MyPosts.jsx';
import UserManagement from './pages/UserManagement.jsx';
import { logout } from './api/authAPI.js';
import './index.css';
import styles from './App.module.css';

// App의 메인 로직을 담는 새로운 컴포넌트
const AppContent = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  // 페이지 로드 시 (새로고침 포함) 첫 페이지만 실행되는 로직
  useEffect(() => {
    // 현재 경로가 루트('/')가 아니면 루트로 이동시킴
    if (location.pathname !== '/') {
      navigate('/', { replace: true });
    }

    // 기존의 토큰 확인 로직은 그대로 유지
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decodedUser = jwtDecode(token);
        if (decodedUser.exp * 1000 > Date.now()) {
          setCurrentUser({ name: decodedUser.username, id: decodedUser.user_id });
        } else {
          localStorage.removeItem('token');
        }
      } catch (error) {
        console.error('Invalid token:', error);
        localStorage.removeItem('token');
      }
    }
  }, []); // 의존성 배열을 비워서 첫 로드 시에만 실행되도록 함

  const handleLoginSuccess = (userData) => {
    setCurrentUser(userData);
  };

  const handleLogout = () => {
    logout();
    setCurrentUser(null);
  };

  return (
    <div className={styles.appContainer}>
      <Sidebar user={currentUser} />
      <main className={styles.mainContentContainer}>
        <Header
          user={currentUser}
          onLoginSuccess={handleLoginSuccess}
          onLogout={handleLogout}
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
  );
};

// 최상위 App 컴포넌트는 라우터 설정만 담당
const App = () => {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
};

export default App;