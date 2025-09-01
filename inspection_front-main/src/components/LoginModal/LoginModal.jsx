// src/components/LoginModal.jsx

import React, { useState } from 'react';
import { login } from '../../api/authAPI.js';
import styles from './LoginModal.module.css';

function LoginModal({ onClose, onLoginSuccess }) {
    const [id, setId] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    // 로그인 버튼 클릭 시 실행될 함수
    const handleLogin = async (e) => {
        e.preventDefault(); // form의 기본 새로고침 동작 방지
        setError(''); // 이전 에러 메시지 초기화
        try {
            const userData = await login(id, password);
            onLoginSuccess(userData); // 부모 컴포넌트에 로그인 성공 알림
            onClose(); // 모달 닫기
        } catch (err) {
            setError(err.message); // 에러 메시지 표시
        }
    };

    return (
        // 모달 바깥을 클릭하면 닫히도록 onClick={onClose} 설정
        <div className={styles.modalBackdrop} onClick={onClose}>
            {/* 실제 모달 컨텐츠를 클릭했을 때 이벤트가 부모로 전파(버블링)되는 것을 막음 */}
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                <button className={styles.closeButton} onClick={onClose}>&times;</button>
                <h2>로그인</h2>
                <form onSubmit={handleLogin}>
                    <input
                        type="text"
                        className={styles.inputField}
                        placeholder="아이디"
                        value={id}
                        onChange={(e) => setId(e.target.value)}
                        required
                    />
                    <input
                        type="password"
                        className={styles.inputField}
                        placeholder="비밀번호"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    {error && <p className={styles.errorMessage}>{error}</p>}
                    <button type="submit" className={styles.loginButton}>로그인</button>
                </form>
                <div className={styles.signupPrompt}>
                    <p>아직 회원이 아니신가요?</p>
                    <button className={styles.signupButton}>회원가입</button>
                </div>
            </div>
        </div>
    );
}

export default LoginModal;