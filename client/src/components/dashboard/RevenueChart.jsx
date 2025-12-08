import React from 'react'
import { Line } from 'react-chartjs-2'
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js'
import { Card } from 'react-bootstrap'
import { FaChartLine } from 'react-icons/fa'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler)

const ProfitExpenseChart = ({ data }) => {
    if (!data || data.length === 0) {
        return (
            <Card className="border-0 shadow-sm h-100">
                <Card.Body>
                    <div className="text-center text-muted py-5">Loading...</div>
                </Card.Body>
            </Card>
        )
    }

    const chartData = {
        labels: data.map(d => d.label),
        datasets: [
            {
                label: 'Profit',
                data: data.map(d => d.profit),
                backgroundColor: 'rgba(5, 150, 105, 0.1)',
                borderColor: '#059669',
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointRadius: 0,
                pointHoverRadius: 6,
                pointHoverBackgroundColor: '#059669',
                pointHoverBorderColor: '#fff',
                pointHoverBorderWidth: 2,
                hidden: false, // Visible by default
            },
            {
                label: 'Expenses',
                data: data.map(d => d.expenses),
                backgroundColor: 'rgba(234, 179, 8, 0.1)',
                borderColor: '#eab308',
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointRadius: 0,
                pointHoverRadius: 6,
                pointHoverBackgroundColor: '#eab308',
                pointHoverBorderColor: '#fff',
                pointHoverBorderWidth: 2,
                hidden: true, // Hidden by default
            }
        ],
    }

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
            mode: 'index',
            intersect: false,
        },
        plugins: {
            legend: {
                position: 'top',
                align: 'end',
                labels: {
                    color: '#1f2937',
                    font: { size: 13, weight: '600' },
                    usePointStyle: true,
                    padding: 15,
                    boxWidth: 10,
                    boxHeight: 10
                },
                onClick: function (e, legendItem, legend) {
                    const index = legendItem.datasetIndex;
                    const ci = legend.chart;
                    const meta = ci.getDatasetMeta(index);

                    meta.hidden = meta.hidden === null ? !ci.data.datasets[index].hidden : null;
                    ci.update();
                }
            },
            tooltip: {
                backgroundColor: '#1f2937',
                titleColor: '#f9fafb',
                bodyColor: '#f9fafb',
                borderColor: '#374151',
                borderWidth: 1,
                padding: 12,
                callbacks: {
                    label: function (context) {
                        const label = context.dataset.label || '';
                        return `${label}: Rs ${context.parsed.y.toLocaleString()}`;
                    },
                    title: function (context) {
                        return context[0].label;
                    }
                }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: {
                    color: '#e5e7eb',
                    drawBorder: false,
                },
                ticks: {
                    color: '#6b7280',
                    font: { size: 11, weight: '600' },
                    callback: function (value) {
                        return value >= 1000 ? (value / 1000) + 'K' : value;
                    }
                },
                title: {
                    display: true,
                    text: 'Amount (Rs)',
                    color: '#1f2937',
                    font: { size: 12, weight: '700' }
                }
            },
            x: {
                grid: {
                    display: false,
                },
                ticks: {
                    color: '#6b7280',
                    font: { size: 10, weight: '500' },
                    maxRotation: 0,
                    minRotation: 0
                }
            },
        },
    }

    return (
        <Card className="border-0 shadow-sm h-100">
            <Card.Body className="p-4">
                <div className="d-flex align-items-center justify-content-between mb-4">
                    <div className="d-flex align-items-center">
                        <FaChartLine className="text-primary me-2" size={20} />
                        <h5 className="card-title mb-0 fw-bold">Profit & Expense Trends</h5>
                    </div>
                    <small className="text-muted">Last 12 months</small>
                </div>
                <div style={{ height: '350px' }}>
                    <Line data={chartData} options={options} />
                </div>
                <div className="mt-3 text-center">
                    <small className="text-muted">Click legend items to show/hide data</small>
                </div>
            </Card.Body>
        </Card>
    )
}

export default ProfitExpenseChart
