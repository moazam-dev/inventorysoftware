import React from 'react';
import { Card, Row, Col, Badge } from 'react-bootstrap';
import { FaChevronRight, FaBox, FaUndo, FaMoneyBillWave, FaReceipt, FaExclamationTriangle } from 'react-icons/fa';

export const LogCard = ({ title, subtitle, metrics, onClick }) => {
    return (
        <Card className="h-100 border-0 shadow-sm cursor-pointer hover-card-scale transition-all" onClick={onClick}>
            <Card.Body className="p-4">
                <div className="d-flex justify-content-between align-items-start mb-3">
                    <div>
                        <h5 className="fw-bold mb-1">{title}</h5>
                        <small className="text-muted">{subtitle}</small>
                    </div>
                    <FaChevronRight className="text-muted" />
                </div>

                <Row className="g-0 mt-3 pt-3 border-top">
                    <Col xs={12} className="mb-2 d-flex justify-content-between">
                        <span className="text-muted small">Items Sold</span>
                        <span className="fw-bold fs-6">{metrics.itemsSold || 0}</span>
                    </Col>
                    <Col xs={12} className="mb-3 d-flex justify-content-between">
                        <span className="text-muted small">Returns</span>
                        <span className="fw-bold fs-6">{metrics.returns || 0}</span>
                    </Col>
                    <Col xs={6}>
                        <div className="small text-muted text-uppercase mb-1" style={{ fontSize: '0.7rem' }}>Revenue</div>
                        <div className="text-success fw-bold">Rs {(metrics.revenue || 0).toLocaleString()}</div>
                    </Col>
                    <Col xs={6} className="text-end">
                        <div className="small text-muted text-uppercase mb-1" style={{ fontSize: '0.7rem' }}>Profit</div>
                        <div className="fw-bold">Rs {(metrics.profit || 0).toLocaleString()}</div>
                    </Col>
                </Row>
            </Card.Body>
        </Card>
    );
};

// Simplified card for Year view specifically if it needs a slightly different layout (screenshot 1)
export const YearCard = ({ year, itemsSold, revenue, profit, onClick }) => {
    return (
        <Card className="border-0 shadow-sm cursor-pointer hover-card-scale p-2" onClick={onClick}>
            <Card.Body>
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <div>
                        <h2 className="fw-bold mb-1">{year}</h2>
                        <div className="text-muted">{itemsSold} items sold</div>
                    </div>
                    <FaChevronRight className="text-muted" />
                </div>
                <Row>
                    <Col xs={6}>
                        <small className="text-muted text-uppercase fw-bold" style={{ fontSize: '0.75rem' }}>Revenue</small>
                        <div className="text-success fs-5 fw-bold">Rs {revenue.toLocaleString()}</div>
                    </Col>
                    <Col xs={6}>
                        <small className="text-muted text-uppercase fw-bold" style={{ fontSize: '0.75rem' }}>Profit</small>
                        <div className="text-dark fs-5 fw-bold">Rs {profit.toLocaleString()}</div>
                    </Col>
                </Row>
            </Card.Body>
        </Card>
    );
};

export const DayCard = ({ date, transactionsCount, revenue, profit, onClick }) => {
    return (
        <Card className="border-0 shadow-sm cursor-pointer hover-card-scale h-100" onClick={onClick}>
            <Card.Body className="p-0">
                <div className="p-3 border-bottom">
                    <div className="d-flex justify-content-between align-items-center">
                        <div className="d-flex align-items-center">
                            <div className="bg-primary bg-opacity-10 text-primary rounded p-2 me-3 text-center" style={{ minWidth: '50px' }}>
                                <div className="small fw-bold text-uppercase">{date.split(' ')[0].substring(0, 3)}</div>
                                <div className="fs-5 fw-bold">{date.split(' ')[1].replace(',', '')}</div>
                            </div>
                            <div>
                                <h6 className="fw-bold mb-1">{date}</h6>
                                <small className="text-muted">{transactionsCount} transactions</small>
                            </div>
                        </div>
                        <FaChevronRight className="text-muted" />
                    </div>
                </div>
                <Row className="g-0">
                    <Col xs={6} className="p-3 bg-success bg-opacity-10 border-end">
                        <small className="text-muted d-block text-center mb-1">Revenue</small>
                        <div className="text-success fw-bold text-center">Rs {revenue.toLocaleString()}</div>
                    </Col>
                    <Col xs={6} className="p-3 bg-light">
                        <small className="text-muted d-block text-center mb-1">Profit</small>
                        <div className="text-dark fw-bold text-center">Rs {profit.toLocaleString()}</div>
                    </Col>
                </Row>
            </Card.Body>
        </Card>
    );
};

export const HeaderStats = ({ revenue, profit, expenses, loss , selectedMonth,selectedDay}) => {
    console.log(selectedDay);
    
    return (
        <Row className="g-3 mb-4">
            <Col md={3}>
                <Card className="border-0 shadow-sm h-100">
                    <Card.Body>
                        <div className="d-flex align-items-center mb-2">
                            <FaMoneyBillWave className="text-success me-2" />
                            <small className="text-muted">Revenue</small>
                        </div>
                        <h4 className="fw-bold text-success mb-0">Rs {revenue.toLocaleString()}</h4>
                    </Card.Body>
                </Card>
            </Col>
            <Col md={3}>
                <Card className="border-0 shadow-sm h-100">
                    <Card.Body>
                        <div className="d-flex align-items-center mb-2">
                            <FaReceipt className="text-dark me-2" />
                            <small className="text-muted">Profit</small>
                        </div>
                        <h4 className="fw-bold text-dark mb-0">Rs {profit.toLocaleString()}</h4>
                    </Card.Body>
                </Card>
            </Col>
            <Col md={3}>
                <Card className="border-0 shadow-sm h-100">
                    <Card.Body>
                        <div className="d-flex align-items-center mb-2">
                            <FaReceipt className="text-warning me-2" />
                            <small className="text-muted">Expenses</small>
                        </div>
                        <h4 className="fw-bold text-warning mb-0">Rs {expenses.toLocaleString()}</h4>
                    </Card.Body>
                </Card>
            </Col>
            <Col md={3}>
                <Card className="border-0 shadow-sm h-100">
                    <Card.Body>
                        <div className="d-flex align-items-center mb-2">
                            <FaExclamationTriangle className="text-danger me-2" />
                            <small className="text-muted">Loss</small>
                        </div>
                        <h4 className="fw-bold text-danger mb-0">Rs {loss.toLocaleString()}</h4>
                    </Card.Body>
                </Card>
            </Col>
        </Row>
    )
}

export const TransactionRow = ({ transaction }) => {
    const isExpense = transaction.type === 'expense' || transaction.type === 'purchase' || transaction.type === 'return_from_customer';
    const isIncome = transaction.type === 'sale' || transaction.type === 'return_to_supplier'; // Return to supplier is basically money back so income-ish or cost reduction?
    // Actually, visually:
    // Sale -> Green
    // Expense/Purchase -> Red
    // Return from Customer -> Red (Refunding them)
    // Return to Supplier -> Green (Getting refund)

    // Icon logic
    let Icon = FaReceipt;
    let colorClass = 'text-dark';
    let amountColor = 'text-dark';
    let sign = '';

    if (transaction.type === 'sale') {
        Icon = FaMoneyBillWave;
        colorClass = 'text-success';
        amountColor = 'text-success';
        sign = '+';
    } else if (transaction.type === 'expense' || transaction.type === 'purchase') {
        Icon = FaExclamationTriangle;
        colorClass = 'text-danger';
        amountColor = 'text-danger';
        sign = '-';
    } else if (transaction.type === 'return_from_customer') {
        Icon = FaUndo;
        colorClass = 'text-danger';
        amountColor = 'text-danger';
        sign = '-';
    } else if (transaction.type === 'return_to_supplier') {
        Icon = FaUndo;
        colorClass = 'text-success';
        amountColor = 'text-success';
        sign = '+';
    }

    return (
        <div className="d-flex align-items-center justify-content-between p-3 bg-white border rounded shadow-sm mb-3">
            <div className="d-flex align-items-center">
                <div className={`p-3 rounded bg-opacity-10 me-3 ${colorClass.replace('text-', 'bg-')}`}>
                    <Icon className={colorClass} size={20} />
                </div>
                <div>
                    <h6 className="fw-bold mb-1">
                        {transaction.description || transaction.partyName || 'Transaction'}
                    </h6>
                    <Badge bg="light" text="dark" className="border fw-normal">
                        {transaction.type.replace(/_/g, ' ').toUpperCase()}
                    </Badge>
                </div>
            </div>
            <div className="text-end">
                <h5 className={`fw-bold mb-1 ${amountColor}`}>
                    {sign}Rs {transaction.amount || transaction.totalAmount || 0}
                </h5>
                <small className="text-muted">
                    {new Date(transaction.date || transaction.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </small>
            </div>
        </div>
    );
};
