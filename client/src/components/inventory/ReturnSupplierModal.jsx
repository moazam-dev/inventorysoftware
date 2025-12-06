import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Spinner } from 'react-bootstrap';
import axios from 'axios';
import { toast } from 'react-toastify';

const ReturnSupplierModal = ({ show, onHide, onReturnComplete }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [quantity, setQuantity] = useState('');
    const [refundAmount, setRefundAmount] = useState('');
    const [loading, setLoading] = useState(false);
    const [searching, setSearching] = useState(false);
    const [supplierName, setSupplierName] = useState('');

    const API_URL = 'http://localhost:5000/api';

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            if (searchTerm.length > 1 && !selectedProduct) {
                searchProducts();
            } else if (searchTerm.length === 0) {
                setSearchResults([]);
            }
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm, selectedProduct]);

    const searchProducts = async () => {
        try {
            setSearching(true);
            const res = await axios.get(`${API_URL}/products?search=${searchTerm}&limit=5`);
            if (res.data.success) {
                setSearchResults(res.data.data.products);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setSearching(false);
        }
    };

    const handleSelectProduct = (product) => {
        setSelectedProduct(product);
        setSearchTerm(product.name);
        setSearchResults([]);
        setSupplierName(product.supplier || ''); // Auto-fill supplier
    };

    const handleClearSelection = () => {
        setSelectedProduct(null);
        setSearchTerm('');
        setSearchResults([]);
        setQuantity('');
        setRefundAmount('');
        setSupplierName('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedProduct || !quantity || !refundAmount) return;

        try {
            setLoading(true);
            await axios.post(`${API_URL}/transactions/return-to-supplier`, {
                product: selectedProduct._id,
                quantity: parseInt(quantity),
                refundAmount: parseFloat(refundAmount),
                notes: `Returned to ${supplierName}`
            });

            toast.success(`Returned ${selectedProduct.name} to supplier successfully`);
            onReturnComplete();
            onHide();
            handleClearSelection();
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || 'Failed to process return');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal show={show} onHide={onHide} centered>
            <Modal.Header closeButton>
                <Modal.Title>Return to Supplier</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-3">
                        <Form.Label>Search Product to Return</Form.Label>
                        <div className="position-relative">
                            <Form.Control
                                type="text"
                                placeholder="Type product name..."
                                value={searchTerm}
                                onChange={(e) => {
                                    setSearchTerm(e.target.value);
                                    if (selectedProduct) setSelectedProduct(null);
                                }}
                                disabled={!!selectedProduct}
                            />
                            {selectedProduct && (
                                <Button
                                    variant="link"
                                    className="position-absolute top-0 end-0 text-decoration-none"
                                    onClick={handleClearSelection}
                                >
                                    Change
                                </Button>
                            )}

                            {searchResults.length > 0 && !selectedProduct && (
                                <div className="position-absolute w-100 bg-white border rounded shadow-sm" style={{ zIndex: 1000, maxHeight: '200px', overflowY: 'auto' }}>
                                    {searchResults.map(p => (
                                        <div
                                            key={p._id}
                                            className="p-2 border-bottom cursor-pointer hover-bg-light"
                                            style={{ cursor: 'pointer' }}
                                            onClick={() => handleSelectProduct(p)}
                                        >
                                            <div className="fw-bold">{p.name}</div>
                                            <small className="text-muted">Current Stock: {p.quantity}</small>
                                        </div>
                                    ))}
                                </div>
                            )}
                            {searching && <div className="text-muted small mt-1">Searching...</div>}
                        </div>
                    </Form.Group>

                    {selectedProduct && (
                        <>
                            <Form.Group className="mb-3">
                                <Form.Label>Supplier Name</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={supplierName}
                                    readOnly
                                    className="bg-light"
                                />
                                <Form.Text className="text-muted">
                                    Auto-filled from product details.
                                </Form.Text>
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Label>Quantity to Return</Form.Label>
                                <Form.Control
                                    type="number"
                                    min="1"
                                    max={selectedProduct.quantity}
                                    value={quantity}
                                    onChange={(e) => setQuantity(e.target.value)}
                                    required
                                />
                                <Form.Text className="text-muted">
                                    Max available: {selectedProduct.quantity}
                                </Form.Text>
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Label>Total Refund Amount Received</Form.Label>
                                <Form.Control
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={refundAmount}
                                    onChange={(e) => setRefundAmount(e.target.value)}
                                    required
                                />
                            </Form.Group>
                        </>
                    )}

                    <div className="d-flex justify-content-end gap-2">
                        <Button variant="secondary" onClick={onHide}>Cancel</Button>
                        <Button variant="primary" type="submit" disabled={!selectedProduct || loading}>
                            {loading ? <Spinner size="sm" animation="border" /> : 'Confirm Return'}
                        </Button>
                    </div>
                </Form>
            </Modal.Body>
        </Modal>
    );
};

export default ReturnSupplierModal;
