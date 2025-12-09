import React, { useState, useEffect, useRef } from 'react'
import { Button, Row, Col, Card, Form, Tabs, Tab, Spinner, InputGroup, Alert, Modal } from 'react-bootstrap'
import { FaMoneyBillWave, FaPrint, FaUserTie, FaIndustry, FaCheckCircle, FaPlus } from 'react-icons/fa'
import { useReactToPrint } from 'react-to-print'
import axios from 'axios'
import { toast } from 'react-toastify'

const Payments = () => {
    const [activeTab, setActiveTab] = useState('pay_supplier'); // pay_supplier, receive_customer
    const [loading, setLoading] = useState(false);

    // Data Lists
    const [suppliers, setSuppliers] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [paymentMethods, setPaymentMethods] = useState([]);

    // Form State
    const [selectedParty, setSelectedParty] = useState(''); // Name for Supplier, ID for Customer
    const [currentBalance, setCurrentBalance] = useState(0);
    const [amount, setAmount] = useState('');
    const [selectedMethod, setSelectedMethod] = useState('');
    const [description, setDescription] = useState('');

    // Method Management State
    const [showMethodModal, setShowMethodModal] = useState(false);
    const [newMethodName, setNewMethodName] = useState('');
    const [newAccountNumber, setNewAccountNumber] = useState('');
    const [newMethodType, setNewMethodType] = useState('cash');

    // Receipt State
    const [lastPayment, setLastPayment] = useState(null);
    const receiptRef = useRef();

    const API_URL = 'http://localhost:5000/api';

    // --- Data Fetching ---

    useEffect(() => {
        fetchPaymentMethods();
    }, []);

    useEffect(() => {
        if (activeTab === 'pay_supplier') {
            fetchSuppliers();
        } else {
            fetchCustomers();
        }
        // Reset form on tab switch
        setSelectedParty('');
        setCurrentBalance(0);
        setAmount('');
        setDescription('');
        setLastPayment(null);
    }, [activeTab]);

    useEffect(() => {
        if (selectedParty) {
            fetchBalance();
        } else {
            setCurrentBalance(0);
        }
    }, [selectedParty]);

    const fetchPaymentMethods = async () => {
        try {
            const res = await axios.get(`${API_URL}/payment-methods`);
            if (res.data.success) setPaymentMethods(res.data.data);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchSuppliers = async () => {
        try {
            const res = await axios.get(`${API_URL}/ledger/suppliers`);
            if (res.data.success) setSuppliers(res.data.data);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchCustomers = async () => {
        try {
            const res = await axios.get(`${API_URL}/customers`);
            if (res.data.success) setCustomers(res.data.data);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchBalance = async () => {
        setLoading(true);
        try {
            if (activeTab === 'pay_supplier') {
                const res = await axios.get(`${API_URL}/ledger/${selectedParty}`);
                if (res.data.success) {
                    setCurrentBalance(res.data.data.stats.currentBalance || 0);
                }
            } else {
                const res = await axios.get(`${API_URL}/customers/${selectedParty}`);
                if (res.data.success) {
                    setCurrentBalance(res.data.data.currentBalance || 0);
                }
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };
    const handleCreateMethod = async () => {
        if (!newMethodName) return;
        try {
            await axios.post(`${API_URL}/payment-methods`, {
                name: newMethodName,
                type: newMethodType,
                accountNumber: newAccountNumber
            });
            toast.success('Payment method created');
            setShowMethodModal(false);
            setNewMethodName('');
            setNewAccountNumber('');
            fetchPaymentMethods();
        } catch (err) {
            toast.error('Failed to create method');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedParty || !amount || !selectedMethod) {
            toast.error('Please fill all required fields');
            return;
        }

        setLoading(true);
        try {
            const payload = {
                type: activeTab, // pay_supplier, receive_customer
                amount: Number(amount),
                paymentMethodId: selectedMethod,
                description,
                date: new Date()
            };

            if (activeTab === 'pay_supplier') {
                payload.partyName = selectedParty;
            } else {
                payload.customerId = selectedParty;
            }

            const res = await axios.post(`${API_URL}/payments`, payload);

            if (res.data.success) {
                toast.success('Payment recorded successfully!');

                // Get full names for receipt
                const methodName = paymentMethods.find(m => m._id === selectedMethod)?.name;
                let partyNameDisplay = selectedParty;
                if (activeTab === 'receive_customer') {
                    const cust = customers.find(c => c._id === selectedParty);
                    partyNameDisplay = cust ? cust.name : 'Unknown Customer';
                }

                setLastPayment({
                    ...res.data.data,
                    methodName,
                    partyNameDisplay,
                    previousBalance: currentBalance,
                    newBalance: activeTab === 'pay_supplier'
                        ? currentBalance - Number(amount) // We paid, so we owe less
                        : currentBalance - Number(amount) // They paid, so they owe less
                });

                // Reset form slightly
                setAmount('');
                setDescription('');
                fetchBalance(); // Refresh balance
            }
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.message || 'Error recording payment');
        } finally {
            setLoading(false);
        }
    };

    const handlePrint = () => {
        const content = receiptRef.current;
        if (!content) {
            toast.error("Receipt not found");
            return;
        }

        const printWindow = window.open('', '', 'width=400,height=600');
        if (!printWindow) {
            toast.error("Popup blocked. Please allow popups.");
            return;
        }

        const styles = Array.from(document.styleSheets)
            .map(styleSheet => {
                try {
                    return Array.from(styleSheet.cssRules)
                        .map(rule => rule.cssText)
                        .join('');
                } catch (e) {
                    return '';
                }
            })
            .join('\n');

        printWindow.document.write(`
            <html>
                <head>
                    <title>Payment Receipt</title>
                    <style>
                        ${styles}
                        body { margin: 20px; font-family: sans-serif; }
                        .receipt-paper { border: none !important; box-shadow: none !important; }
                    </style>
                </head>
                <body>
                    ${content.innerHTML}
                </body>
            </html>
        `);

        printWindow.document.close();
        printWindow.focus();

        setTimeout(() => {
            printWindow.print();
            printWindow.close();
        }, 500);
    };

    return (
        <div className="container-fluid p-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="fw-bold mb-0">Payments</h2>
                <Button variant="outline-primary" size="sm" onClick={() => setShowMethodModal(true)}>
                    <FaPlus className="me-2" /> Manage Methods
                </Button>
            </div>

            <Row className="g-4">
                <Col md={6}>
                    <Card className="shadow-sm border-0">
                        <Card.Body className="p-4">
                            <Tabs
                                activeKey={activeTab}
                                onSelect={(k) => setActiveTab(k)}
                                className="mb-4"
                                variant="pills"
                                fill
                            >
                                <Tab eventKey="pay_supplier" title="Pay Supplier">
                                    <div className="pt-3">
                                        <div className="alert alert-warning border-0 bg-warning bg-opacity-10 d-flex align-items-center">
                                            <FaIndustry className="me-2" />
                                            <div>
                                                <strong>Paying a Supplier</strong>
                                                <div className="small text-muted">Reduces the amount you owe to them.</div>
                                            </div>
                                        </div>
                                    </div>
                                </Tab>
                                <Tab eventKey="receive_customer" title="Receive from Customer">
                                    <div className="pt-3">
                                        <div className="alert alert-success border-0 bg-success bg-opacity-10 d-flex align-items-center">
                                            <FaUserTie className="me-2" />
                                            <div>
                                                <strong>Receiving from Customer</strong>
                                                <div className="small text-muted">Reduces the amount they owe to you.</div>
                                            </div>
                                        </div>
                                    </div>
                                </Tab>
                            </Tabs>

                            <Form onSubmit={handleSubmit}>
                                <Form.Group className="mb-3">
                                    <Form.Label>{activeTab === 'pay_supplier' ? 'Select Supplier' : 'Select Customer'}</Form.Label>
                                    <Form.Select
                                        value={selectedParty}
                                        onChange={(e) => setSelectedParty(e.target.value)}
                                        required
                                    >
                                        <option value="">-- Select --</option>
                                        {activeTab === 'pay_supplier' ? (
                                            suppliers.map((s, idx) => (
                                                <option key={idx} value={s}>{s}</option>
                                            ))
                                        ) : (
                                            customers.map((c) => (
                                                <option key={c._id} value={c._id}>{c.name} {c.phone ? `(${c.phone})` : ''}</option>
                                            ))
                                        )}
                                    </Form.Select>
                                </Form.Group>

                                {selectedParty && (
                                    <div className={`mb-3 p-3 rounded ${currentBalance > 0 ? 'bg-danger bg-opacity-10 text-danger' : 'bg-success bg-opacity-10 text-success'}`}>
                                        <div className="d-flex justify-content-between align-items-center">
                                            <span>Current Pending Balance:</span>
                                            <span className="fw-bold fs-5">
                                                {loading ? <Spinner size="sm" /> : `Rs ${currentBalance.toLocaleString()}`}
                                            </span>
                                        </div>
                                        <small className="text-muted">
                                            {currentBalance > 0 ? (activeTab === 'pay_supplier' ? 'You owe this amount' : 'Customer owes this amount') : 'Zero / Clear'}
                                        </small>
                                    </div>
                                )}

                                <Form.Group className="mb-3">
                                    <Form.Label>Payment Method</Form.Label>
                                    <Form.Select
                                        value={selectedMethod}
                                        onChange={(e) => setSelectedMethod(e.target.value)}
                                        required
                                    >
                                        <option value="">-- Select Method --</option>
                                        {paymentMethods.map(m => (
                                            <option key={m._id} value={m._id}>
                                                {m.name} {m.accountNumber ? `[${m.accountNumber}]` : ''} ({m.type})
                                            </option>
                                        ))}
                                    </Form.Select>
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label>Amount (Rs)</Form.Label>
                                    <InputGroup>
                                        <InputGroup.Text>Rs</InputGroup.Text>
                                        <Form.Control
                                            type="number"
                                            min="1"
                                            value={amount}
                                            onChange={(e) => setAmount(e.target.value)}
                                            required
                                        />
                                    </InputGroup>
                                </Form.Group>

                                <Form.Group className="mb-4">
                                    <Form.Label>Description / Notes</Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        rows={2}
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                    />
                                </Form.Group>

                                <div className="d-grid">
                                    <Button variant="primary" size="lg" type="submit" disabled={loading}>
                                        {loading ? <Spinner animation="border" size="sm" /> : (
                                            <>
                                                <FaCheckCircle className="me-2" />
                                                {activeTab === 'pay_supplier' ? 'Pay Supplier' : 'Receive Payment'}
                                            </>
                                        )}
                                    </Button>
                                    <div className="text-center mt-2">
                                        <small className="text-muted">Will generate a receipt automatically.</small>
                                    </div>
                                </div>
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>

                {/* Receipt Preview Section */}
                <Col md={6}>
                    {lastPayment ? (
                        <Card className="shadow-sm border-0 h-100">
                            <Card.Header className="bg-white border-bottom py-3 d-flex justify-content-between align-items-center">
                                <h5 className="mb-0 fw-bold">Receipt Generated</h5>
                                <Button variant="outline-dark" size="sm" onClick={handlePrint}>
                                    <FaPrint className="me-2" /> Print
                                </Button>
                            </Card.Header>
                            <Card.Body className="d-flex flex-column align-items-center justify-content-center bg-light">
                                <div className="receipt-paper bg-white p-4 shadow-sm" style={{ width: '100%', maxWidth: '380px' }} ref={receiptRef}>
                                    <div className="text-center mb-4">
                                        <h4 className="fw-bold text-uppercase mb-1">ELEGANCE BOUTIQUE</h4>
                                        <small className="text-muted">Payment Receipt</small>
                                    </div>

                                    <div className="border-top border-bottom py-3 mb-3">
                                        <div className="d-flex justify-content-between mb-2">
                                            <span className="text-muted">Date:</span>
                                            <span className="fw-bold">{new Date(lastPayment.date).toLocaleDateString()}</span>
                                        </div>
                                        <div className="d-flex justify-content-between mb-2">
                                            <span className="text-muted">Transaction ID:</span>
                                            <span className="small text-muted">{lastPayment._id.slice(-6).toUpperCase()}</span>
                                        </div>
                                        <div className="d-flex justify-content-between mb-2">
                                            <span className="text-muted">{activeTab === 'pay_supplier' ? 'To Supplier:' : 'From Customer:'}</span>
                                            <span className="fw-bold text-end">{lastPayment.partyNameDisplay}</span>
                                        </div>
                                        <div className="d-flex justify-content-between mb-2">
                                            <span className="text-muted">Method:</span>
                                            <span>{lastPayment.methodName}</span>
                                        </div>
                                    </div>

                                    <div className="mb-4">
                                        <div className="d-flex justify-content-between align-items-end mb-2">
                                            <span className="fs-5 fw-bold">Amount Paid</span>
                                            <span className="fs-4 fw-bold">Rs {lastPayment.amount.toLocaleString()}</span>
                                        </div>
                                        {lastPayment.description && (
                                            <div className="text-muted small fst-italic mt-2">
                                                "{lastPayment.description}"
                                            </div>
                                        )}
                                    </div>

                                    <div className="border-top pt-3">
                                        <div className="d-flex justify-content-between text-muted small mb-1">
                                            <span>Previous Balance:</span>
                                            <span>Rs {lastPayment.previousBalance.toLocaleString()}</span>
                                        </div>
                                        <div className="d-flex justify-content-between fw-bold text-dark mb-1">
                                            <span>New Balance:</span>
                                            <span>Rs {lastPayment.newBalance.toLocaleString()}</span>
                                        </div>
                                    </div>

                                    <div className="text-center mt-4 pt-3 border-top border-2">
                                        <small className="text-muted">Thank you for your business!</small>
                                    </div>
                                </div>
                            </Card.Body>
                        </Card>
                    ) : (
                        <div className="h-100 d-flex align-items-center justify-content-center text-muted border rounded-3 bg-light p-5">
                            <div className="text-center">
                                <FaPrint size={48} className="mb-3 opacity-25" />
                                <p>Fill the form to generate a payment receipt.</p>
                            </div>
                        </div>
                    )}
                </Col>
            </Row>

            {/* Add Method Modal */}
            <Modal show={showMethodModal} onHide={() => setShowMethodModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Add Payment Method</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form.Group className="mb-3">
                        <Form.Label>Method Name</Form.Label>
                        <Form.Control
                            placeholder="e.g. JazzCash, EasyPaisa, Meezan Bank"
                            value={newMethodName}
                            onChange={(e) => setNewMethodName(e.target.value)}
                        />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Account Number</Form.Label>
                        <Form.Control
                            placeholder="e.g. 03001234567 or IBAN"
                            value={newAccountNumber}
                            onChange={(e) => setNewAccountNumber(e.target.value)}
                        />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Type</Form.Label>
                        <Form.Select
                            value={newMethodType}
                            onChange={(e) => setNewMethodType(e.target.value)}
                        >
                            <option value="cash">Cash</option>
                            <option value="bank">Bank</option>
                            <option value="mobile_wallet">Mobile Wallet</option>
                            <option value="other">Other</option>
                        </Form.Select>
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowMethodModal(false)}>Cancel</Button>
                    <Button variant="primary" onClick={handleCreateMethod} disabled={!newMethodName}>Create Method</Button>
                </Modal.Footer>
            </Modal>
        </div >
    )
}

export default Payments
