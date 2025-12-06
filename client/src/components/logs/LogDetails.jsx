import React from 'react'
import { Modal, Table, Badge } from 'react-bootstrap'

const LogDetails = ({ show, onHide, log }) => {
    if (!log) return null;

    return (
        <Modal show={show} onHide={onHide} size="lg" centered>
            <Modal.Header closeButton>
                <Modal.Title>Log Details: {log.date}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <div className="d-flex justify-content-between mb-4 bg-light p-3 rounded">
                    <div className="text-center">
                        <small className="text-muted d-block">Revenue</small>
                        <span className="fw-bold text-success">Rs {log.totalRevenue.toLocaleString()}</span>
                    </div>
                    <div className="text-center">
                        <small className="text-muted d-block">Expenses</small>
                        <span className="fw-bold text-danger">Rs {log.totalExpenses.toLocaleString()}</span>
                    </div>
                    <div className="text-center">
                        <small className="text-muted d-block">Profit</small>
                        <span className="fw-bold text-primary">Rs {log.totalProfit.toLocaleString()}</span>
                    </div>
                </div>

                <h6 className="mb-3">Transactions</h6>
                <div className="table-responsive">
                    <Table size="sm" hover>
                        <thead>
                            <tr>
                                <th>Time</th>
                                <th>Type</th>
                                <th>Party</th>
                                <th>Items</th>
                                <th className="text-end">Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {log.transactions.map(txn => (
                                <tr key={txn._id}>
                                    <td>{new Date(txn.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                                    <td>
                                        <Badge bg={txn.type === 'sale' ? 'success' : txn.type === 'purchase' ? 'info' : 'warning'}>
                                            {txn.type.replace(/_/g, ' ')}
                                        </Badge>
                                    </td>
                                    <td>{txn.partyName}</td>
                                    <td>
                                        {txn.items.map((item, i) => (
                                            <div key={i} className="small">
                                                {item.quantity} x {item.productName}
                                            </div>
                                        ))}
                                    </td>
                                    <td className="text-end">Rs {txn.totalAmount.toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </div>
            </Modal.Body>
        </Modal>
    )
}

export default LogDetails
