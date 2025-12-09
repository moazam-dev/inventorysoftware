import React from 'react'
import { Modal, Button, Table } from 'react-bootstrap'
import { FaPrint } from 'react-icons/fa'

const InvoicePreview = ({ show, onHide, invoiceData }) => {
    if (!invoiceData) return null;

    const handlePrint = () => {
        window.print();
    };

    return (
        <Modal show={show} onHide={onHide} size="lg" centered>
            <Modal.Header closeButton className="no-print">
                <Modal.Title>Invoice Generated</Modal.Title>
            </Modal.Header>
            <Modal.Body className="p-4 printable-invoice" id="invoice-print-area">
                <div className="text-center mb-4">
                    <h3 className="fw-bold">Elegance Boutique</h3>
                    <p className="text-muted mb-0">Women's Clothing & Accessories</p>
                    <small>Shop #123, Fashion Market, Lahore | 0300-1234567</small>
                </div>

                <div className="d-flex justify-content-between mb-4">
                    <div>
                        <h6 className="fw-bold">Bill To:</h6>
                        <div>{invoiceData.partyName || 'Walk-in Customer'}</div>
                        <div>{invoiceData.partyPhone || '-'}</div>
                    </div>
                    <div className="text-end">
                        <h6 className="fw-bold">Invoice Details:</h6>
                        <div>Date: {new Date(invoiceData.date).toLocaleDateString()}</div>
                        <div>ID: {invoiceData._id.slice(-6).toUpperCase()}</div>
                    </div>
                </div>

                <Table bordered className="mb-4">
                    <thead className="bg-light">
                        <tr>
                            <th>Item</th>
                            <th className="text-center">Qty</th>
                            <th className="text-end">Price</th>
                            <th className="text-end">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {invoiceData.items.map((item, index) => (
                            <tr key={index}>
                                <td>{item.productName}</td>
                                <td className="text-center">{item.quantity}</td>
                                <td className="text-end">{item.price}</td>
                                <td className="text-end">{(item.price * item.quantity).toLocaleString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </Table>

                <div className="d-flex justify-content-end">
                    <div style={{ width: '250px' }}>
                        <div className="d-flex justify-content-between mb-2">
                            <span>Subtotal:</span>
                            <span>Rs {(invoiceData.totalAmount + invoiceData.discount).toLocaleString()}</span>
                        </div>
                        <div className="d-flex justify-content-between mb-2 text-danger">
                            <span>Discount:</span>
                            <span>- Rs {invoiceData.discount.toLocaleString()}</span>
                        </div>
                        <div className="d-flex justify-content-between fw-bold border-top pt-2">
                            <span>Total:</span>
                            <span>Rs {invoiceData.totalAmount.toLocaleString()}</span>
                        </div>
                        {/* Show Previous Balance & Net Pending if available */}
                        {invoiceData.previousBalance !== undefined && invoiceData.previousBalance > 0 && (
                            <div className="d-flex justify-content-between mb-1 text-muted">
                                <span>Previous Balance:</span>
                                <span>Rs {invoiceData.previousBalance.toLocaleString()}</span>
                            </div>
                        )}

                        {/* Show Payment Details if Partial/Pending */}
                        {invoiceData.paidAmount !== undefined && (
                            <>
                                <div className="d-flex justify-content-between mb-1 mt-2 text-success">
                                    <span>Paid:</span>
                                    <span>Rs {invoiceData.paidAmount.toLocaleString()}</span>
                                </div>

                                {/* Current Tx Pending */}
                                {/* <div className="d-flex justify-content-between mb-2 text-danger fw-bold">
                                    <span>Pending:</span>
                                    <span>Rs {(invoiceData.totalAmount - invoiceData.paidAmount).toLocaleString()}</span>
                                </div> */}

                                {/* TOTAL NET PENDING (Previous + Current Pending) */}
                                <div className="d-flex justify-content-between mb-2 text-danger fw-bold border-top pt-1 mt-1">
                                    <span>Total Pending:</span>
                                    <span>Rs {((invoiceData.totalAmount - invoiceData.paidAmount) + (invoiceData.previousBalance || 0)).toLocaleString()}</span>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                <div className="text-center mt-5 text-muted small">
                    <p>Thank you for shopping with us!</p>
                    <p>No returns without receipt. Exchange within 7 days.</p>
                </div>
            </Modal.Body>
            <Modal.Footer className="no-print">
                <Button variant="secondary" onClick={onHide}>Close</Button>
                <Button variant="primary" onClick={handlePrint}>
                    <FaPrint className="me-2" /> Print Invoice
                </Button>
            </Modal.Footer>
        </Modal>
    )
}

export default InvoicePreview
