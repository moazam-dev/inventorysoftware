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
                axios.get(`${API_URL}/payments?type=pay_supplier`),
                axios.get(`${API_URL}/expenses`)
            ]);

            if (transRes.data.success) {
                // Now accessing PAYMENTS, so no need to filter paidAmount > 0 (amount is always > 0 in Payment model)
                setPurchases(transRes.data.data);
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

    // Calculate Totals using Payment Amount
    const totalPurchasesPaid = purchases.reduce((sum, item) => sum + (item.amount || 0), 0);
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
                                                <th className="py-3">Items / Description</th>
                                                <th className="py-3 text-end">Bill Total</th>
                                                <th className="py-3 text-end pe-4">Paid Amount</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {purchases.length > 0 ? (
                                                purchases.map(p => {
                                                    // Helper to extract display info
                                                    // p is now a PAYMENT object
                                                    const tx = p.transactionRef;
                                                    const isPurchase = tx && tx.items;

                                                    let itemsDisplay = p.description;
                                                    if (isPurchase) {
                                                        itemsDisplay = tx.items.length > 0
                                                            ? `${tx.items[0].productName} ${tx.items.length > 1 ? `+ ${tx.items.length - 1} others` : ''}`
                                                            : 'Unknown Items';
                                                    }

                                                    return (
                                                        <tr key={p._id}>
                                                            <td className="ps-4 text-muted">
                                                                {new Date(p.date).toLocaleDateString()}
                                                            </td>
                                                            <td className="fw-medium">{p.supplierName}</td>
                                                            <td>
                                                                <small className="text-muted">
                                                                    {itemsDisplay}
                                                                </small>
                                                            </td>
                                                            <td className="text-end text-muted">
                                                                {tx ? tx.totalAmount.toLocaleString() : '-'}
                                                            </td>
                                                            <td className="text-end pe-4">
                                                                <div className="fw-bold text-danger">
                                                                    {p.amount.toLocaleString()}
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    );
                                                })
                                            ) : (
                                                <tr>
                                                    <td colSpan="5" className="text-center py-5 text-muted">No supplier payments found.</td>
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
