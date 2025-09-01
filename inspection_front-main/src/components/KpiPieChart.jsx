// src/components/KpiPieChart.jsx

import React from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';
import ChartDataLabels from 'chartjs-plugin-datalabels'; // 1. 플러그인 import


// Chart.js에 필요한 요소들을 등록합니다. (필수 과정)
ChartJS.register(ArcElement, Tooltip, Legend, ChartDataLabels);

function KpiPieChart({ kpiData }) {
    const data = {
        labels: ['지연', '진행 중', '완료'],
        datasets: [
            {
                label: '항목 수',
                data: [kpiData.delayed, kpiData.inProgress, kpiData.completed],
                backgroundColor: ['#ffab91', '#ffe082', '#a5d6a7'],
                borderColor: '#ffffff',
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
                font: { size: 16 }
            },
            // 3. 데이터라벨 플러그인 옵션을 설정합니다.
            datalabels: {
                // value: 각 데이터 값, context: 차트의 상세 정보
                formatter: (value, context) => {
                    // 전체 데이터 합계 계산
                    const total = context.chart.data.datasets[0].data.reduce((sum, val) => sum + val, 0);
                    // 퍼센티지 계산
                    const percentage = ((value / total) * 100).toFixed(0); // 소수점 없이 반올림
                    // 0%인 항목은 표시하지 않음
                    if (percentage < 1) {
                        return '';
                    }
                    return `${percentage}%`;
                },
                color: '#fff', // 라벨 글자색
                font: {
                    weight: 'bold', // 글자 굵기
                    size: 14,
                },
                // 글자가 더 잘 보이도록 배경색과 대비되는 테두리 추가
                textStrokeColor: 'rgba(0,0,0,0.4)',
                textStrokeWidth: 2,
            }
        },
    };

    return <Pie data={data} options={options} />;
}

export default KpiPieChart;
