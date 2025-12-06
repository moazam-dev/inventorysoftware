import React from 'react'
import { Card, Alert } from 'react-bootstrap'
import { FaLightbulb, FaCheckCircle, FaExclamationTriangle, FaInfoCircle } from 'react-icons/fa'

const InsightsPanel = ({ insights }) => {
    // Placeholder insights if none provided
    const defaultInsights = [
        { type: 'success', message: 'Great news! Your profit has increased by 10.4% compared to last month.' },
        { type: 'warning', message: '2 product(s) are running low on stock and need restocking.' },
        { type: 'info', message: 'Expenses are over 50% of revenue. Consider reviewing your business costs.' }
    ];

    const items = insights && insights.length > 0 ? insights : defaultInsights;

    return (
        <Card className="border-0 shadow-sm mt-4">
            <Card.Body>
                <h5 className="card-title mb-3 d-flex align-items-center">
                    <FaLightbulb className="text-warning me-2" /> Business Insights
                </h5>
                <div className="d-flex flex-column gap-2">
                    {items.map((item, index) => (
                        <Alert key={index} variant={item.type === 'error' ? 'danger' : item.type} className="d-flex align-items-center border-0 bg-opacity-10 mb-0 py-2">
                            {item.type === 'success' && <FaCheckCircle className="me-2 text-success" />}
                            {item.type === 'warning' && <FaExclamationTriangle className="me-2 text-warning" />}
                            {item.type === 'info' && <FaInfoCircle className="me-2 text-info" />}
                            <span className="small">{item.message}</span>
                        </Alert>
                    ))}
                </div>
            </Card.Body>
        </Card>
    )
}

export default InsightsPanel
