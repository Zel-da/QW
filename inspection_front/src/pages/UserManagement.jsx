import React, { useState, useEffect, useCallback } from 'react';
import { getUsers, createUser, deleteUser } from '../api/userApi';
import styles from './UserManagement.module.css';

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const [newUser, setNewUser] = useState({ username: '', password: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchUsers = useCallback(async () => {
        try {
            setIsLoading(true);
            const data = await getUsers();
            setUsers(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewUser(prev => ({ ...prev, [name]: value }));
    };

    const handleCreateUser = async (e) => {
        e.preventDefault();
        if (!newUser.username || !newUser.password) {
            alert('사용자명과 비밀번호를 모두 입력해주세요.');
            return;
        }
        setIsSubmitting(true);
        try {
            await createUser(newUser);
            setNewUser({ username: '', password: '' }); // Reset form
            await fetchUsers(); // Refresh user list
        } catch (err) {
            alert(`사용자 추가 실패: ${err.message}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteUser = async (id) => {
        if (window.confirm(`정말로 이 사용자를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`)) {
            try {
                await deleteUser(id);
                await fetchUsers(); // Refresh user list
            } catch (err) {
                alert(`삭제 실패: ${err.message}`);
            }
        }
    };

    if (isLoading) {
        return <div className={styles.message}>로딩 중...</div>;
    }

    if (error) {
        return <div className={`${styles.message} ${styles.error}`}>오류: {error}</div>;
    }

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>사용자 관리</h1>

            <div className={styles.section}>
                <h2 className={styles.sectionTitle}>새 사용자 추가</h2>
                <form onSubmit={handleCreateUser} className={styles.form}>
                    <input 
                        type="text" 
                        name="username" 
                        placeholder="새 사용자명" 
                        value={newUser.username} 
                        onChange={handleInputChange} 
                        className={styles.input}
                        required
                    />
                    <input 
                        type="password" 
                        name="password" 
                        placeholder="새 비밀번호" 
                        value={newUser.password} 
                        onChange={handleInputChange} 
                        className={styles.input}
                        required
                    />
                    <button type="submit" className={styles.button} disabled={isSubmitting}>
                        {isSubmitting ? '추가 중...' : '사용자 추가'}
                    </button>
                </form>
            </div>

            <div className={styles.section}>
                <h2 className={styles.sectionTitle}>사용자 목록</h2>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>사용자명</th>
                            <th>마지막 로그인</th>
                            <th>조치</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(user => (
                            <tr key={user.id}>
                                <td>{user.id}</td>
                                <td>{user.username}</td>
                                <td>{user.last_login ? new Date(user.last_login).toLocaleString() : 'N/A'}</td>
                                <td>
                                    <button 
                                        className={styles.deleteButton}
                                        onClick={() => handleDeleteUser(user.id)}
                                    >
                                        삭제
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default UserManagement;
