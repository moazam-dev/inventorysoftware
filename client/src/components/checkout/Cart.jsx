import React from 'react'
import { Card, ListGroup, Button, Form, Row, Col } from 'react-bootstrap'
import { FaTrash, FaShoppingCart, FaMoneyBill, FaCreditCard, FaMobileAlt } from 'react-icons/fa'

const Cart = ({ cartItems, onRemove, onUpdateQty, onCheckout, total, discount, setDiscount, customer, setCustomer, paymentMethod, setPaymentMethod, notes, setNotes }) => {
    const finalTotal = total - (discount || 0);

    return (
        <Card className="border-0 shadow-sm h-100">
            <Card.Body className="d-flex flex-column">
                <h5 className="mb-3 fw-bold"><FaShoppingCart className="me-2" /> Cart</h5>

                <div className="flex-grow-1 overflow-auto mb-3" style={{ maxHeight: '300px' }}>
                    {cartItems.length === 0 ? (
                        <div className="text-center text-muted py-5">Cart is empty</div>
                    ) : (
                        <ListGroup variant="flush">
                            {cartItems.map((item, index) => (
                                <ListGroup.Item key={index} className="d-flex justify-content-between align-items-center px-0">
                                    <div style={{ width: '40%' }}>
                                        <div className="fw-bold text-truncate">{item.name}</div>
                                        <small className="text-muted">Rs {item.price}</small>
                                    </div>
                                    <div className="d-flex align-items-center">
                                        <Button size="sm" variant="outline-secondary" className="py-0 px-2" onClick={() => onUpdateQty(index, item.qty - 1)}>-</Button>
                                        <span className="mx-2">{item.qty}</span>
                                        <Button size="sm" variant="outline-secondary" className="py-0 px-2" onClick={() => onUpdateQty(index, item.qty + 1)}>+</Button>
                                    </div>
                                    <div className="fw-bold">Rs {(item.price * item.qty).toLocaleString()}</div>
                                    <Button variant="link" className="text-danger p-0 ms-2" onClick={() => onRemove(index)}><FaTrash /></Button>
                                </ListGroup.Item>
                            ))}
                        </ListGroup>
                    )}
                </div>

                <div className="border-top pt-3 mt-auto">
                    <Form.Group className="mb-3">
                        <Row>
                            <Col><Form.Label className="small text-muted">Name</Form.Label><Form.Control size="sm" placeholder="Customer name" value={customer.name} onChange={e => setCustomer({ ...customer, name: e.target.value })} /></Col>
                            <Col><Form.Label className="small text-muted">Phone</Form.Label><Form.Control size="sm" placeholder="Phone number" value={customer.phone} onChange={e => setCustomer({ ...customer, phone: e.target.value })} /></Col>
                        </Row>
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label className="small text-muted">Discount (PKR)</Form.Label>
                        <Form.Control type="number" size="sm" value={discount} onChange={(e) => setDiscount(Number(e.target.value))} />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label className="small text-muted mb-2">Payment Method</Form.Label>
                        <Row className="g-2">
                            <Col xs={6}>
                                <Button
                                    variant={paymentMethod === 'cash' ? 'primary' : 'outline-light text-dark border'}
                                    className="w-100 d-flex align-items-center justify-content-center"
                                    onClick={() => setPaymentMethod('cash')}
                                >
                                    <FaMoneyBill className="me-2" /> Cash
                                </Button>
                            </Col>
                            <Col xs={6}>
                                <Button
                                    variant={paymentMethod === 'card' ? 'primary' : 'outline-light text-dark border'}
                                    className="w-100 d-flex align-items-center justify-content-center"
                                    onClick={() => setPaymentMethod('card')}
                                >
                                    <FaCreditCard className="me-2" /> Card
                                </Button>
                            </Col>
                            <Col xs={6}>
                                <Button
                                    variant={paymentMethod === 'easypaisa' ? 'primary' : 'outline-light text-dark border'}
                                    className="w-100 d-flex align-items-center justify-content-center"
                                    onClick={() => setPaymentMethod('easypaisa')}
                                >
                                    <FaMobileAlt className="me-2" /> Easypaisa
                                </Button>
                            </Col>
                            <Col xs={6}>
                                <Button
                                    variant={paymentMethod === 'jazzcash' ? 'primary' : 'outline-light text-dark border'}
                                    className="w-100 d-flex align-items-center justify-content-center"
                                    onClick={() => setPaymentMethod('jazzcash')}
                                >
                                    <FaMobileAlt className="me-2" /> JazzCash
                                </Button>
                            </Col>
                        </Row>
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label className="small text-muted">Notes (Optional)</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={3}
                            placeholder="Additional notes"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                        />
                    </Form.Group>

                    <div className="d-flex justify-content-between mb-2">
                        <span>Subtotal</span>
                        <span>Rs {total.toLocaleString()}</span>
                    </div>
                    <div className="d-flex justify-content-between mb-3 fw-bold fs-5">
                        <span>Total</span>
                        <span>Rs {finalTotal.toLocaleString()}</span>
                    </div>

                    <Button variant="success" className="w-100 py-2 fw-bold" disabled={cartItems.length === 0} onClick={onCheckout}>
                        Complete Sale
                    </Button>
                </div>
            </Card.Body>
        </Card>
    )
}

export default Cart
