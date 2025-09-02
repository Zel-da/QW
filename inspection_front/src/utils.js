export const calculateStatus = (item) => {
    const progress = item.progress !== undefined ? item.progress : item.progress_percentage;
    const targetDateStr = item.end_date || item.target_date;

    if (progress === 100) {
        return 'completed';
    }
    if (!targetDateStr) {
        return 'inProgress';
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const targetDate = new Date(targetDateStr);
    targetDate.setHours(0, 0, 0, 0);
    if (isNaN(targetDate.getTime())) {
        return 'inProgress';
    }
    if (today > targetDate) {
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