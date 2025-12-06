import React from 'react'
import { ListGroup, Badge } from 'react-bootstrap'

const DayList = ({ days, onSelect }) => {
    return (
        <div className="mb-4">
            <h5 className="text-muted mb-3">Daily Logs</h5>
            <ListGroup>
                {days.map(day => (
                    <ListGroup.Item
                        key={day._id}
                        action
                        onClick={() => onSelect(day)}
                        className="d-flex justify-content-between align-items-center border-0 shadow-sm mb-2 rounded"
                    >
                        <div>
                            <span className="fw-bold me-3">{day.day} / {day.month} / {day.year}</span>
                            <Badge bg="light" text="dark" className="me-2">{day.itemsSold} Sold</Badge>
                            <Badge bg="light" text="dark">{day.itemsReturned} Returned</Badge>
                        </div>
                        <div className="text-end">
                            <div className="fw-bold text-success">Rs {day.totalRevenue.toLocaleString()}</div>
                            <small className="text-muted">Profit: Rs {day.totalProfit.toLocaleString()}</small>
                        </div>
                    </ListGroup.Item>
                ))}
                {days.length === 0 && <div className="text-muted">No daily logs found</div>}
            </ListGroup>
        </div>
    )
}

export default DayList
