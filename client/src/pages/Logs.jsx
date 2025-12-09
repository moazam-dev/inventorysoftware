import React, { useState, useEffect } from 'react'
import { Button, Row, Col, InputGroup, Form, Spinner, Tabs, Tab, Card, Table, Badge } from 'react-bootstrap'
import { FaSearch, FaArrowLeft, FaIndustry, FaMoneyBillWave, FaUndo, FaDownload, FaUserTie } from 'react-icons/fa'
import axios from 'axios'
import { YearCard, LogCard, DayCard, HeaderStats, TransactionRow } from '../components/logs/LogComponents'
import { downloadCSV, generateYearCSV, generateMonthCSV, generateDayCSV, generateSupplierLedgerCSV } from '../utils/csvExport'

const Logs = () => {
    const [activeTab, setActiveTab] = useState('business'); // business, ledger
    const [view, setView] = useState('years'); // years, months, days, transactions
    const [loading, setLoading] = useState(false);
    // const [searchTerm, setSearchTerm] = useState('');

    // Business Logs Selection State
    const [selectedYear, setSelectedYear] = useState(null);
    const [selectedMonth, setSelectedMonth] = useState(null);
    const [selectedDay, setSelectedDay] = useState(null);

    // Ledger Selection State
    const [ledgerView, setLedgerView] = useState('suppliers'); // suppliers, detail
    const [suppliers, setSuppliers] = useState([]);
    const [selectedSupplier, setSelectedSupplier] = useState(null);
    const [supplierData, setSupplierData] = useState(null); // { stats, ledger }

    // Customer Ledger State
    const [customers, setCustomers] = useState([]);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [customerData, setCustomerData] = useState(null);

    // Payment Ledger State
    const [paymentMethods, setPaymentMethods] = useState([]);
    const [selectedMethod, setSelectedMethod] = useState(null);
    const [methodData, setMethodData] = useState(null);

    // Data State for Business Logs
    const [years, setYears] = useState([]);
    const [months, setMonths] = useState([]);
    const [days, setDays] = useState([]);
    const [dayDetails, setDayDetails] = useState(null);

    const API_URL = 'http://localhost:5000/api';

    // --- Business Logs Data Fetching ---

    useEffect(() => {
        if (activeTab === 'business') {
            fetchYears();
        } else if (activeTab === 'ledger') {
            fetchSuppliers();
        } else if (activeTab === 'customer_ledger') {
            fetchCustomers();
        } else if (activeTab === 'payment_ledger') {
            fetchPaymentMethods();
        }
    }, [activeTab]);

    const fetchYears = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${API_URL}/logs/years`);
            if (res.data.success) setYears(res.data.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchMonths = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${API_URL}/logs/${selectedYear._id}`);
            if (res.data.success) setMonths(res.data.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchDays = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${API_URL}/logs/${selectedYear._id}/${selectedMonth.month}`);
            if (res.data.success) setDays(res.data.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchDayDetails = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${API_URL}/logs/${selectedYear._id}/${selectedMonth.month}/${selectedDay.day}`);
            if (res.data.success) setDayDetails(res.data.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (selectedYear && view === 'months') fetchMonths();
    }, [selectedYear, view]);

    useEffect(() => {
        if (selectedYear && selectedMonth && view === 'days') fetchDays();
    }, [selectedYear, selectedMonth, view]);

    useEffect(() => {
        if (selectedYear && selectedMonth && selectedDay && view === 'transactions') fetchDayDetails();
    }, [selectedYear, selectedMonth, selectedDay, view]);


    // --- Ledger Data Fetching ---
    const fetchSuppliers = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${API_URL}/ledger/suppliers`);
            if (res.data.success) setSuppliers(res.data.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchSupplierHistory = async (supplierName) => {
        setLoading(true);
        try {
            const res = await axios.get(`${API_URL}/ledger/${supplierName}`);
            if (res.data.success) setSupplierData(res.data.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchCustomers = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${API_URL}/customers`);
            if (res.data.success) setCustomers(res.data.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchCustomerHistory = async (customerId) => {
        setLoading(true);
        try {
            const res = await axios.get(`${API_URL}/customers/${customerId}/ledger`);
            if (res.data.success) setCustomerData(res.data.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchPaymentMethods = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${API_URL}/payment-methods`);
            if (res.data.success) setPaymentMethods(res.data.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchMethodHistory = async (methodId) => {
        setLoading(true);
        try {
            const res = await axios.get(`${API_URL}/payment-methods/${methodId}/ledger`);
            if (res.data.success) setMethodData(res.data.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };


    // --- Navigation Handlers ---

    const handleYearClick = (yearData) => {
        setSelectedYear(yearData);
        setView('months');
    };

    const handleMonthClick = (monthData) => {
        setSelectedMonth(monthData);
        setView('days');
    };

    const handleDayClick = (dayData) => {
        setSelectedDay(dayData);
        setView('transactions');
    };

    const handleBack = () => {
        if (activeTab === 'business') {
            if (view === 'transactions') {
                setView('days');
                setSelectedDay(null);
                setDayDetails(null);
            } else if (view === 'days') {
                setView('months');
                setSelectedMonth(null);
            } else if (view === 'months') {
                setView('years');
                setSelectedYear(null);
            }
        } else if (activeTab === 'ledger') {
            // Ledger Back
            if (ledgerView === 'detail') {
                setLedgerView('suppliers');
                setSelectedSupplier(null);
                setSupplierData(null);
            }
        } else if (activeTab === 'customer_ledger') {
            if (selectedCustomer) {
                setSelectedCustomer(null);
                setCustomerData(null);
            }
        } else if (activeTab === 'payment_ledger') {
            if (selectedMethod) {
                setSelectedMethod(null);
                setMethodData(null);
            }
        }
    };

    const handleSupplierClick = (supplier) => {
        setSelectedSupplier(supplier);
        fetchSupplierHistory(supplier);
        setLedgerView('detail');
    };

    const handleCustomerClick = (customer) => {
        setSelectedCustomer(customer);
        fetchCustomerHistory(customer._id);
    };

    const handleMethodClick = (method) => {
        setSelectedMethod(method);
        fetchMethodHistory(method._id);
    };

    // CSV Export Handlers
    const handleDownloadYearCSV = async () => {
        const csvContent = await generateYearCSV(selectedYear._id, API_URL);
        if (csvContent) {
            downloadCSV(csvContent, `Business_Logs_${selectedYear._id}.csv`);
        }
    };

    const handleDownloadMonthCSV = async () => {
        const csvContent = await generateMonthCSV(selectedYear._id, selectedMonth.month, selectedMonth.name, API_URL);
        if (csvContent) {
            downloadCSV(csvContent, `Business_Logs_${selectedMonth.name}_${selectedYear._id}.csv`);
        }
    };

    const handleDownloadDayCSV = () => {
        const csvContent = generateDayCSV(dayDetails, selectedYear._id, selectedMonth.name, selectedDay.day);
        if (csvContent) {
            downloadCSV(csvContent, `Business_Logs_${selectedMonth.name}_${selectedDay.day}_${selectedYear._id}.csv`);
        }
    };

    const handleDownloadSupplierCSV = () => {
        const csvContent = generateSupplierLedgerCSV(supplierData, selectedSupplier);
        if (csvContent) {
            downloadCSV(csvContent, `Supplier_Ledger_${selectedSupplier.replace(/\s+/g, '_')}.csv`);
        }
    };

    // --- Render Helpers ---

    const getTitle = () => {
        if (activeTab === 'business') {
            if (view === 'years') return 'Genera Business Logs';
            if (view === 'months') return `Logs / ${selectedYear._id}`;
            if (view === 'days') return `Logs / ${selectedYear._id} / ${selectedMonth.name}`;
            if (view === 'transactions') return `Logs / ${selectedYear._id} / ${selectedMonth.name} / Day ${selectedDay.day}`;
            return 'Logs';
        } else if (activeTab === 'ledger') {
            if (ledgerView === 'suppliers') return 'Supplier Ledger';
            if (ledgerView === 'detail') return `Ledger / ${selectedSupplier}`;
            return 'Ledger';
        } else if (activeTab === 'customer_ledger') {
            if (!selectedCustomer) return 'Customer Ledger';
            return `Customer / ${selectedCustomer.name}`;
        } else if (activeTab === 'payment_ledger') {
            if (!selectedMethod) return 'Payment Ledger';
            return `Payment Method / ${selectedMethod.name}`;
        }
        return 'Logs';
    };

    return (
        <div className="container-fluid p-4">
            <div className="d-flex align-items-center justify-content-between mb-4">
                <div className="d-flex align-items-center">
                    {(
                        (activeTab === 'business' && view !== 'years') ||
                        (activeTab === 'ledger' && ledgerView !== 'suppliers') ||
                        (activeTab === 'customer_ledger' && selectedCustomer) ||
                        (activeTab === 'payment_ledger' && selectedMethod)
                    ) && (
                            <Button variant="link" className="p-0 text-dark me-3" onClick={handleBack}>
                                <FaArrowLeft />
                            </Button>
                        )}
                    <div>
                        <h2 className="fw-bold mb-1">{getTitle()}</h2>
                        <p className="text-muted mb-0">
                            {activeTab === 'business' && 'Complete record of all business activity'}
                            {activeTab === 'ledger' && 'Track supplier history and transactions'}
                            {activeTab === 'customer_ledger' && 'Track customer purchases and payments'}
                            {activeTab === 'payment_ledger' && 'Track financial flow through payment methods'}
                        </p>
                    </div>
                </div>
                {/* Download CSV Buttons */}
                {activeTab === 'business' && (
                    <div>
                        {view === 'months' && selectedYear && (
                            <Button variant="success" onClick={handleDownloadYearCSV}>
                                <FaDownload className="me-2" /> Download Year CSV
                            </Button>
                        )}
                        {view === 'days' && selectedMonth && (
                            <Button variant="success" onClick={handleDownloadMonthCSV}>
                                <FaDownload className="me-2" /> Download Month CSV
                            </Button>
                        )}
                        {view === 'transactions' && dayDetails && (
                            <Button variant="success" onClick={handleDownloadDayCSV}>
                                <FaDownload className="me-2" /> Download Day CSV
                            </Button>
                        )}
                    </div>
                )}
                {activeTab === 'ledger' && ledgerView === 'detail' && supplierData && (
                    <Button variant="success" onClick={handleDownloadSupplierCSV}>
                        <FaDownload className="me-2" /> Download Supplier CSV
                    </Button>
                )}
            </div>

            <Tabs
                activeKey={activeTab}
                onSelect={(k) => setActiveTab(k)}
                className="mb-4"
            >
                <Tab eventKey="business" title="Business Logs" />
                <Tab eventKey="ledger" title="Supplier Ledger" />
                <Tab eventKey="customer_ledger" title="Customer Ledger" />
                <Tab eventKey="payment_ledger" title="Payment Ledger" />
            </Tabs>

            {loading ? (
                <div className="text-center py-5">
                    <Spinner animation="border" variant="primary" />
                </div>
            ) : (
                <>
                    {/* BUSINESS LOGS VIEW */}
                    {activeTab === 'business' && (
                        <>
                            {view === 'years' && (
                                <Row className="g-4">
                                    {years.map((year) => (
                                        <Col md={3} key={year._id}>
                                            <YearCard
                                                year={year._id}
                                                itemsSold={`${year.itemsSold || 0} items sold`}
                                                revenue={year.totalRevenue || 0}
                                                profit={year.totalProfit || 0}
                                                onClick={() => handleYearClick(year)}
                                            />
                                        </Col>
                                    ))}
                                </Row>
                            )}

                            {view === 'months' && (
                                <Row className="g-4">
                                    {months.map((month) => (
                                        <Col md={3} key={month.month}>
                                            <LogCard
                                                title={month.name}
                                                subtitle={month.itemsSold > 0 ? `${month.itemsSold} items sold` : 'No activity'}
                                                metrics={{
                                                    itemsSold: month.itemsSold,
                                                    returns: month.itemsReturned,
                                                    revenue: month.totalRevenue,
                                                    profit: month.totalProfit
                                                }}
                                                onClick={() => handleMonthClick(month)}
                                            />
                                        </Col>
                                    ))}
                                </Row>
                            )}

                            {view === 'days' && (
                                <>
                                    {selectedMonth && (
                                        <HeaderStats
                                            selectedMonth={selectedMonth}
                                            revenue={selectedMonth.totalRevenue}
                                            profit={selectedMonth.totalProfit}
                                            expenses={selectedMonth.totalExpenses}
                                            loss={selectedMonth.totalLoss}
                                        />
                                    )}

                                    <Row className="g-4">
                                        {days.map((day) => {
                                            const dateStr = `${selectedMonth.name} ${day.day}`;
                                            return (
                                                <Col md={3} key={day.day}>
                                                    <DayCard
                                                        date={dateStr}
                                                        transactionsCount={day.transactions ? day.transactions.length : 0}
                                                        revenue={day.totalRevenue}
                                                        profit={day.totalProfit}
                                                        onClick={() => handleDayClick(day)}
                                                    />
                                                </Col>
                                            )
                                        })}
                                        {days.length === 0 && (
                                            <div className="text-center text-muted py-5">
                                                No activity found for this month.
                                            </div>
                                        )}
                                    </Row>
                                </>
                            )}

                            {view === 'transactions' && dayDetails && (
                                <div>
                                    <HeaderStats
                                        selectedDay={dayDetails}
                                        revenue={dayDetails.totalRevenue}
                                        profit={dayDetails.totalProfit}
                                        expenses={dayDetails.totalExpenses}
                                        loss={dayDetails.totalLoss}
                                    />

                                    <h4 className="fw-bold mb-4">Transactions on {selectedMonth.name} {selectedDay.day}, {selectedYear._id}</h4>

                                    {dayDetails.transactions && dayDetails.transactions.length > 0 ? (
                                        <div>
                                            {dayDetails.transactions.map((t, idx) => (
                                                <TransactionRow key={idx} transaction={t} />
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-muted">No details available.</div>
                                    )}
                                </div>
                            )}
                        </>
                    )}

                    {/* CUSTOMER LEDGER VIEW */}
                    {activeTab === 'customer_ledger' && (
                        <>
                            {!selectedCustomer && (
                                <Row className="g-4">
                                    {customers.map((c) => (
                                        <Col md={3} key={c._id}>
                                            <Card
                                                className="h-100 border-0 shadow-sm cursor-pointer hover-card-scale text-center p-4 bg-white"
                                                onClick={() => handleCustomerClick(c)}
                                            >
                                                <div className="mb-3 text-success">
                                                    <FaUserTie size={40} />
                                                </div>
                                                <h5 className="fw-bold text-dark">{c.name}</h5>
                                                {c.phone && <div className="text-muted small mb-2">{c.phone}</div>}
                                                <Badge bg={c.currentBalance > 0 ? "warning" : "success"} text="dark" className="fw-normal">
                                                    Balance: Rs {c.currentBalance.toLocaleString()}
                                                </Badge>
                                            </Card>
                                        </Col>
                                    ))}
                                    {customers.length === 0 && (
                                        <div className="text-center text-muted py-5">
                                            No customers found. Make sales to customers to see them here.
                                        </div>
                                    )}
                                </Row>
                            )}

                            {selectedCustomer && customerData && (
                                <div>
                                    <Row className="g-3 mb-4">
                                        <Col md={4}>
                                            <Card className="border-0 shadow-sm h-100 bg-primary text-white">
                                                <Card.Body>
                                                    <small className="opacity-75">Total Purchased</small>
                                                    <h3 className="fw-bold mb-0">Rs {selectedCustomer.totalPurchased.toLocaleString()}</h3>
                                                </Card.Body>
                                            </Card>
                                        </Col>
                                        <Col md={4}>
                                            <Card className="border-0 shadow-sm h-100 bg-success text-white">
                                                <Card.Body>
                                                    <small className="opacity-75">Total Paid</small>
                                                    <h3 className="fw-bold mb-0">Rs {selectedCustomer.totalPaid.toLocaleString()}</h3>
                                                </Card.Body>
                                            </Card>
                                        </Col>
                                        <Col md={4}>
                                            <Card className="border-0 shadow-sm h-100">
                                                <Card.Body>
                                                    <small className="text-muted">Current Pending Balance</small>
                                                    <h3 className={`fw-bold mb-0 ${selectedCustomer.currentBalance > 0 ? 'text-danger' : 'text-success'}`}>
                                                        Rs {selectedCustomer.currentBalance.toLocaleString()}
                                                    </h3>
                                                </Card.Body>
                                            </Card>
                                        </Col>
                                    </Row>

                                    <Card className="border-0 shadow-sm">
                                        <Card.Header className="bg-white border-bottom py-3">
                                            <h5 className="mb-0 fw-bold">Transaction History</h5>
                                        </Card.Header>
                                        <Table hover responsive className="mb-0">
                                            <thead className="bg-light">
                                                <tr>
                                                    <th className="border-0 text-muted small text-uppercase py-3 ps-4">Date</th>
                                                    <th className="border-0 text-muted small text-uppercase py-3">Type</th>
                                                    <th className="border-0 text-muted small text-uppercase py-3">Description</th>
                                                    <th className="border-0 text-muted small text-uppercase py-3 text-end pe-4">Amount</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {customerData.ledger.map((item) => (
                                                    <tr key={item._id}>
                                                        <td className="py-3 ps-4">
                                                            {new Date(item.date).toLocaleDateString()} <span className="text-muted small">{new Date(item.date).toLocaleTimeString()}</span>
                                                        </td>
                                                        <td className="py-3">
                                                            <Badge bg={item.type === 'sale' ? 'primary' : 'success'} text="light" className="fw-normal">
                                                                {item.type.toUpperCase()}
                                                            </Badge>
                                                        </td>
                                                        <td className="py-3">
                                                            <div className="fw-medium">{item.description}</div>
                                                            {item.notes && <small className="text-muted">{item.notes}</small>}
                                                        </td>
                                                        <td className={`py-3 text-end pe-4 fw-bold ${item.isDebit ? 'text-danger' : 'text-success'}`}>
                                                            {item.isDebit ? '+' : '-'} Rs {Math.abs(item.amount).toLocaleString()}
                                                        </td>
                                                    </tr>
                                                ))}
                                                {customerData.ledger.length === 0 && (
                                                    <tr>
                                                        <td colSpan="4" className="text-center py-4 text-muted">No transactions found.</td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </Table>
                                    </Card>
                                </div>
                            )}
                        </>
                    )}

                    {/* PAYMENT LEDGER VIEW */}
                    {activeTab === 'payment_ledger' && (
                        <>
                            {!selectedMethod && (
                                <Row className="g-4">
                                    {paymentMethods.map((m) => (
                                        <Col md={3} key={m._id}>
                                            <Card
                                                className="h-100 border-0 shadow-sm cursor-pointer hover-card-scale text-center p-4 bg-white"
                                                onClick={() => handleMethodClick(m)}
                                            >
                                                <div className="mb-3 text-info">
                                                    <FaMoneyBillWave size={40} />
                                                </div>
                                                <h5 className="fw-bold text-dark mb-1">{m.name}</h5>
                                                {m.accountNumber && (
                                                    <div className="mb-2">
                                                        <Badge bg="light" text="secondary" className="border fw-normal">
                                                            Acc: {m.accountNumber}
                                                        </Badge>
                                                    </div>
                                                )}
                                                <div className="text-muted small mb-2">{m.type}</div>
                                                <Badge bg="info" text="dark" className="fw-normal">
                                                    Balance: Rs {m.currentBalance.toLocaleString()}
                                                </Badge>
                                            </Card>
                                        </Col>
                                    ))}
                                    {paymentMethods.length === 0 && (
                                        <div className="text-center text-muted py-5">
                                            No payment methods found.
                                        </div>
                                    )}
                                </Row>
                            )}

                            {selectedMethod && methodData && (
                                <div>
                                    <Row className="g-3 mb-4">
                                        <Col md={12}>
                                            <Card className="border-0 shadow-sm h-100 bg-info bg-opacity-10">
                                                <Card.Body className="d-flex align-items-center justify-content-between">
                                                    <div>
                                                        <small className="text-muted">Current Balance in {selectedMethod.name}</small>
                                                        {selectedMethod.accountNumber && (
                                                            <div className="text-muted mb-2">
                                                                <span className="fw-bold">Acc #: {selectedMethod.accountNumber}</span>
                                                            </div>
                                                        )}
                                                        <h3 className="fw-bold mb-0 text-dark">Rs {selectedMethod.currentBalance.toLocaleString()}</h3>
                                                    </div>
                                                    <FaMoneyBillWave size={40} className="text-info opacity-50" />
                                                </Card.Body>
                                            </Card>
                                        </Col>
                                    </Row>

                                    <Card className="border-0 shadow-sm">
                                        <Card.Header className="bg-white border-bottom py-3">
                                            <h5 className="mb-0 fw-bold">Transaction History</h5>
                                        </Card.Header>
                                        <Table hover responsive className="mb-0">
                                            <thead className="bg-light">
                                                <tr>
                                                    <th className="border-0 text-muted small text-uppercase py-3 ps-4">Date</th>
                                                    <th className="border-0 text-muted small text-uppercase py-3">Type</th>
                                                    <th className="border-0 text-muted small text-uppercase py-3">Description</th>
                                                    <th className="border-0 text-muted small text-uppercase py-3 text-end pe-4">Amount</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {methodData.payments.map((item) => (
                                                    <tr key={item._id}>
                                                        <td className="py-3 ps-4">
                                                            {new Date(item.date).toLocaleDateString()} <span className="text-muted small">{new Date(item.date).toLocaleTimeString()}</span>
                                                        </td>
                                                        <td className="py-3">
                                                            <Badge bg={item.type === 'receive_customer' ? 'success' : 'danger'} text="light" className="fw-normal">
                                                                {item.type === 'receive_customer' ? 'RECEIVED' : 'PAID'}
                                                            </Badge>
                                                        </td>
                                                        <td className="py-3">
                                                            <div className="fw-medium">{item.description}</div>
                                                            {item.customer && <small className="text-muted d-block">From: {item.customer.name}</small>}
                                                            {item.supplierName && <small className="text-muted d-block">To: {item.supplierName}</small>}
                                                        </td>
                                                        <td className={`py-3 text-end pe-4 fw-bold ${item.type === 'pay_supplier' ? 'text-danger' : 'text-success'}`}>
                                                            {item.type === 'pay_supplier' ? '-' : '+'} Rs {Math.abs(item.amount).toLocaleString()}
                                                        </td>
                                                    </tr>
                                                ))}
                                                {methodData.payments.length === 0 && (
                                                    <tr>
                                                        <td colSpan="4" className="text-center py-4 text-muted">No transactions found.</td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </Table>
                                    </Card>
                                </div>
                            )}
                        </>
                    )}
                    {activeTab === 'ledger' && (
                        <>
                            {ledgerView === 'suppliers' && (
                                <Row className="g-4">
                                    {suppliers.map((supplier, idx) => (
                                        <Col md={3} key={idx}>
                                            <Card
                                                className="h-100 border-0 shadow-sm cursor-pointer hover-card-scale text-center p-4"
                                                onClick={() => handleSupplierClick(supplier)}
                                            >
                                                <div className="mb-3 text-primary">
                                                    <FaIndustry size={40} />
                                                </div>
                                                <h5 className="fw-bold text-dark">{supplier}</h5>
                                                <div className="text-muted small">Click to view ledger</div>
                                            </Card>
                                        </Col>
                                    ))}
                                    {suppliers.length === 0 && (
                                        <div className="text-center text-muted py-5">
                                            No suppliers found. Add suppliers when creating products or restocking.
                                        </div>
                                    )}
                                </Row>
                            )}

                            {ledgerView === 'detail' && supplierData && (
                                <div>
                                    <Row className="g-3 mb-4">
                                        <Col md={4}>
                                            <Card className="border-0 shadow-sm h-100 bg-primary text-white">
                                                <Card.Body>
                                                    <small className="opacity-75">Total Purchased (Stock)</small>
                                                    <h3 className="fw-bold mb-0">Rs {supplierData.stats.totalPurchased.toLocaleString()}</h3>
                                                </Card.Body>
                                            </Card>
                                        </Col>
                                        <Col md={4}>
                                            <Card className="border-0 shadow-sm h-100 bg-success text-white">
                                                <Card.Body>
                                                    <small className="opacity-75">Total Returned (Refunds)</small>
                                                    <h3 className="fw-bold mb-0">Rs {supplierData.stats.totalReturned.toLocaleString()}</h3>
                                                </Card.Body>
                                            </Card>
                                        </Col>
                                        <Col md={4}>
                                            <Card className="border-0 shadow-sm h-100">
                                                <Card.Body>
                                                    <small className="text-muted">Current Balance (Pending)</small>
                                                    <h3 className={`fw-bold mb-0 ${supplierData.stats.currentBalance > 0 ? 'text-danger' : 'text-success'}`}>Rs {supplierData.stats.currentBalance.toLocaleString()}</h3>
                                                </Card.Body>
                                            </Card>
                                        </Col>
                                    </Row>

                                    <Card className="border-0 shadow-sm">
                                        <Card.Header className="bg-white border-bottom py-3">
                                            <h5 className="mb-0 fw-bold">Transaction History</h5>
                                        </Card.Header>
                                        <Table hover responsive className="mb-0">
                                            <thead className="bg-light">
                                                <tr>
                                                    <th className="border-0 text-muted small text-uppercase py-3 ps-4">Date</th>
                                                    <th className="border-0 text-muted small text-uppercase py-3">Type</th>
                                                    <th className="border-0 text-muted small text-uppercase py-3">Description</th>
                                                    <th className="border-0 text-muted small text-uppercase py-3 text-end pe-4">Amount</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {supplierData.ledger.map((item) => (
                                                    <tr key={item._id}>
                                                        <td className="py-3 ps-4">
                                                            {new Date(item.date).toLocaleDateString()} <span className="text-muted small">{new Date(item.date).toLocaleTimeString()}</span>
                                                        </td>
                                                        <td className="py-3">
                                                            <Badge bg={item.type === 'purchase' ? 'warning' : 'success'} text="dark" className="bg-opacity-25 fw-normal">
                                                                {item.type.toUpperCase()}
                                                            </Badge>
                                                        </td>
                                                        <td className="py-3">
                                                            <div className="fw-medium">{item.description}</div>
                                                            {item.notes && <small className="text-muted">{item.notes}</small>}
                                                        </td>
                                                        <td className={`py-3 text-end pe-4 fw-bold ${item.type === 'purchase' ? 'text-danger' : 'text-success'}`}>
                                                            {item.type === 'purchase' ? '-' : '+'} Rs {item.amount.toLocaleString()}
                                                        </td>
                                                    </tr>
                                                ))}
                                                {supplierData.ledger.length === 0 && (
                                                    <tr>
                                                        <td colSpan="4" className="text-center py-4 text-muted">No transactions found.</td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </Table>
                                    </Card>
                                </div>
                            )}
                        </>
                    )}
                </>
            )}
        </div>
    )
}


export default Logs
