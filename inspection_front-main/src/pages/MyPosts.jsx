// src/pages/MyPosts.jsx

import React, { useState, useEffect } from 'react';
import { getInspections } from '../api/inspectionAPI.js';
import { getQualityItems } from '../api/qualityApi.js';
import styles from './MyPosts.module.css';
// 1. 필요한 상세 정보 모달들을 import 합니다.
import InspectionDetailModal from '../components/InspectionDetailModal/InspectionDetailModal.jsx';
import QualityDetailModal from '../components/QualityDetailModal/QualityDetailModal.jsx';

function MyPosts({ user }) {
    const [myInspections, setMyInspections] = useState([]);
    const [myQualityItems, setMyQualityItems] = useState([]);

    // 2. 어떤 모달을 열지, 어떤 항목을 선택했는지 관리할 state 추가
    const [selectedItem, setSelectedItem] = useState(null);
    const [modalType, setModalType] = useState(null); // 'inspection' 또는 'quality'

    useEffect(() => {
        if (!user) return;
        const fetchMyData = async () => {
            const [inspections, qualityItems] = await Promise.all([
                getInspections(),
                getQualityItems()
            ]);
            setMyInspections(inspections.filter(item => item.manager === user.name));
            setMyQualityItems(qualityItems.filter(item => item.manager === user.name));
        };
        fetchMyData();
    }, [user]);

    // 3. 행 클릭 시 실행될 핸들러 함수
    const handleRowClick = (item, type) => {
        setSelectedItem(item);
        setModalType(type);
    };

    // 4. 수정 성공 시 목록을 업데이트하는 함수
    const handleSuccess = (updatedEntry) => {
        // 어떤 종류의 목록을 업데이트할지 결정
        if (modalType === 'inspection') {
            setMyInspections(prevItems => {
                // 기존 목록에서 수정된 항목과 같은 id를 가진 항목을 찾음
                return prevItems.map(item =>
                    item.id === updatedEntry.id ? updatedEntry : item
                );
            });
        } else if (modalType === 'quality') {
            setMyQualityItems(prevItems => {
                return prevItems.map(item =>
                    item.id === updatedEntry.id ? updatedEntry : item
                );
            });
        }
    };

    const closeModal = () => {
        setModalType(null);
        setSelectedItem(null);
    };

    if (!user) { return <p>로그인이 필요합니다.</p>; }

    return (
        <>
            <div className={styles.contentTitleArea}>
                <h2 className={styles.contentMainTitle}>작성내역</h2>
                <p className={styles.contentSubTitle}>{user.name}님이 작성한 항목들을 확인합니다.</p>
            </div>
            <div className={styles.scrollableContent}>
                {/* 내가 작성한 출장검사 목록 */}
                <section className={styles.listSection}>
                    <h3>출장검사 작성 목록</h3>
                    <table className={styles.dataTable}>
                        <thead>
                            <tr><th>업체명</th><th>부품명</th><th>목표일</th><th>진행률</th><th>상태</th></tr>
                        </thead>
                        <tbody>
                            {myInspections.length > 0 ? (
                                myInspections.map((item, index) => (
                                    // 5. tr에 onClick 이벤트와 className 추가
                                    <tr key={`insp-${item.id || index}`} onClick={() => handleRowClick(item, 'inspection')} className={styles.clickableRow}>
                                        <td>{item.company}</td>
                                        <td>{item.partName}</td>
                                        <td>{item.dueDate}</td>
                                        <td>{item.progress}%</td>
                                        <td>{item.status === 'inProgress' ? '진행중' : item.status === 'completed' ? '완료' : '지연'}</td>
                                    </tr>
                                ))
                            ) : (<tr><td colSpan="5">작성한 출장검사 내역이 없습니다.</td></tr>)}
                        </tbody>
                    </table>
                </section>

                {/* 내가 작성한 품질개선 목록 */}
                <section className={styles.listSection}>
                    <h3>품질개선 작성 목록</h3>
                    <table className={styles.dataTable}>
                        <thead>
                            <tr><th>업체명</th><th>개선항목</th><th>마감일</th><th>진행률</th><th>상태</th></tr>
                        </thead>
                        <tbody>
                            {myQualityItems.length > 0 ? (
                                myQualityItems.map((item) => (
                                    // 5. tr에 onClick 이벤트와 className 추가
                                    <tr key={`qual-${item.id}`} onClick={() => handleRowClick(item, 'quality')} className={styles.clickableRow}>
                                        <td>{item.company}</td>
                                        <td className={styles.longText}>{item.improvementItem}</td>
                                        <td>{item.endDate}</td>
                                        <td>{item.progress}%</td>
                                        <td>{item.status === 'inProgress' ? '진행중' : item.status === 'completed' ? '완료' : '지연'}</td>
                                    </tr>
                                ))
                            ) : (<tr><td colSpan="5">작성한 품질개선 내역이 없습니다.</td></tr>)}
                        </tbody>
                    </table>
                </section>
            </div>

            {/* 6. 조건부로 상세 정보 모달 렌더링 */}
            {modalType === 'inspection' && (
                <InspectionDetailModal
                    item={selectedItem}
                    user={user}
                    onClose={closeModal}
                    onSuccess={handleSuccess}
                />
            )}
            {modalType === 'quality' && (
                <QualityDetailModal
                    item={selectedItem}
                    user={user}
                    onClose={closeModal}
                    onSuccess={handleSuccess}
                />
            )}
        </>
    );
}

export default MyPosts;