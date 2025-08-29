import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import Sidebar from './components/Sidebar/Sidebar.jsx';
import Header from './components/Header/Header.jsx';
import InspectionDashboard from './pages/InspectionDashboard.jsx';
import QualityImprovement from './pages/QualityImprovement.jsx';
import './index.css';
import styles from './App.module.css';
import MyPosts from './pages/MyPosts.jsx';
import { logout } from './api/authAPI.js';

const App = () => {
  const [currentUser, setCurrentUser] = useState(null);

  // On initial load, check for a token and set the user state
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decodedUser = jwtDecode(token);
        // Check if token is expired
        if (decodedUser.exp * 1000 > Date.now()) {
          setCurrentUser({ name: decodedUser.username, id: decodedUser.user_id });
        } else {
          // Token is expired, remove it
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
  };

  const handleLogout = () => {
    logout(); // Clears token from localStorage
    setCurrentUser(null);
    // No need to redirect here, UI will update automatically
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
              {/* For now, we render all routes and components can decide what to show based on user prop */}
              <Route path="/" element={<InspectionDashboard user={currentUser} />} />
              <Route path="/quality" element={<QualityImprovement user={currentUser} />} />
              <Route path="/my-posts" element={<MyPosts user={currentUser} />} />
            </Routes>
          </div>
        </main>
      </div>
    </BrowserRouter>
  );
};

export default App;
