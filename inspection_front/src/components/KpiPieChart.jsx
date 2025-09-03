import React from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';
import ChartDataLabels from 'chartjs-plugin-datalabels';

// [수정] 플러그인을 다시 전역으로 등록합니다. (표준 방식)
ChartJS.register(ArcElement, Tooltip, Legend, ChartDataLabels);

function KpiPieChart({ kpiData }) {
    if (!kpiData) {
        // 데이터가 로드되기 전에도 컨테이너 크기를 유지하여 레이아웃 깨짐을 방지합니다.
        return <div style={{ position: 'relative', height: '350px', width: '100%' }}>Loading chart...</div>;
    }

    const chartValues = [
        kpiData.delayed || 0,
        kpiData.inProgress || 0,
        kpiData.completed || 0,
    ];

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
                borderWidth: 1,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
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
            // 툴팁과 데이터레이블이 모두 정상적으로 동작해야 합니다.
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
                display: total > 0,
                color: '#000000',
                font: {
                    weight: 'bold',
                },
                formatter: (value, context) => {
                    if (value === 0) {
                        return '';
                    }
                    const chartTotal = context.chart.data.datasets[0].data.reduce((acc, cur) => acc + cur, 0);
                    if (chartTotal === 0) {
                        return '';
                    }
                    const percentage = ((value / chartTotal) * 100).toFixed(1) + '%';
                    return percentage;
                },
            },
        },
    };

    // [수정] 로컬 플러그인 전달(plugins prop)을 제거합니다.
    return (
        <div style={{ position: 'relative', height: '350px', width: '100%' }}>
            <Pie data={data} options={options} />
        </div>
    );
}

export default KpiPieChart;