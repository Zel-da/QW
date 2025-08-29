// src/pages/MyPosts.jsx

import React, { useState, useEffect } from 'react';
import { getInspections } from '../api/inspectionAPI.js';
import { getQualityItems } from '../api/qualityApi.js';
import styles from './MyPosts.module.css'; // 페이지 전용 CSS

function MyPosts({ user }) {
    const [myInspections, setMyInspections] = useState([]);
    const [myQualityItems, setMyQualityItems] = useState([]);

    useEffect(() => {
        // 로그인한 사용자가 없으면 데이터를 불러오지 않음
        if (!user) return;

        const fetchMyData = async () => {
            // 두 API를 동시에 호출하여 데이터를 가져옴
            const [inspections, qualityItems] = await Promise.all([
                getInspections(),
                getQualityItems()
            ]);

            // 로그인한 사용자의 이름으로 데이터 필터링
            setMyInspections(inspections.filter(item => item.manager === user.name));
            setMyQualityItems(qualityItems.filter(item => item.manager === user.name));
        };

        fetchMyData();
    }, [user]); // user 정보가 변경될 때마다 다시 데이터를 불러옴

    if (!user) {
        return <p>로그인이 필요합니다.</p>;
    }

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
                            <tr>
                                <th>업체명</th>
                                <th>부품명</th>
                                <th>목표일</th>
                                <th>진행률</th>
                                <th>상태</th>
                            </tr>
                        </thead>
                        <tbody>
                            {myInspections.length > 0 ? (
                                myInspections.map((item, index) => (
                                    <tr key={`insp-${index}`}>
                                        <td>{item.company}</td>
                                        <td>{item.partName}</td>
                                        <td>{item.dueDate}</td>
                                        <td>{item.progress}%</td>
                                        <td>{item.status === 'inProgress' ? '진행중' : item.status === 'completed' ? '완료' : '지연'}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan="5">작성한 출장검사 내역이 없습니다.</td></tr>
                            )}
                        </tbody>
                    </table>
                </section>

                {/* 내가 작성한 품질개선 목록 */}
                <section className={styles.listSection}>
                    <h3>품질개선 작성 목록</h3>
                    <table className={styles.dataTable}>
                        <thead>
                            <tr>
                                <th>업체명</th>
                                <th>개선항목</th>
                                <th>마감일</th>
                                <th>진행률</th>
                                <th>상태</th>
                            </tr>
                        </thead>
                        <tbody>
                            {myQualityItems.length > 0 ? (
                                myQualityItems.map((item) => (
                                    <tr key={`qual-${item.id}`}>
                                        <td>{item.company}</td>
                                        <td className={styles.longText}>{item.improvementItem}</td>
                                        <td>{item.endDate}</td>
                                        <td>{item.progress}%</td>
                                        <td>{item.status === 'inProgress' ? '진행중' : item.status === 'completed' ? '완료' : '지연'}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan="5">작성한 품질개선 내역이 없습니다.</td></tr>
                            )}
                        </tbody>
                    </table>
                </section>
            </div>
        </>
    );
}

export default MyPosts;