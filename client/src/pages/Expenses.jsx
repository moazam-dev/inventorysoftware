import React, { useEffect, useState } from 'react'
import { Button, Row, Col, Table, Card, Spinner } from 'react-bootstrap'
import { FaPlus, FaMoneyBillWave } from 'react-icons/fa'
import axios from 'axios'
import { toast } from 'react-toastify'
import ExpenseForm from '../components/expenses/ExpenseForm'

const Expenses = () => {
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);

    // We might need to add an endpoint to fetch all expenses if not exists
    // Currently dashboard just returns summary. 
    // I need to check if there is an expense controller method to get all expenses.
    // Checking logRoutes it seems only Logs.
    // I might need to create an endpoint for fetching expenses list. 
    // Wait, step 70 showed Expense model, but no Expense Controller file was shown in the initial list_dir of controllers (Step 16)
    // Step 16 showed: dashboardController, logController, productController, transactionController.
    // There is no expenseController! I missed that.
    // I will need to create expenseController and routes to fetch expenses.
    // For now I will write this frontend assuming the endpoint exists, and then I'll go fix the backend.

    const API_URL = 'http://localhost:5000/api';

    const fetchExpenses = async () => {
        try {
            setLoading(true);
            // I will create this endpoint: GET /api/expenses
            const res = await axios.get(`${API_URL}/expenses`);
            if (res.data.success) {
                setExpenses(res.data.data);
            }
        } catch (error) {
            console.error('Error fetching expenses:', error);
            // toast.error('Failed to load expenses'); // Suppress for now until endpoint exists
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchExpenses();
    }, []);

    const handleAddExpense = async (data) => {
        try {
            await axios.post(`${API_URL}/expenses`, data);
            toast.success('Expense added successfully');
            setShowForm(false);
            fetchExpenses();
        } catch (error) {
            console.error('Error adding expense:', error);
            toast.error('Failed to add expense');
        }
    };

    return (
        <div className="container-fluid p-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="fw-bold">Expenses</h2>
                    <p className="text-muted">Track your business expenses</p>
                </div>
                <Button variant="danger" onClick={() => setShowForm(true)}>
                    <FaPlus className="me-2" /> Add Expense
                </Button>
            </div>

            <Row>
                <Col md={12}>
                    <Card className="shadow-sm border-0">
                        <Card.Body className="p-0">
                            {loading ? (
                                <div className="text-center py-5">
                                    <Spinner animation="border" variant="primary" />
                                </div>
                            ) : (
                                <Table hover responsive className="mb-0 align-middle">
                                    <thead className="bg-light">
                                        <tr>
                                            <th className="ps-4 py-3">Date</th>
                                            <th className="py-3">Title</th>
                                            <th className="py-3">Category</th>
                                            <th className="py-3 text-end pe-4">Amount</th>
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
                                                        <span className={`badge ${expense.category === 'Stock Purchase' ? 'bg-info' : 'bg-warning'} text-dark`}>
                                                            {expense.category}
                                                        </span>
                                                    </td>
                                                    <td className="text-end pe-4 fw-bold text-danger">
                                                        -{new Intl.NumberFormat('en-PK', { style: 'currency', currency: 'PKR' }).format(expense.amount)}
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="4" className="text-center py-5 text-muted">
                                                    No expenses recorded yet.
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

            <ExpenseForm
                show={showForm}
                onHide={() => setShowForm(false)}
                onSubmit={handleAddExpense}
            />
        </div>
    )
}

export default Expenses
