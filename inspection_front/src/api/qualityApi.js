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
    if (item.progress === 100) return 'completed';
    if (new Date(item.endDate) < new Date()) return 'delayed';
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