import React from 'react'
import { Line, Bar } from 'react-chartjs-2'
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler } from 'chart.js'
import { Card } from 'react-bootstrap'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler)

const RevenueChart = ({ data }) => {
    if (!data) return <Card className="border-0 shadow-sm h-100"><Card.Body>Loading...</Card.Body></Card>;

    const chartData = {
        labels: data.labels,
        datasets: [
            {
                label: 'Revenue',
                data: data.revenue,
                backgroundColor: 'rgba(108, 92, 231, 0.7)',
                borderColor: '#6c5ce7',
                borderWidth: 1,
            },
            {
                label: 'Expenses',
                data: data.expenses,
                backgroundColor: 'rgba(250, 177, 160, 0.7)',
                borderColor: '#fab1a0',
                borderWidth: 1,
            },
            {
                label: 'Profit/Loss', // Positive for profit, negative for loss (but logic shows loss as positive loss in array? No wait service pushed 0 to loss if profit.
                // Actually my service pushed: if profit -> profit array has value, loss array has 0.
                // Let's just graph "Net Result" line.
                // Or user said "comparison of expense or profit".
                // Let's do a grouped bar for Rev and Exp, and a Line for Net?
                // Or just Rev, Exp, and Profit bars.
                // If I use the data from backend:
                // profit array has values >= 0
                // loss array has values >= 0 (absolute)
                // Let's combine them into one "Net" dataset for the chart?
                // Or keep it simple: Revenue (Bar), Expenses (Bar), Net (Line)
                label: 'Net Flow',
                data: data.revenue.map((r, i) => r - data.expenses[i]),
                type: 'line',
                borderColor: '#00b894',
                backgroundColor: 'rgba(0, 184, 148, 0.1)',
                borderWidth: 2,
                tension: 0.4,
                fill: false,
                yAxisID: 'y',
            }
        ],
    }

    const options = {
        responsive: true,
        plugins: {
            legend: {
                position: 'bottom',
            },
            title: {
                display: false,
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: {
                    display: true,
                    drawBorder: false,
                },
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
                <h5 className="card-title mb-4">Financial Overview</h5>
                <Bar data={chartData} options={options} />
            </Card.Body>
        </Card>
    )
}

export default RevenueChart
