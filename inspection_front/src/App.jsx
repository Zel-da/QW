import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar/Sidebar.jsx';
import Header from './components/Header/Header.jsx';
import InspectionDashboard from './pages/InspectionDashboard.jsx';
import QualityImprovement from './pages/QualityImprovement.jsx';
import MyPosts from './pages/MyPosts.jsx';
import UserManagement from './pages/UserManagement.jsx';
import './index.css';
import styles from './App.module.css';

// App의 메인 로직을 담는 새로운 컴포넌트
const AppContent = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  

  // On initial load, check for a token and set the user state
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        // NOTE: The new version uses a different auth method (no jwt-decode).
        // We will stick to the current project's established auth method for now.
        const decodedUser = JSON.parse(atob(token.split('.')[1])); // Basic decode for username
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
  }, []);

  const handleLoginSuccess = (userData) => {
    setCurrentUser(userData);
    // The new version stores the whole user object, but our backend provides a token.
    // We will continue to store the token.
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
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