import React, { useEffect, useState } from 'react'
import { Button, Row, Col, Table, Card, Spinner, Modal, Nav, Badge } from 'react-bootstrap'
import { FaPlus, FaTrash } from 'react-icons/fa'
import axios from 'axios'
import { toast } from 'react-toastify'
import ExpenseForm from '../components/expenses/ExpenseForm'

const Expenses = () => {
    const [purchases, setPurchases] = useState([]);
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('purchases');

    const [showForm, setShowForm] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [expenseToDelete, setExpenseToDelete] = useState(null);

    const API_URL = 'http://localhost:5000/api';

    const fetchData = async () => {
        try {
            setLoading(true);
            const [transRes, expRes] = await Promise.all([
                axios.get(`${API_URL}/transactions?type=purchase`),
                axios.get(`${API_URL}/expenses`)
            ]);

            if (transRes.data.success) {
                // Filter purchases: Only show if paidAmount > 0 (as per user request: "if i bought something and didnt pay for should bot be added")
                // Also usually we want to see history, but strict cash basis request implies showing only what moved cash.
                // However, user said "should not be added in purchased section".
                const paidPurchases = transRes.data.data.filter(p => p.paidAmount > 0);
                setPurchases(paidPurchases);
            }

            if (expRes.data.success) {
                // Filter expenses: Exclude 'Stock Purchase' as they are now tracked in Purchases tab
                const otherExpenses = expRes.data.data.filter(e => e.category !== 'Stock Purchase');
                setExpenses(otherExpenses);
            }

        } catch (error) {
            console.error('Error fetching data:', error);
            // toast.error('Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleAddExpense = async (data) => {
        try {
            await axios.post(`${API_URL}/expenses`, data);
            toast.success('Expense added successfully');
            setShowForm(false);
            fetchData();
        } catch (error) {
            console.error('Error adding expense:', error);
            toast.error('Failed to add expense');
        }
    };

    const handleDeleteClick = (expense) => {
        setExpenseToDelete(expense);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        if (!expenseToDelete) return;
        try {
            await axios.delete(`${API_URL}/expenses/${expenseToDelete._id}`);
            toast.success('Expense deleted successfully');
            setShowDeleteModal(false);
            setExpenseToDelete(null);
            fetchData();
        } catch (error) {
            console.error('Error deleting expense:', error);
            toast.error('Failed to delete expense');
        }
    };

    // Calculate Totals
    const totalPurchasesPaid = purchases.reduce((sum, item) => sum + (item.paidAmount || 0), 0);
    const totalOtherExpenses = expenses.reduce((sum, item) => sum + (item.amount || 0), 0);
    const combinedTotal = totalPurchasesPaid + totalOtherExpenses;

    return (
        <div className="container-fluid p-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="fw-bold">Expenses & Purchases</h2>
                    <p className="text-muted">Track all business outflows (Cash Basis)</p>
                </div>
                <div className="text-end">
                    <h4 className="fw-bold text-danger mb-0">
                        Total: {new Intl.NumberFormat('en-PK', { style: 'currency', currency: 'PKR' }).format(combinedTotal)}
                    </h4>
                    <small className="text-muted">Combined Expenses</small>
                </div>
            </div>

            <div className="mb-4 d-flex justify-content-between">
                <Nav variant="pills" className="bg-light d-inline-flex p-1 rounded" activeKey={activeTab}>
                    <Nav.Item>
                        <Nav.Link
                            eventKey="purchases"
                            onClick={() => setActiveTab('purchases')}
                            className={activeTab === 'purchases' ? 'bg-white shadow-sm text-dark fw-bold' : 'text-muted'}
                        >
                            Stock Purchases
                        </Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                        <Nav.Link
                            eventKey="expenses"
                            onClick={() => setActiveTab('expenses')}
                            className={activeTab === 'expenses' ? 'bg-white shadow-sm text-dark fw-bold' : 'text-muted'}
                        >
                            Operating Expenses
                        </Nav.Link>
                    </Nav.Item>
                </Nav>
                {activeTab === 'expenses' && (
                    <Button variant="danger" onClick={() => setShowForm(true)}>
                        <FaPlus className="me-2" /> Add Expense
                    </Button>
                )}
            </div>

            {loading ? (
                <div className="text-center py-5">
                    <Spinner animation="border" variant="primary" />
                </div>
            ) : (
                <Row>
                    <Col md={12}>
                        <Card className="shadow-sm border-0">
                            <Card.Body className="p-0">
                                {activeTab === 'purchases' ? (
                                    /* Purchases Table */
                                    <Table hover responsive className="mb-0 align-middle">
                                        <thead className="bg-light">
                                            <tr>
                                                <th className="ps-4 py-3">Date</th>
                                                <th className="py-3">Supplier</th>
                                                <th className="py-3">Items</th>
                                                <th className="py-3 text-end">Total Bill</th>
                                                <th className="py-3 text-end pe-4">Paid Amount</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {purchases.length > 0 ? (
                                                purchases.map(p => (
                                                    <tr key={p._id}>
                                                        <td className="ps-4 text-muted">
                                                            {new Date(p.date).toLocaleDateString()}
                                                        </td>
                                                        <td className="fw-medium">{p.partyName}</td>
                                                        <td>
                                                            <small className="text-muted">
                                                                {p.items?.length > 0
                                                                    ? `${p.items[0].productName} ${p.items.length > 1 ? `+ ${p.items.length - 1} others` : ''}`
                                                                    : 'Unknown Items'}
                                                            </small>
                                                        </td>
                                                        <td className="text-end text-muted">
                                                            {p.totalAmount.toLocaleString()}
                                                        </td>
                                                        <td className="text-end pe-4">
                                                            <div className="fw-bold text-danger">
                                                                {p.paidAmount.toLocaleString()}
                                                            </div>
                                                            {(p.totalAmount - p.paidAmount) > 0 && (
                                                                <small className="text-warning fw-bold" style={{ fontSize: '0.75rem' }}>
                                                                    Pending: {(p.totalAmount - p.paidAmount).toLocaleString()}
                                                                </small>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan="5" className="text-center py-5 text-muted">No paid purchases found.</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </Table>
                                ) : (
                                    /* Expenses Table */
                                    <Table hover responsive className="mb-0 align-middle">
                                        <thead className="bg-light">
                                            <tr>
                                                <th className="ps-4 py-3">Date</th>
                                                <th className="py-3">Title</th>
                                                <th className="py-3">Category</th>
                                                <th className="py-3 text-end pe-4">Amount</th>
                                                <th className="py-3 text-center">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {expenses.length > 0 ? (
                                                expenses.map(expense => (
                                                    <tr key={expense._id}>
                                                        <td className="ps-4 text-muted">
                                                            {new Date(expense.date).toLocaleDateString()}
                                                        </td>
                                                        <td className="fw-medium">{expense.title}</td>
                                                        <td>
                                                            <Badge bg="warning" text="dark" className="fw-normal">
                                                                {expense.category}
                                                            </Badge>
                                                        </td>
                                                        <td className="text-end pe-4 fw-bold text-danger">
                                                            -{new Intl.NumberFormat('en-PK', { style: 'currency', currency: 'PKR' }).format(expense.amount)}
                                                        </td>
                                                        <td className="text-center">
                                                            <Button variant="outline-danger" size="sm" onClick={() => handleDeleteClick(expense)}>
                                                                <FaTrash />
                                                            </Button>
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan="5" className="text-center py-5 text-muted">
                                                        No other expenses recorded.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </Table>
                                )}
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            )}

            <ExpenseForm
                show={showForm}
                onHide={() => setShowForm(false)}
                onSubmit={handleAddExpense}
            />

            <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Confirm Delete</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    Are you sure you want to delete this expense? This action will adjust your financial logs.
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>Cancel</Button>
                    <Button variant="danger" onClick={confirmDelete}>Delete Expense</Button>
                </Modal.Footer>
            </Modal>
        </div>
    )
}

export default Expenses
