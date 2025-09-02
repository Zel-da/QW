// src/api/qualityApi.js

const mockQualityData = [
    {
        id: 1,
        manager: '김수산',
        company: '삼성전자',
        improvementItem: '디스플레이 패널 색상 균일도 향상을 위한 공정 최적화',
        startDate: '2025-08-01',
        endDate: '2025-09-30',
        progress: 75,
    },
    {
        id: 2,
        manager: '인턴연구원',
        company: '현대모비스',
        improvementItem: '브레이크 패드 마모 소음 감소 신소재 적용 테스트',
        startDate: '2025-07-15',
        endDate: '2025-08-30',
        progress: 100,
    },
    {
        id: 3,
        manager: '김수산',
        company: 'LG화학',
        improvementItem: '배터리 셀 에너지 밀도 5% 향상 목표 전해액 성분 변경',
        startDate: '2025-09-01',
        endDate: '2025-11-30',
        progress: 20,
    },
];

// status를 동적으로 계산하는 함수
const getStatus = (item) => {
    // 오늘 날짜의 시간을 자정으로 설정
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 마감일의 시간 정보도 자정으로 설정 (이미 날짜만 있는 문자열이라 영향이 적지만, 명확성을 위해)
    const endDate = new Date(item.endDate);
    endDate.setHours(0, 0, 0, 0);

    // progress가 숫자형이 아닐 경우를 대비해 parseInt 사용
    if (parseInt(item.progress, 10) === 100) return 'completed';

    // 이제 날짜만 정확하게 비교합니다.
    if (endDate < today) return 'delayed';

    return 'inProgress';
};

export const getQualityItems = () => {
    return new Promise((resolve) => {
        // 각 아이템에 status를 추가하여 반환
        const dataWithStatus = mockQualityData.map(item => ({ ...item, status: getStatus(item) }));
        setTimeout(() => resolve(dataWithStatus), 500);
    });
};

export const getQualityKpiSummary = () => {
    return new Promise((resolve) => {
        const summary = mockQualityData.reduce((acc, current) => {
            const status = getStatus(current);
            if (status === 'completed') acc.completed += 1;
            else if (status === 'inProgress') acc.inProgress += 1;
            else if (status === 'delayed') acc.delayed += 1;
            return acc;
        }, { completed: 0, inProgress: 0, delayed: 0 });

        summary.total = mockQualityData.length;
        setTimeout(() => resolve(summary), 300);
    });
};

export const addQualityItem = (newItemData) => {
    return new Promise((resolve) => {
        const newEntry = {
            id: mockQualityData.length + 1,
            ...newItemData,
        };
        mockQualityData.unshift(newEntry);
        resolve(newEntry);
    });
};

// src/api/qualityApi.js 파일 맨 아래에 추가

const mockQualityComments = {
    1: [{ user: '김수산', text: '공정 최적화 1차 테스트 완료.', date: '2025-08-15' }],
    3: [{ user: '인턴연구원', text: '신규 전해액 샘플 도착, 테스트 예정.', date: '2025-09-05' }],
};

const mockQualityHistory = {
    1: [{ user: '김수산', action: '진행률 변경 (50% -> 75%)', date: '2025-08-14' }],
};

export const getQualityComments = (itemId) => {
    return new Promise(resolve => {
        setTimeout(() => resolve(mockQualityComments[itemId] || []), 200);
    });
};

export const getQualityHistory = (itemId) => {
    return new Promise(resolve => {
        setTimeout(() => resolve(mockQualityHistory[itemId] || []), 200);
    });
};

// addQualityComment 함수도 id를 추가하도록 수정
export const addQualityComment = (itemId, newComment) => {
    return new Promise(resolve => {
        if (!mockQualityComments[itemId]) {
            mockQualityComments[itemId] = [];
        }
        const commentWithId = { ...newComment, id: Date.now() }; // 고유 ID 추가
        mockQualityComments[itemId].push(commentWithId);
        setTimeout(() => resolve(commentWithId), 300);
    });
};

export const addQualityHistory = (itemId, newLog) => {
    return new Promise(resolve => {
        if (!mockQualityHistory[itemId]) {
            mockQualityHistory[itemId] = [];
        }
        mockQualityHistory[itemId].push(newLog);
        setTimeout(() => resolve(newLog), 100);
    });
};

// 맨 아래에 deleteQualityComment 함수 추가
export const deleteQualityComment = (itemId, commentId) => {
    return new Promise((resolve, reject) => {
        if (mockQualityComments[itemId]) {
            mockQualityComments[itemId] = mockQualityComments[itemId].filter(c => c.id !== commentId);
            setTimeout(() => resolve({ success: true }), 300);
        } else {
            reject(new Error("해당 항목을 찾지 못했습니다."));
        }
    });
};

