import React, { useState, useEffect, useCallback } from 'react';
import { getUsers, createUser, deleteUser, updateUser } from '../api/userApi'; // updateUser 임포트
import styles from './UserManagement.module.css';

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const [newUser, setNewUser] = useState({ username: '', password: '', team: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);

    // 수정 관련 상태
    const [editingUserId, setEditingUserId] = useState(null);
    const [editingTeam, setEditingTeam] = useState('');

    // 페이지네이션 상태
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

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
            setNewUser({ username: '', password: '', team: '' });
            await fetchUsers();
        } catch (err) {
            alert(`사용자 추가 실패: ${err.message}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteUser = async (id) => {
        if (window.confirm(`정말로 이 사용자를 삭제하시겠습니까?`)) {
            try {
                await deleteUser(id);
                await fetchUsers();
            } catch (err) {
                alert(`삭제 실패: ${err.message}`);
            }
        }
    };

    // --- 수정 관련 핸들러 ---
    const handleEditClick = (user) => {
        setEditingUserId(user.id);
        setEditingTeam(user.team || '');
    };

    const handleCancelEdit = () => {
        setEditingUserId(null);
        setEditingTeam('');
    };

    const handleUpdateUser = async (id) => {
        try {
            await updateUser(id, { team: editingTeam });
            setEditingUserId(null);
            setEditingTeam('');
            await fetchUsers();
        } catch (err) {
            alert(`팀 업데이트 실패: ${err.message}`);
        }
    };

    // --- 페이지네이션 로직 ---
    const pageCount = Math.ceil(users.length / itemsPerPage);
    const paginatedUsers = users.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
    const handlePageChange = (pageNumber) => {
        if (pageNumber > 0 && pageNumber <= pageCount) {
            setCurrentPage(pageNumber);
        }
    };

    if (isLoading) return <div className={styles.message}>로딩 중...</div>;
    if (error) return <div className={`${styles.message} ${styles.error}`}>오류: {error}</div>;

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>사용자 관리</h1>

            <div className={styles.section}>
                <h2 className={styles.sectionTitle}>새 사용자 추가</h2>
                <form onSubmit={handleCreateUser} className={styles.form}>
                    <input type="text" name="username" placeholder="새 사용자명" value={newUser.username} onChange={handleInputChange} className={styles.input} required />
                    <input type="password" name="password" placeholder="새 비밀번호" value={newUser.password} onChange={handleInputChange} className={styles.input} required />
                    <input type="text" name="team" placeholder="팀 (선택 사항)" value={newUser.team} onChange={handleInputChange} className={styles.input} />
                    <button type="submit" className={styles.button} disabled={isSubmitting}>{isSubmitting ? '추가 중...' : '사용자 추가'}</button>
                </form>
            </div>

            <div className={styles.section}>
                <h2 className={styles.sectionTitle}>사용자 목록</h2>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>사용자명</th>
                            <th>팀</th>
                            <th>마지막 로그인</th>
                            <th>조치</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedUsers.map(user => (
                            <tr key={user.id}>
                                <td>{user.id}</td>
                                <td>{user.username}</td>
                                <td>
                                    {editingUserId === user.id ? (
                                        <input 
                                            type="text" 
                                            value={editingTeam}
                                            onChange={(e) => setEditingTeam(e.target.value)}
                                            className={styles.editInput}
                                        />
                                    ) : (
                                        user.team || '미지정'
                                    )}
                                </td>
                                <td>{user.last_login ? new Date(user.last_login).toLocaleString() : 'N/A'}</td>
                                <td className={styles.actionCell}>
                                    {editingUserId === user.id ? (
                                        <>
                                            <button className={styles.saveButton} onClick={() => handleUpdateUser(user.id)}>저장</button>
                                            <button className={styles.cancelButton} onClick={handleCancelEdit}>취소</button>
                                        </>
                                    ) : (
                                        <button className={styles.editButton} onClick={() => handleEditClick(user)}>수정</button>
                                    )}
                                    <button className={styles.deleteButton} onClick={() => handleDeleteUser(user.id)}>삭제</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {pageCount > 1 && (
                    <div className={styles.pagination}>
                        <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} className={styles.pageButton}>이전</button>
                        {Array.from({ length: pageCount }, (_, index) => (
                            <button
                                key={index + 1}
                                onClick={() => handlePageChange(index + 1)}
                                className={`${styles.pageButton} ${currentPage === index + 1 ? styles.active : ''}`}>
                                {index + 1}
                            </button>
                        ))}
                        <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === pageCount} className={styles.pageButton}>다음</button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserManagement;