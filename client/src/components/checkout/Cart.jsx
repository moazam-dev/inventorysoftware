import React from 'react'
import { Card, Table, Button, Form, InputGroup, Badge, Row, Col, Alert } from 'react-bootstrap'
import { FaTrash, FaCheck, FaUser, FaPhone } from 'react-icons/fa'

const Cart = ({
    cartItems,
    onRemove,
    onUpdateQty,
    onCheckout,
    total,
    discount,
    setDiscount,

    customers = [],
    paymentMethods = [],
    selectedCustomer,
    setSelectedCustomer,
    selectedCustomerObj, // NEW PROP
    paidAmount,
    setPaidAmount,

    customer,
    setCustomer,

    paymentMethod,
    setPaymentMethod,
    notes,
    setNotes
}) => {

    const finalTotal = total - (discount || 0);
    const prevBalance = selectedCustomerObj?.currentBalance || 0;
    const netPayable = finalTotal + prevBalance;

    // Amount paying now defaults to full bill (finalTotal) not including old debt unless specified? 
    // Usually customers pay current bill + some old debt, or just current. 
    // Let's keep input placeholder as finalTotal. 

    const amountToPay = paidAmount === '' ? finalTotal : Number(paidAmount);

    // Total New Balance = (Previous + Current) - Paid
    const newTotalBalance = netPayable - amountToPay;

    // Balance for THIS transaction
    const balanceDue = finalTotal - amountToPay;

    return (
        <Card className="shadow-sm border-0 h-100">
            <Card.Header className="bg-white py-3">
                <h5 className="mb-0 fw-bold">Cart Summary</h5>
            </Card.Header>
            <Card.Body className="d-flex flex-column">
                <div className="flex-grow-1" style={{ overflowY: 'auto', maxHeight: '300px' }}>
                    {/* ... (Existing Cart Items Code is fine, not changing) ... */}
                    {cartItems.length === 0 ? (
                        <div className="text-center text-muted py-5">
                            Cart is empty
                        </div>
                    ) : (
                        <Table hover responsive borderless className="align-middle">
                            <tbody>
                                {cartItems.map((item, index) => (
                                    <tr key={index}>
                                        <td>
                                            <div className="fw-medium">{item.name}</div>
                                            <small className="text-muted">Rs {item.price}</small>
                                        </td>
                                        <td style={{ width: '120px' }}>
                                            <InputGroup size="sm">
                                                <Button variant="outline-secondary" onClick={() => onUpdateQty(index, item.qty - 1)}>-</Button>
                                                <Form.Control
                                                    className="text-center" // Check input
                                                    value={item.qty}
                                                    onChange={(e) => onUpdateQty(index, parseInt(e.target.value) || 1)}
                                                />
                                                <Button variant="outline-secondary" onClick={() => onUpdateQty(index, item.qty + 1)}>+</Button>
                                            </InputGroup>
                                        </td>
                                        <td className="text-end fw-bold">
                                            Rs {item.price * item.qty}
                                        </td>
                                        <td className="text-end" style={{ width: '40px' }}>
                                            <Button variant="link" className="text-danger p-0" onClick={() => onRemove(index)}>
                                                <FaTrash size={14} />
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    )}
                </div>

                <div className="border-top pt-3 mt-2">
                    {/* CUSTOMER SELECTION */}
                    <Form.Group className="mb-3">
                        <Form.Label className="small fw-bold text-uppercase text-muted">Customer</Form.Label>
                        <Form.Select
                            value={selectedCustomer}
                            onChange={(e) => setSelectedCustomer(e.target.value)}
                            className="mb-2"
                        >
                            <option value="">Walk-in Customer</option>
                            {customers.map(c => (
                                <option key={c._id} value={c._id}>{c.name} {c.phone ? `(${c.phone})` : ''}</option>
                            ))}
                        </Form.Select>

                        {/* SHOW PREVIOUS BALANCE IF CUSTOMER SELECTED */}
                        {selectedCustomerObj && (
                            <div className="alert alert-info py-2 px-3 small mb-2 d-flex justify-content-between">
                                <span>Previous Balance:</span>
                                <span className="fw-bold fs-6">Rs {prevBalance.toLocaleString()}</span>
                            </div>
                        )}

                        {!selectedCustomer && (
                            <Row className="g-2">
                                <Col>
                                    <InputGroup size="sm">
                                        <InputGroup.Text><FaUser /></InputGroup.Text>
                                        <Form.Control
                                            placeholder="Name"
                                            value={customer.name}
                                            onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
                                        />
                                    </InputGroup>
                                </Col>
                                <Col>
                                    <InputGroup size="sm">
                                        <InputGroup.Text><FaPhone /></InputGroup.Text>
                                        <Form.Control
                                            placeholder="Phone"
                                            value={customer.phone}
                                            onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
                                        />
                                    </InputGroup>
                                </Col>
                            </Row>
                        )}
                    </Form.Group>

                    {/* FINANCIALS */}
                    <div className="d-flex justify-content-between mb-2">
                        <span>Subtotal</span>
                        <span className="fw-bold">Rs {total}</span>
                    </div>
                    <div className="d-flex justify-content-between align-items-center mb-2">
                        <span>Discount</span>
                        <InputGroup size="sm" style={{ width: '100px' }}>
                            <Form.Control
                                type="number"
                                value={discount}
                                onChange={(e) => setDiscount(Number(e.target.value))}
                            />
                        </InputGroup>
                    </div>
                    <div className="d-flex justify-content-between fw-bold fs-5 mb-3 text-dark">
                        <span>Current Bill</span>
                        <span>Rs {finalTotal}</span>
                    </div>

                    {/* NET PAYABLE (Bill + Previous) */}
                    {selectedCustomerObj && (
                        <div className="d-flex justify-content-between fw-bold fs-5 mb-3 text-primary border-top border-bottom py-2">
                            <span>Net Payable</span>
                            <span>Rs {netPayable.toLocaleString()}</span>
                        </div>
                    )}

                    <Form.Group className="mb-3">
                        <Row className="g-2">
                            <Col md={6}>
                                <Form.Label className="small">Payment Method</Form.Label>
                                <Form.Select
                                    value={paymentMethod}
                                    onChange={(e) => setPaymentMethod(e.target.value)}
                                    size="sm"
                                >
                                    <option value="">-- Pay Later / None --</option>
                                    {paymentMethods.map(m => (
                                        <option key={m._id} value={m._id}>{m.name}</option>
                                    ))}
                                </Form.Select>
                            </Col>
                            <Col md={6}>
                                <Form.Label className="small">Amount Paid Now</Form.Label>
                                <Form.Control
                                    type="number"
                                    size="sm"
                                    placeholder={finalTotal}
                                    value={paidAmount}
                                    onChange={(e) => setPaidAmount(e.target.value)}
                                />
                            </Col>
                        </Row>
                    </Form.Group>

                    {balanceDue > 0 && selectedCustomer && (
                        <Alert variant="warning" className="py-2 px-3 small mb-3">
                            <strong>Balance Due: Rs {balanceDue.toLocaleString()}</strong> will be added to customer ledger.
                        </Alert>
                    )}

                    {balanceDue > 0 && !selectedCustomer && (
                        <div className="text-danger small mb-3 text-center">
                            * Select a customer to track pending balance.
                        </div>
                    )}

                    <Form.Group className="mb-3">
                        <Form.Control
                            as="textarea"
                            rows={1}
                            placeholder="Add notes..."
                            size="sm"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                        />
                    </Form.Group>

                    <Button
                        variant="primary"
                        className="w-100 fw-bold py-2"
                        size="lg"
                        disabled={cartItems.length === 0}
                        onClick={onCheckout}
                    >
                        <FaCheck className="me-2" /> Complete Sale
                    </Button>
                </div>
            </Card.Body>
        </Card>
    )
}

export default Cart
