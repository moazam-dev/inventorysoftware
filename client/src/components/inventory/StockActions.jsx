import React from 'react'
import { Card, Row, Col } from 'react-bootstrap'
import { FaBoxOpen, FaTruck, FaUndo } from 'react-icons/fa'

const StockActions = ({ onAction }) => {
    return (
        <Row className="g-3 mb-4">
            <Col md={4}>
                <Card className="h-100 border-0 shadow-sm cursor-pointer hover-card" onClick={() => onAction('add_stock')}>
                    <Card.Body className="d-flex flex-column align-items-center justify-content-center text-center p-4">
                        <div className="p-3 rounded-circle bg-primary bg-opacity-10 text-primary mb-3">
                            <FaBoxOpen size={24} />
                        </div>
                        <h6 className="fw-bold mb-1">Add New Stock</h6>
                        <small className="text-muted">Record new purchases from suppliers</small>
                    </Card.Body>
                </Card>
            </Col>
            <Col md={4}>
                <Card className="h-100 border-0 shadow-sm cursor-pointer hover-card" onClick={() => onAction('return_supplier')}>
                    <Card.Body className="d-flex flex-column align-items-center justify-content-center text-center p-4">
                        <div className="p-3 rounded-circle bg-warning bg-opacity-10 text-warning mb-3">
                            <FaTruck size={24} />
                        </div>
                        <h6 className="fw-bold mb-1">Return to Supplier</h6>
                        <small className="text-muted">Record defective items returned to supplier</small>
                    </Card.Body>
                </Card>
            </Col>
            <Col md={4}>
                <Card className="h-100 border-0 shadow-sm cursor-pointer hover-card" onClick={() => onAction('return_customer')}>
                    <Card.Body className="d-flex flex-column align-items-center justify-content-center text-center p-4">
                        <div className="p-3 rounded-circle bg-danger bg-opacity-10 text-danger mb-3">
                            <FaUndo size={24} />
                        </div>
                        <h6 className="fw-bold mb-1">Customer Return</h6>
                        <small className="text-muted">Record items returned by customers</small>
                    </Card.Body>
                </Card>
            </Col>
        </Row>
    )
}

export default StockActions
