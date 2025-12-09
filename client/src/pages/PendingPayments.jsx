import React, { useState, useEffect } from 'react'
import { Card, Tabs, Tab, Table, Button, Spinner, Badge } from 'react-bootstrap'
import axios from 'axios'
import { FaPrint } from 'react-icons/fa'
import { toast } from 'react-toastify'

const PendingPayments = () => {
    const [key, setKey] = useState('receivable'); // receivable (Customers) | payable (Suppliers)
    const [customers, setCustomers] = useState([]);
    const [suppliers, setSuppliers] = useState([]);
    const [loading, setLoading] = useState(true);

    const API_URL = 'http://localhost:5000/api';

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [custRes, suppRes] = await Promise.all([
                axios.get(`${API_URL}/customers`),
                axios.get(`${API_URL}/ledger/suppliers/stats`)
            ]);

            if (custRes.data.success) {
                // Filter customers who have a balance (Positive means they owe us)
                // Or user wanted "list of all... with pending balance". 
                // Showing all is better, user can sort.
                setCustomers(custRes.data.data);
            }

            if (suppRes.data.success) {
                setSuppliers(suppRes.data.data);
            }

        } catch (error) {
            console.error(error);
            toast.error('Failed to fetch report data');
        } finally {
            setLoading(false);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    const renderTable = (data, type) => {
        const isCustomer = type === 'customer';
        // Filter rows if needed? User asked for "list of all". 
        // Let's show all, but maybe highlight those with balance.

        return (
            <div className="table-responsive">
                <Table bordered hover striped className="align-middle">
                    <thead className="bg-light">
                        <tr>
                            <th>Name</th>
                            {isCustomer && <th>Phone</th>}
                            <th className="text-end">Total Purchased</th>
                            <th className="text-end">Total Paid</th>
                            {/* <th className="text-end">Returned</th> */}
                            <th className="text-end">Pending Balance</th>
                            <th className="text-center">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((item, index) => {
                            const balance = item.currentBalance;
                            const isZero = Math.abs(balance) < 1;

                            return (
                                <tr key={index}>
                                    <td className="fw-medium">{item.name}</td>
                                    {isCustomer && <td>{item.phone || '-'}</td>}
                                    <td className="text-end">{item.totalPurchased?.toLocaleString()}</td>
                                    <td className="text-end">{item.totalPaid?.toLocaleString()}</td>
                                    {/* <td className="text-end">{item.totalReturned?.toLocaleString()}</td> */}
                                    <td className={`text-end fw-bold ${balance > 0 ? 'text-danger' : 'text-success'}`}>
                                        {balance?.toLocaleString()}
                                    </td>
                                    <td className="text-center">
                                        {isZero ? (
                                            <Badge bg="success">Settled</Badge>
                                        ) : (
                                            <Badge bg="warning" text="dark">Pending</Badge>
                                        )}
                                    </td>
                                </tr>
                            )
                        })}
                        {data.length === 0 && (
                            <tr>
                                <td colSpan={6} className="text-center py-4 text-muted">No records found</td>
                            </tr>
                        )}
                    </tbody>
                </Table>
            </div>
        );
    };

    if (loading) return <div className="text-center py-5"><Spinner animation="border" /></div>;

    return (
        <div className="container-fluid p-4">
            <div className="d-flex justify-content-between align-items-center mb-4 no-print">
                <h2 className="fw-bold">Pending Payments Report</h2>
                <Button onClick={handlePrint} variant="primary">
                    <FaPrint className="me-2" /> Print List
                </Button>
            </div>

            {/* Print Header */}
            <div className="d-none d-print-block mb-4 text-center">
                <h3>{key === 'receivable' ? 'Payments to be Received (Customers)' : 'Payments to be Paid (Suppliers)'}</h3>
                <p className="text-muted">{new Date().toLocaleDateString()}</p>
            </div>

            <Card className="shadow-sm border-0">
                <Card.Body>
                    <Tabs
                        activeKey={key}
                        onSelect={(k) => setKey(k)}
                        className="mb-3 no-print"
                    >
                        <Tab eventKey="receivable" title="Payments to be Received (Customers)">
                            {renderTable(customers, 'customer')}
                        </Tab>
                        <Tab eventKey="payable" title="Payments to be Paid (Suppliers)">
                            {renderTable(suppliers, 'supplier')}
                        </Tab>
                    </Tabs>

                    {/* For Print: Show ONLY the active tab content is handled by CSS usually, 
                        Method: We can just render the active one. The print view will print what's in DOM.
                        The Tabs component usually hides non-active content. So only active tab prints.
                        This matches "print the whole list" for the selected category.
                        If user wants BOTH printed at once, they'd need to switch.
                        "similarly to the payment to be recieved" implies separate lists.
                    */}
                </Card.Body>
            </Card>
        </div>
    )
}

export default PendingPayments
