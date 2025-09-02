import React from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';
import ChartDataLabels from 'chartjs-plugin-datalabels'; // Import the plugin

// Chart.js에 필요한 요소들을 등록합니다. (필수 과정)
ChartJS.register(ArcElement, Tooltip, Legend, ChartDataLabels); // Register the plugin

function KpiPieChart({ kpiData }) {
    // 차트에 표시할 데이터 설정
    const data = {
        labels: ['지연', '진행 중', '완료'],
        datasets: [
            {
                label: '항목 수',
                // kpiData prop으로 받은 데이터를 사용합니다.
                data: [kpiData.delayed, kpiData.inProgress, kpiData.completed],
                // 요청하신 색상으로 설정합니다. (빨강, 노랑, 초록)
                backgroundColor: [
                    '#ffab91', // 지연 (부드러운 코랄 레드)
                    '#ffe082', // 진행 중 (부드러운 앰버 옐로우)
                    '#a5d6a7', // 완료 (부드러운 민트 그린)
                ],
                borderWidth: 2,
            },
        ],
    };

    // 차트 옵션 설정 (예: 제목)
    const options = {
        responsive: true, // 반응형으로 크기 조절
        plugins: {
            legend: {
                position: 'top', // 범례 위치
            },
            title: {
                display: true,
                text: '항목별 진행 현황', // 차트 제목
                font: {
                    size: 16
                }
            },
            tooltip: {
                callbacks: {
                    label: function(context) {
                        const label = context.label || '';
                        const value = context.raw || 0;
                        const total = context.chart.getDatasetMeta(0).total;
                        const percentage = total > 0 ? ((value / total) * 100).toFixed(1) + '%' : '0%';
                        return `${label}: ${value} (${percentage})`;
                    }
                }
            },
            datalabels: { // Datalabels plugin configuration
                color: '#000000', // Black color for the percentage text
                formatter: (value, context) => {
                    const total = context.chart.getDatasetMeta(0).total;
                    const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : '0';
                    return percentage + '%';
                },
                font: {
                    weight: 'bold' // Make the percentage text bold
                }
            }
        },
    };

    return <Pie data={data} options={options} />;
}

export default KpiPieChart;