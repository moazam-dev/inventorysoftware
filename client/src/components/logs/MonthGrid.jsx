import React from 'react'
import { Row, Col, Card } from 'react-bootstrap'

const MonthGrid = ({ months, onSelect }) => {
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    return (
        <Row className="g-3 mb-4">
            {months.map((data) => (
                <Col key={data._id} md={3} sm={6}>
                    <Card className="h-100 border-0 shadow-sm cursor-pointer hover-card" onClick={() => onSelect(data._id)}>
                        <Card.Body className="text-center">
                            <h6 className="fw-bold mb-2">{monthNames[data._id - 1]}</h6>
                            <div className="small text-muted mb-1">Revenue: Rs {data.totalRevenue.toLocaleString()}</div>
                            <div className={`small fw-bold ${data.totalProfit >= 0 ? 'text-success' : 'text-danger'}`}>
                                Profit: Rs {data.totalProfit.toLocaleString()}
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            ))}
            {months.length === 0 && <Col><div className="text-muted">No data for this year</div></Col>}
        </Row>
    )
}

export default MonthGrid
