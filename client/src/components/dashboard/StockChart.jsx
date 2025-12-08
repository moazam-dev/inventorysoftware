import React from 'react'
import { Bar } from 'react-chartjs-2'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js'
import { Card } from 'react-bootstrap'
import { FaBoxOpen } from 'react-icons/fa'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

const StockChart = ({ data: stockData }) => {
    const labels = stockData ? stockData.map(item => item._id) : ['Suits', 'Kurtis', 'Abayas', 'Party Wear', 'Winter']
    const totalStock = stockData ? stockData.map(item => item.totalStock) : [25, 40, 15, 10, 20]
    const sold = stockData ? stockData.map(item => item.totalSold || 0) : [5, 12, 3, 2, 8]
    const remaining = totalStock.map((s, i) => Math.max(s - sold[i], 0))

    const data = {
        labels,
        datasets: [
            {
                label: 'Remaining',
                data: remaining,
                backgroundColor: '#3b82f6', // blue for remaining
                barThickness: 50,
            },
            {
                label: 'Sold',
                data: sold,
                backgroundColor: '#22c55e', // green for sold
                barThickness: 50,
            },
        ],
    }

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom',
                labels: {
                    usePointStyle: true,
                    padding: 15,
                    font: { size: 12, weight: 500 },
                },
            },
            tooltip: { mode: 'index', intersect: false },
        },
        scales: {
            x: { stacked: true, grid: { display: false } },
            y: { stacked: true, beginAtZero: true, grid: { display: true, drawBorder: false, color: 'rgba(0,0,0,0.05)' } },
        },
        animation: { duration: 1000, easing: 'easeOutQuart' },
    }

    return (
        <Card className="border-0 shadow-sm h-100">
            <Card.Body className="p-4">
                <div className="d-flex align-items-center mb-4">
                    <FaBoxOpen className="text-primary me-2" size={20} />
                    <h5 className="card-title mb-0 fw-bold">Stock Overview by Category</h5>
                </div>
                <div style={{ height: '350px' }}>
                    <Bar data={data} options={options} />
                </div>
            </Card.Body>
        </Card>
    )
}

export default StockChart
