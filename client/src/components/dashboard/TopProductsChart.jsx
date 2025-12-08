import React from 'react'
import { Bar } from 'react-chartjs-2'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js'
import { Card } from 'react-bootstrap'
import { FaTrophy } from 'react-icons/fa'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

const TopProductsChart = ({ data }) => {
    if (!data || data.length === 0) {
        return (
            <Card className="border-0 shadow-sm h-100">
                <Card.Body>
                    <div className="text-center text-muted py-5">No sales data available</div>
                </Card.Body>
            </Card>
        )
    }

    // Color palette - Blue, Green, Orange, Purple
    const getGradientColor = (margin) => {
        if (margin >= 40) return '#8B5CF6'; // Purple
        if (margin >= 25) return '#10B981'; // Green
        if (margin >= 10) return '#3B82F6'; // Blue
        return '#F97316'; // Orange
    };

    const getBorderColor = (margin) => {
        if (margin >= 40) return '#7C3AED'; // Darker Purple
        if (margin >= 25) return '#059669'; // Darker Green
        if (margin >= 10) return '#2563EB'; // Darker Blue
        return '#EA580C'; // Darker Orange
    };

    const chartData = {
        labels: data.map(p => p.productName || 'Unknown'),
        datasets: [
            {
                label: 'Revenue (Rs)',
                data: data.map(p => p.totalRevenue),
                backgroundColor: data.map(p => {
                    const margin = p.profitMargin || 0;
                    return getGradientColor(margin);
                }),
                borderColor: data.map(p => {
                    const margin = p.profitMargin || 0;
                    return getBorderColor(margin);
                }),
                borderWidth: 2,
                borderRadius: 0,
                hoverBackgroundColor: data.map(p => {
                    const margin = p.profitMargin || 0;
                    return getBorderColor(margin);
                }),
            }
        ],
    }

    const options = {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        animation: {
            duration: 800,
            easing: 'easeInOutQuart'
        },
        plugins: {
            legend: {
                display: false
            },
            tooltip: {
                backgroundColor: 'rgba(31, 41, 55, 0.95)',
                titleColor: '#f9fafb',
                bodyColor: '#f9fafb',
                borderColor: '#8B5CF6',
                borderWidth: 2,
                padding: 16,
                displayColors: false,
                cornerRadius: 8,
                titleFont: { size: 14, weight: 'bold' },
                bodyFont: { size: 13 },
                bodySpacing: 6,
                callbacks: {
                    label: function (context) {
                        const item = data[context.dataIndex];
                        return [
                            `Revenue: Rs ${item.totalRevenue.toLocaleString()}`,
                            `Units Sold: ${item.totalQuantity}`
                        ];
                    }
                }
            }
        },
        scales: {
            x: {
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
            y: {
                grid: {
                    display: false,
                },
                ticks: {
                    color: '#1f2937',
                    font: { size: 12, weight: '600' }
                }
            },
        },
        interaction: {
            mode: 'nearest',
            axis: 'y',
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
                        <FaTrophy className="text-warning me-2" size={20} />
                        <h5 className="card-title mb-0 fw-bold">Top Performing Products</h5>
                    </div>
                    <small className="text-muted">Last 30 days</small>
                </div>
                <div style={{ height: '350px' }}>
                    <Bar data={chartData} options={options} />
                </div>
                <div className="mt-3 d-flex gap-3 justify-content-center flex-wrap">
                    <div className="d-flex align-items-center">
                        <div style={{
                            width: 14,
                            height: 14,
                            backgroundColor: '#8B5CF6',
                            marginRight: 6
                        }}></div>
                        <small className="text-muted fw-medium">40%+</small>
                    </div>
                    <div className="d-flex align-items-center">
                        <div style={{
                            width: 14,
                            height: 14,
                            backgroundColor: '#10B981',
                            marginRight: 6
                        }}></div>
                        <small className="text-muted fw-medium">25-40%</small>
                    </div>
                    <div className="d-flex align-items-center">
                        <div style={{
                            width: 14,
                            height: 14,
                            backgroundColor: '#3B82F6',
                            marginRight: 6
                        }}></div>
                        <small className="text-muted fw-medium">10-25%</small>
                    </div>
                    <div className="d-flex align-items-center">
                        <div style={{
                            width: 14,
                            height: 14,
                            backgroundColor: '#F97316',
                            marginRight: 6
                        }}></div>
                        <small className="text-muted fw-medium">&lt;10%</small>
                    </div>
                </div>
            </Card.Body>
        </Card>
    )
}

export default TopProductsChart
