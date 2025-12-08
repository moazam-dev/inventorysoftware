import React from 'react'
import { Card } from 'react-bootstrap'

const KPICard = ({ title, value, icon, color }) => {
    return (
        <Card className="h-100 border-0 shadow-sm">
            <Card.Body className="d-flex align-items-center justify-content-between p-4">
                <div>
                    <h6 className="text-muted text-uppercase mb-2" style={{ fontSize: '0.7rem', letterSpacing: '1px', fontWeight: 600 }}>{title}</h6>
                    <h3 className="mb-0 fw-bold" style={{ fontSize: '1.75rem' }}>{value}</h3>
                </div>
                <div className={`p-3 rounded bg-${color} bg-opacity-10 text-${color}`} style={{ width: '60px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {icon}
                </div>
            </Card.Body>
        </Card>
    )
}

export default KPICard
