// src/api/inspectionAPI.js

// 1. 각 테이블에 해당하는 Mock 데이터 생성
const mockUsers = [
    { id: 1, username: 'intern', name: '인턴연구원' },
    { id: 2, username: 'soosan', name: '김수산' },
];

const mockCompanies = [
    { id: 101, company_name: '삼성전자' },
    { id: 102, company_name: 'LG화학' },
    { id: 103, company_name: '현대모비스' },
    // ... 다른 업체들
];

const mockProducts = [
    { id: 201, product_name: '디스플레이 패널' },
    { id: 202, product_name: '배터리 셀' },
    { id: 203, product_name: '브레이크 패드' },
    // ... 다른 부품들
];

const mockComments = {
    1: [{ user: '김수산', text: '공정 온도 재조정 후 샘플 테스트 진행 중입니다.', date: '2025-08-22' }],
    2: [{ user: '이영희', text: '전해액 농도 조정 완료. 최종 품질 테스트 통과했습니다.', date: '2025-08-18' }],
};

const mockHistory = {
    1: [{ user: '김철수', action: '진행률 변경 (70% -> 85%)', date: '2025-08-21' }],
    2: [{ user: '이영희', action: '상태 변경 (진행중 -> 완료)', date: '2025-08-17' }],
};

// 2. Inspections 테이블은 이제 ID를 참조
let mockInspections = [
    {
        id: 1,
        company_id: 101,
        product_id: 201,
        user_id: 2, // 김수산
        inspected_quantity: 100,
        defective_quantity: 5,
        defect_reason: '색상 균일도 불량',
        solution: '공정 온도 조정 및 재검토',
        received_date: '2025-08-20',
        target_date: '2025-09-15',
        progress_percentage: 85,
    },
    {
        id: 2,
        company_id: 102,
        product_id: 202,
        user_id: 1, // 인턴연구원
        inspected_quantity: 200,
        defective_quantity: 8,
        defect_reason: '용량 편차 발생',
        solution: '전해액 농도 조정',
        received_date: '2025-08-15',
        target_date: '2025-08-30',
        progress_percentage: 100,
    },
    // ... 다른 검수 내역
];

// 3. 데이터를 가져올 때, 각 ID에 맞는 이름을 조합(Join)해서 반환
export const getInspections = () => {
    return new Promise((resolve) => {
        const joinedData = mockInspections.map(inspection => {
            const company = mockCompanies.find(c => c.id === inspection.company_id);
            const product = mockProducts.find(p => p.id === inspection.product_id);
            const user = mockUsers.find(u => u.id === inspection.user_id);

            // 프론트엔드 컴포넌트가 기존에 사용하던 데이터 형식으로 맞춰줌
            return {
                id: inspection.id,
                manager: user ? user.name : '알 수 없음',
                company: company ? company.company_name : '알 수 없음',
                partName: product ? product.product_name : '알 수 없음',
                defectCount: inspection.defective_quantity,
                totalCount: inspection.inspected_quantity,
                reason: inspection.defect_reason,
                solution: inspection.solution,
                receivedDate: inspection.received_date,
                dueDate: inspection.target_date,
                progress: inspection.progress_percentage,
                status: getStatus(inspection),
            };
        });
        setTimeout(() => resolve(joinedData.sort((a, b) => new Date(b.receivedDate) - new Date(a.receivedDate))), 500);
    });
};

// ... getKpiSummary 함수는 내부 로직이 복잡해지므로, getInspections 결과를 활용하는 방식으로 변경
export const getKpiSummary = async () => {
    const inspections = await getInspections(); // Join된 데이터를 가져옴
    const summary = inspections.reduce((acc, current) => {
        if (current.status === 'completed') acc.completed += 1;
        else if (current.status === 'inProgress') acc.inProgress += 1;
        else if (current.status === 'delayed') acc.delayed += 1;
        return acc;
    }, { completed: 0, inProgress: 0, delayed: 0 });
    summary.total = inspections.length;
    return summary;
};


// 4. 새 검사를 추가하는 함수도 ID 기반으로 작동하도록 수정 (실제로는 백엔드가 처리)
export const addInspection = (newInspectionData) => {
    return new Promise((resolve) => {
        const user = mockUsers.find(u => u.name === newInspectionData.manager);
        // DB 스키마에 맞는 형태로 새 데이터 생성
        const newDbEntry = {
            id: mockInspections.length + 100,
            company_id: 101, // 실제로는 company name으로 id를 찾아야 함 (임시)
            product_id: 201, // 실제로는 product name으로 id를 찾아야 함 (임시)
            user_id: user ? user.id : 0,
            inspected_quantity: parseInt(newInspectionData.totalCount, 10),
            defective_quantity: parseInt(newInspectionData.defectCount, 10),
            defect_reason: newInspectionData.reason,
            solution: newInspectionData.solution,
            received_date: newInspectionData.receivedDate,
            target_date: newInspectionData.dueDate,
            progress_percentage: newInspectionData.progress,
        };
        mockInspections.push(newDbEntry);


        const newJoinedEntry = {
            manager: newInspectionData.manager,
            company: newInspectionData.company,
            partName: newInspectionData.partName,
            defectCount: newInspectionData.defectCount,
            totalCount: newInspectionData.totalCount,
            reason: newInspectionData.reason,
            solution: newInspectionData.solution,
            receivedDate: newInspectionData.receivedDate,
            dueDate: newInspectionData.dueDate,
            progress: newInspectionData.progress,
            status: getStatus(newDbEntry),
        };

        setTimeout(() => {
            // 정렬된 목록의 마지막이 아닌, 방금 만든 데이터를 반환합니다.
            resolve(newJoinedEntry);
        }, 500);
    });
};

export const getComments = (inspectionId) => {
    return new Promise(resolve => {
        setTimeout(() => resolve(mockComments[inspectionId] || []), 200);
    });
};

export const getHistory = (inspectionId) => {
    return new Promise(resolve => {
        setTimeout(() => resolve(mockHistory[inspectionId] || []), 200);
    });
};

const getStatus = (item) => {
    if (item.progress_percentage === 100) return 'completed';
    if (new Date(item.target_date) < new Date() && item.progress_percentage < 100) return 'delayed';
    return 'inProgress';
};


export const addComment = (inspectionId, newComment) => {
    return new Promise(resolve => {
        if (!mockComments[inspectionId]) {
            mockComments[inspectionId] = [];
        }
        mockComments[inspectionId].push(newComment);
        setTimeout(() => resolve(newComment), 300);
    });
};


export const addHistory = (inspectionId, newLog) => {
    return new Promise(resolve => {
        if (!mockHistory[inspectionId]) {
            mockHistory[inspectionId] = [];
        }
        mockHistory[inspectionId].push(newLog);
        setTimeout(() => resolve(newLog), 100);
    });
};


export const deleteComment = (inspectionId, commentId) => {
  return new Promise((resolve, reject) => {
    if (mockComments[inspectionId]) {
      const initialLength = mockComments[inspectionId].length;
      mockComments[inspectionId] = mockComments[inspectionId].filter(c => c.id !== commentId);
      if (mockComments[inspectionId].length < initialLength) {
        setTimeout(() => resolve({ success: true }), 300);
      } else {
        reject(new Error("삭제할 코멘트를 찾지 못했습니다."));
      }
    } else {
      reject(new Error("해당 검사 항목을 찾지 못했습니다."));
    }
  });
};