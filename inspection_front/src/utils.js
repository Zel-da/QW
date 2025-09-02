export const calculateStatus = (progress, targetDateStr) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize today to start of day

    const targetDate = new Date(targetDateStr);
    targetDate.setHours(0, 0, 0, 0); // Normalize targetDate to start of day

    if (progress === 100) {
        return 'completed';
    } else if (today > targetDate) { // Today is strictly after target date
        return 'delayed';
    } else {
        return 'inProgress';
    }
};

export const statusMap = {
    inProgress: { text: '진행중', className: 'inProgress' },
    completed: { text: '완료', className: 'completed' },
    delayed: { text: '지연', className: 'delayed' },
};