import React from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';
import ChartDataLabels from 'chartjs-plugin-datalabels';

// Chart.js에 필요한 요소들을 등록합니다.
ChartJS.register(ArcElement, Tooltip, Legend, ChartDataLabels);

function KpiPieChart({ kpiData }) {
    // kpiData가 없을 경우, 차트를 렌더링하지 않거나 로딩 상태를 표시합니다.
    if (!kpiData) {
        return <div>Loading chart...</div>;
    }

    const chartValues = [
        kpiData.delayed || 0,
        kpiData.inProgress || 0,
        kpiData.completed || 0,
    ];

    // 데이터의 총합을 계산합니다.
    const total = chartValues.reduce((acc, cur) => acc + cur, 0);

    const data = {
        labels: ['지연', '진행 중', '완료'],
        datasets: [
            {
                label: '항목 수',
                data: chartValues,
                backgroundColor: [
                    '#ffab91', // 지연
                    '#ffe082', // 진행 중
                    '#a5d6a7', // 완료
                ],
                borderWidth: 2,
            },
        ],
    };

    const options = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: '항목별 진행 현황',
                font: {
                    size: 16,
                },
            },
            tooltip: {
                callbacks: {
                    label: function (context) {
                        const label = context.label || '';
                        const value = context.raw || 0;
                        const percentage = total > 0 ? ((value / total) * 100).toFixed(1) + '%' : '0%';
                        return `${label}: ${value} (${percentage})`;
                    },
                },
            },
            datalabels: {
                // 데이터 총합이 0보다 클 때만 레이블을 표시하여 오류를 방지합니다.
                display: total > 0,
                color: '#000000', // 글자색: 검정
                font: {
                    weight: 'bold', // 글자 두께: 굵게
                },
                formatter: (value, context) => {
                    // 값이 0인 항목은 백분율을 표시하지 않습니다.
                    if (value === 0) {
                        return '';
                    }
                    // 컨텍스트에서 직접 총합을 다시 계산하여, 재렌더링 시 발생할 수 있는 문제를 방지합니다.
                    const total = context.chart.data.datasets[0].data.reduce((acc, cur) => acc + cur, 0);
                    if (total === 0) {
                        return ''; // 0으로 나누기 방지
                    }
                    const percentage = ((value / total) * 100).toFixed(1) + '%';
                    return percentage;
                },
            },
        },
    };

    return <Pie data={data} options={options} />;
}

export default KpiPieChart;