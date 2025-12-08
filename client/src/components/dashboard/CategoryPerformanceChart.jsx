import React from 'react'
import { Bar } from 'react-chartjs-2'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js'
import { Card } from 'react-bootstrap'
import { FaChartBar } from 'react-icons/fa'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

const CategoryPerformanceChart = ({ data }) => {
    if (!data || data.length === 0) {
        return (
            <Card className="border-0 shadow-sm h-100">
                <Card.Body>
                    <div className="text-center text-muted py-5">No category data available</div>
                </Card.Body>
            </Card>
        )
    }

    const chartData = {
        labels: data.map(c => c.category),
        datasets: [
            {
                label: 'Revenue',
                data: data.map(c => c.revenue),
                backgroundColor: '#3B82F6', // Blue
                borderColor: '#2563EB',
                borderWidth: 2,
                borderRadius: 0,
                hoverBackgroundColor: '#2563EB',
                hoverBorderColor: '#1D4ED8',
            },
            {
                label: 'Profit',
                data: data.map(c => c.profit),
                backgroundColor: '#10B981', // Green
                borderColor: '#059669',
                borderWidth: 2,
                borderRadius: 0,
                hoverBackgroundColor: '#059669',
                hoverBorderColor: '#047857',
            }
        ],
    }

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        animation: {
            duration: 800,
            easing: 'easeInOutQuart',
            delay: (context) => {
                let delay = 0;
                if (context.type === 'data' && context.mode === 'default') {
                    delay = context.dataIndex * 100;
                }
                return delay;
            }
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
                backgroundColor: 'rgba(31, 41, 55, 0.95)',
                titleColor: '#f9fafb',
                bodyColor: '#f9fafb',
                borderColor: '#60A5FA',
                borderWidth: 2,
                padding: 16,
                cornerRadius: 8,
                titleFont: { size: 14, weight: 'bold' },
                bodyFont: { size: 13 },
                bodySpacing: 6,
                callbacks: {
                    label: function (context) {
                        const item = data[context.dataIndex];
                        const label = context.dataset.label;

                        if (label === 'Revenue') {
                            return `Revenue: Rs ${item.revenue.toLocaleString()}`;
                        } else {
                            return `Profit: Rs ${item.profit.toLocaleString()}`;
                        }
                    },
                    afterLabel: function (context) {
                        const item = data[context.dataIndex];
                        return `Units Sold: ${item.quantitySold}`;
                    }
                }
            }
        },
        scales: {
            x: {
                grid: {
                    display: false,
                },
                ticks: {
                    color: '#1f2937',
                    font: { size: 11, weight: '600' }
                }
            },
            y: {
                beginAtZero: true,
                grid: {
                    color: 'rgba(229, 231, 235, 0.5)',
                    drawBorder: false,
                },
                ticks: {
                    color: '#6b7280',
                    font: { size: 11, weight: '500' },
                    callback: function (value) {
                        return value >= 1000 ? (value / 1000) + 'K' : value;
                    }
                }
            },
        },
        interaction: {
            mode: 'index',
            intersect: false
        },
        onHover: (event, activeElements) => {
            event.native.target.style.cursor = activeElements.length > 0 ? 'pointer' : 'default';
        }
    }

    return (
        <Card className="border-0 shadow-sm h-100">
            <Card.Body className="p-4">
                <div className="d-flex align-items-center justify-content-between mb-4">
                    <div className="d-flex align-items-center">
                        <FaChartBar className="text-primary me-2" size={20} />
                        <h5 className="card-title mb-0 fw-bold">Category Performance</h5>
                    </div>
                    <small className="text-muted">Last 30 days</small>
                </div>
                <div style={{ height: '350px' }}>
                    <Bar data={chartData} options={options} />
                </div>
            </Card.Body>
        </Card>
    )
}

export default CategoryPerformanceChart
