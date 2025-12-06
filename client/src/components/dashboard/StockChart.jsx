import React from 'react'
import { Bar } from 'react-chartjs-2'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js'
import { Card } from 'react-bootstrap'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

const StockChart = ({ data: stockData }) => {
    // Use passed data or fallbacks
    const labels = stockData ? stockData.map(item => item._id) : ['Suits', 'Kurtis', 'Abayas', 'Party Wear', 'Winter'];
    const values = stockData ? stockData.map(item => item.totalStock) : [25, 40, 15, 10, 20];

    const data = {
        labels,
        datasets: [
            {
                label: 'Total Stock',
                data: values,
                backgroundColor: '#0984e3',
                borderRadius: 4,
            },
        ],
    }

    const options = {
        responsive: true,
        plugins: {
            legend: {
                position: 'bottom',
            },
        },
        scales: {
            y: {
                beginAtZero: true,
            },
            x: {
                grid: {
                    display: false,
                },
            },
        },
    }

    return (
        <Card className="border-0 shadow-sm h-100">
            <Card.Body>
                <h5 className="card-title mb-4">Stock Overview by Category</h5>
                <Bar data={data} options={options} />
            </Card.Body>
        </Card>
    )
}

export default StockChart
