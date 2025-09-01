import React, { useState, useEffect } from 'react'; // useEffect import 추가
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar/Sidebar.jsx';
import Header from './components/Header/Header.jsx';
import InspectionDashboard from './pages/InspectionDashboard.jsx';
import QualityImprovement from './pages/QualityImprovement.jsx';
import './index.css';
import styles from './App.module.css';
import MyPosts from './pages/MyPosts.jsx';

function App() {
  // 1. useState의 초기값을 localStorage에서 가져오도록 변경
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const storedUser = localStorage.getItem('user');
      return storedUser ? JSON.parse(storedUser) : null;
    } catch (error) {
      console.error("로컬 스토리지 파싱 에러:", error);
      return null;
    }
  });

  // 2. currentUser가 변경될 때마다 localStorage에 자동으로 저장하는 useEffect 추가
  useEffect(() => {
    if (currentUser) {
      // 사용자 정보가 있으면 localStorage에 저장
      localStorage.setItem('user', JSON.stringify(currentUser));
    } else {
      // 사용자 정보가 없으면 (로그아웃 시) localStorage에서 삭제
      localStorage.removeItem('user');
    }
  }, [currentUser]); // currentUser가 바뀔 때마다 이 효과가 실행됩니다.

  // 로그인 성공 시 호출될 함수 (이제 state만 변경하면 useEffect가 알아서 저장)
  const handleLoginSuccess = (userData) => {
    setCurrentUser(userData);
  };

  // 로그아웃 시 호출될 함수 (이제 state만 변경하면 useEffect가 알아서 삭제)
  const handleLogout = () => {
    setCurrentUser(null);
  };

  return (
    <BrowserRouter>
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

              <Route path="/quality" element={<QualityImprovement user={currentUser} />} />
              <Route path="/" element={<InspectionDashboard user={currentUser} />} />
              <Route path="/quality" element={<QualityImprovement />} />
              <Route path="/my-posts" element={<MyPosts user={currentUser} />} />


            </Routes>
          </div>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;