import React from 'react'
import { Card } from 'react-bootstrap'

const KPICard = ({ title, value, icon, color, trend }) => {
    return (
        <Card className="h-100 border-0 shadow-sm">
            <Card.Body className="d-flex align-items-center justify-content-between">
                <div>
                    <h6 className="text-muted text-uppercase mb-2" style={{ fontSize: '0.75rem', letterSpacing: '1px' }}>{title}</h6>
                    <h3 className="mb-0 fw-bold">{value}</h3>
                    {trend && (
                        <small className={`mt-2 d-block ${trend > 0 ? 'text-success' : 'text-danger'}`}>
                            {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}% vs last month
                        </small>
                    )}
                </div>
                <div className={`p-3 rounded-circle bg-${color} bg-opacity-10 text-${color}`}>
                    {icon}
                </div>
            </Card.Body>
        </Card>
    )
}

export default KPICard
