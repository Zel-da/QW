import React, { useState, useEffect } from 'react';
import { getInspections } from '../api/inspectionAPI.js';
import { getQualityItems } from '../api/qualityApi.js';
import styles from './MyPosts.module.css';
import InspectionDetailModal from '../components/InspectionDetailModal/InspectionDetailModal.jsx';
import QualityDetailModal from '../components/QualityDetailModal/QualityDetailModal.jsx';
import AddInspectionModal from '../components/AddInspectionModal/AddInspectionModal.jsx';
import AddQualityItemModal from '../components/AddQualityItemModal/AddQualityItemModal.jsx';
import { FaPlus } from 'react-icons/fa';

function MyPosts({ user }) {
    const [myInspections, setMyInspections] = useState([]);
    const [myQualityItems, setMyQualityItems] = useState([]);
    const [selectedItem, setSelectedItem] = useState(null);
    const [detailModalType, setDetailModalType] = useState(null);
    const [addModalType, setAddModalType] = useState(null);

    useEffect(() => {
        if (!user) return;
        const fetchMyData = async () => {
            const [inspections, qualityItems] = await Promise.all([getInspections(), getQualityItems()]);
            setMyInspections(inspections.filter(item => item.manager === user.name));
            setMyQualityItems(qualityItems.filter(item => item.manager === user.name));
        };
        fetchMyData();
    }, [user]);

    const handleRowClick = (item, type) => {
        setSelectedItem(item);
        setDetailModalType(type);
    };

    const handleUpdateSuccess = (updatedEntry) => {
        if (detailModalType === 'inspection') {
            setMyInspections(prev => prev.map(item => item.id === updatedEntry.id ? updatedEntry : item));
        } else if (detailModalType === 'quality') {
            setMyQualityItems(prev => prev.map(item => item.id === updatedEntry.id ? updatedEntry : item));
        }
    };

    const handleAddSuccess = (newEntry, type) => {
        if (type === 'inspection') {
            setMyInspections(prev => [newEntry, ...prev]);
        } else if (type === 'quality') {
            setMyQualityItems(prev => [newEntry, ...prev]);
        }
    };

    const closeDetailModal = () => {
        setDetailModalType(null);
        setSelectedItem(null);
    };

    if (!user) { return <p>로그인이 필요합니다.</p>; }

    return (
        <>
            <div className={styles.contentTitleArea}>
                <h2 className={styles.contentMainTitle}>내 작성내역</h2>
                <p className={styles.contentSubTitle}>{user.name}님이 작성한 항목들을 확인합니다.</p>
            </div>
            <div className={styles.scrollableContent}>
                {/* --- 내가 작성한 출장검사 목록 --- */}
                <section className={styles.listSection}>
                    <div className={styles.sectionHeader}>
                        <h3>출장검사 작성 목록</h3>
                        <button onClick={() => setAddModalType('inspection')} className={styles.addButton}><FaPlus size={12} /><span>추가</span></button>
                    </div>
                    {/* ▼▼▼ 데스크탑 테이블 (내용 추가) ▼▼▼ */}
                    <table className={styles.dataTable}>
                        <thead>
                            <tr><th>업체명</th><th>부품명</th><th>목표일</th><th>진행률</th><th>상태</th></tr>
                        </thead>
                        <tbody>
                            {myInspections.length > 0 ? (
                                myInspections.map(item => (
                                    <tr key={`insp-row-${item.id}`} onClick={() => handleRowClick(item, 'inspection')} className={styles.clickableRow}>
                                        <td>{item.company}</td>
                                        <td>{item.partName}</td>
                                        <td>{item.dueDate}</td>
                                        <td>{item.progress}%</td>
                                        <td><span className={`${styles.statusTag} ${styles[item.status]}`}>{item.status === 'inProgress' ? '진행중' : item.status === 'completed' ? '완료' : '지연'}</span></td>
                                    </tr>
                                ))
                            ) : (<tr><td colSpan="5">작성한 출장검사 내역이 없습니다.</td></tr>)}
                        </tbody>
                    </table>
                    {/* 모바일 카드 리스트 */}
                    <div className={styles.cardList}>
                        {myInspections.length > 0 ? myInspections.map(item => (
                            <div key={`insp-card-${item.id}`} className={styles.card} onClick={() => handleRowClick(item, 'inspection')}>
                                <div className={styles.cardRow}><div className={styles.cardItem}><span className={styles.cardLabel}>업체명</span><span className={styles.cardValue}>{item.company}</span></div><div className={`${styles.cardItem} ${styles.alignRight}`}><span className={`${styles.statusTag} ${styles[item.status]}`}>{item.status === 'inProgress' ? '진행중' : item.status === 'completed' ? '완료' : '지연'}</span></div></div>
                                <div className={styles.cardRow}><div className={styles.cardItem}><span className={styles.cardLabel}>부품명</span><span className={styles.cardValue}>{item.partName}</span></div></div>
                                <div className={styles.cardRow}><div className={styles.cardItem}><span className={styles.cardLabel}>목표일</span><span className={styles.cardValue}>{item.dueDate}</span></div><div className={`${styles.cardItem} ${styles.alignRight}`}><span className={styles.cardLabel}>진행률</span><span className={styles.cardValue}>{item.progress}%</span></div></div>
                            </div>
                        )) : <p className={styles.noDataText}>작성 내역이 없습니다.</p>}
                    </div>
                </section>

                {/* --- 내가 작성한 품질개선 목록 --- */}
                <section className={styles.listSection}>
                    <div className={styles.sectionHeader}>
                        <h3>품질개선 작성 목록</h3>
                        <button onClick={() => setAddModalType('quality')} className={styles.addButton}><FaPlus size={12} /><span>추가</span></button>
                    </div>
                    {/* ▼▼▼ 데스크탑 테이블 (내용 추가) ▼▼▼ */}
                    <table className={styles.dataTable}>
                        <thead>
                            <tr><th>업체명</th><th>개선항목</th><th>목표일</th><th>진행률</th><th>상태</th></tr>
                        </thead>
                        <tbody>
                            {myQualityItems.length > 0 ? (
                                myQualityItems.map(item => (
                                    <tr key={`qual-row-${item.id}`} onClick={() => handleRowClick(item, 'quality')} className={styles.clickableRow}>
                                        <td>{item.company}</td>
                                        <td className={styles.longText}>{item.improvementItem}</td>
                                        <td>{item.endDate}</td>
                                        <td>{item.progress}%</td>
                                        <td><span className={`${styles.statusTag} ${styles[item.status]}`}>{item.status === 'inProgress' ? '진행중' : item.status === 'completed' ? '완료' : '지연'}</span></td>
                                    </tr>
                                ))
                            ) : (<tr><td colSpan="5">작성한 품질개선 내역이 없습니다.</td></tr>)}
                        </tbody>
                    </table>
                    {/* 모바일 카드 리스트 */}
                    <div className={styles.cardList}>
                        {myQualityItems.length > 0 ? myQualityItems.map(item => (
                            <div key={`qual-card-${item.id}`} className={styles.card} onClick={() => handleRowClick(item, 'quality')}>
                                <div className={styles.cardRow}><div className={styles.cardItem}><span className={styles.cardLabel}>개선항목</span><span className={styles.cardValue}>{item.improvementItem}</span></div><div className={`${styles.cardItem} ${styles.alignRight}`}><span className={`${styles.statusTag} ${styles[item.status]}`}>{item.status === 'inProgress' ? '진행중' : item.status === 'completed' ? '완료' : '지연'}</span></div></div>
                                <div className={styles.cardRow}><div className={styles.cardItem}><span className={styles.cardLabel}>업체명</span><span className={styles.cardValue}>{item.company}</span></div></div>
                                <div className={styles.cardRow}><div className={styles.cardItem}><span className={styles.cardLabel}>목표일</span><span className={styles.cardValue}>{item.endDate}</span></div><div className={`${styles.cardItem} ${styles.alignRight}`}><span className={styles.cardLabel}>진행률</span><span className={styles.cardValue}>{item.progress}%</span></div></div>
                            </div>
                        )) : <p className={styles.noDataText}>작성 내역이 없습니다.</p>}
                    </div>
                </section>
            </div>

            {/* 모달들 */}
            {detailModalType === 'inspection' && <InspectionDetailModal item={selectedItem} user={user} onClose={closeDetailModal} onSuccess={handleUpdateSuccess} />}
            {detailModalType === 'quality' && <QualityDetailModal item={selectedItem} user={user} onClose={closeDetailModal} onSuccess={handleUpdateSuccess} />}
            {addModalType === 'inspection' && <AddInspectionModal user={user} onClose={() => setAddModalType(null)} onSuccess={(newEntry) => handleAddSuccess(newEntry, 'inspection')} />}
            {addModalType === 'quality' && <AddQualityItemModal user={user} onClose={() => setAddModalType(null)} onSuccess={(newEntry) => handleAddSuccess(newEntry, 'quality')} />}
        </>
    );
}

export default MyPosts;