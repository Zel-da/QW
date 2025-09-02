export const calculateStatus = (progress, targetDateStr) => {
    if (progress === 100) {
        return 'completed';
    }

    // If no target date is provided, it's always in progress (unless completed)
    if (!targetDateStr) { // Handles null, undefined, empty string
        return 'inProgress';
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize today to start of day

    const targetDate = new Date(targetDateStr);
    targetDate.setHours(0, 0, 0, 0); // Normalize targetDate to start of day

    // Check for Invalid Date (e.g., if targetDateStr was malformed but not null/empty)
    if (isNaN(targetDate.getTime())) {
        return 'inProgress'; // Treat as in progress if date is invalid
    }

    if (today > targetDate) { // Today is strictly after target date
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