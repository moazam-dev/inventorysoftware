import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Spinner } from 'react-bootstrap';
import axios from 'axios';
import { toast } from 'react-toastify';

const RestockModal = ({ show, onHide, onStockAdded }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [quantity, setQuantity] = useState('');
    const [costPrice, setCostPrice] = useState('');
    const [supplier, setSupplier] = useState('');
    const [loading, setLoading] = useState(false);
    const [searching, setSearching] = useState(false);

    // Payment State
    const [paymentMethods, setPaymentMethods] = useState([]);
    const [paidAmount, setPaidAmount] = useState('');
    const [selectedMethod, setSelectedMethod] = useState('');

    const API_URL = 'http://localhost:5000/api';

    useEffect(() => {
        fetchPaymentMethods();
    }, []);

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

    const fetchPaymentMethods = async () => {
        try {
            const res = await axios.get(`${API_URL}/payment-methods`);
            if (res.data.success) {
                setPaymentMethods(res.data.data);
                // Default to 'cash' if available
                const cash = res.data.data.find(m => m.type === 'cash');
                if (cash) setSelectedMethod(cash._id);
            }
        } catch (err) {
            console.error(err);
        }
    };

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
        setCostPrice(product.costPrice); // Pre-fill current cost price
        setSupplier(product.supplier || ''); // Pre-fill supplier if exists
        setPaidAmount(''); // Reset paid amount
    };

    const handleClearSelection = () => {
        setSelectedProduct(null);
        setSearchTerm('');
        setSearchResults([]);
        setQuantity('');
        // setCostPrice(''); // Keep cost price? No, clear it.
        // setSupplier('');
        setPaidAmount('');
        setSelectedMethod('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedProduct || !quantity) return;

        try {
            setLoading(true);

            // New Purchase API
            const payload = {
                product: selectedProduct._id,
                quantity: Number(quantity),
                costPrice: Number(costPrice),
                supplier: supplier,
                paidAmount: Number(paidAmount),
                paymentMethod: selectedMethod || undefined,
                notes: `Restock via Inventory`
            };

            await axios.post(`${API_URL}/transactions/purchase`, payload);

            toast.success(`Restocked ${selectedProduct.name} successfully`);
            onStockAdded();
            onHide();
            handleClearSelection();
        } catch (error) {
            console.error(error);
            toast.error('Failed to restock product');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal show={show} onHide={onHide} centered>
            <Modal.Header closeButton>
                <Modal.Title>Add New Stock (Restock)</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-3">
                        <Form.Label>Search Product</Form.Label>
                        <div className="position-relative">
                            <Form.Control
                                type="text"
                                placeholder="Type product name..."
                                value={searchTerm}
                                onChange={(e) => {
                                    setSearchTerm(e.target.value);
                                    if (selectedProduct) setSelectedProduct(null); // Reset selection if typing
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
                                            <small className="text-muted">Current Stock: {p.quantity} | SKU: {p.sku}</small>
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
                                <Form.Label>Quantity to Add</Form.Label>
                                <Form.Control
                                    type="number"
                                    min="1"
                                    value={quantity}
                                    onChange={(e) => setQuantity(e.target.value)}
                                    required
                                />
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Label>Cost Price (Per Unit)</Form.Label>
                                <Form.Control
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={costPrice}
                                    onChange={(e) => setCostPrice(e.target.value)}
                                    required
                                />
                                <Form.Text className="text-muted">
                                    Updating this will change the product's cost price for future calculations.
                                </Form.Text>
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Label>Supplier Name (Optional)</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={supplier}
                                    onChange={(e) => setSupplier(e.target.value)}
                                    placeholder="Enter supplier name for ledger tracking"
                                />
                            </Form.Group>

                            <div className="alert alert-info">
                                Total Cost: <strong>Rs. {((parseFloat(quantity) || 0) * (parseFloat(costPrice) || 0)).toFixed(2)}</strong>
                            </div>

                            <hr />
                            <h6 className="fw-bold">Payment Details</h6>

                            <Form.Group className="mb-3">
                                <Form.Label>Payment Method</Form.Label>
                                <Form.Select
                                    value={selectedMethod}
                                    onChange={(e) => setSelectedMethod(e.target.value)}
                                >
                                    <option value="">-- Pay Later / None --</option>
                                    {paymentMethods.map(m => (
                                        <option key={m._id} value={m._id}>{m.name} ({m.type})</option>
                                    ))}
                                </Form.Select>
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Label>Amount Paid Now</Form.Label>
                                <Form.Control
                                    type="number"
                                    min="0"
                                    value={paidAmount}
                                    onChange={(e) => setPaidAmount(e.target.value)}
                                    placeholder="Enter amount paid"
                                />
                                <Form.Text className="text-muted">
                                    Leave empty or 0 if paying later.
                                    {((parseFloat(quantity) || 0) * (parseFloat(costPrice) || 0)) - (parseFloat(paidAmount) || 0) > 0 && (
                                        <span className="text-danger ms-2">
                                            (Balance Pending: Rs {(((parseFloat(quantity) || 0) * (parseFloat(costPrice) || 0)) - (parseFloat(paidAmount) || 0)).toLocaleString()})
                                        </span>
                                    )}
                                </Form.Text>
                            </Form.Group>
                        </>
                    )}

                    <div className="d-flex justify-content-end gap-2">
                        <Button variant="secondary" onClick={onHide}>Cancel</Button>
                        <Button variant="success" type="submit" disabled={!selectedProduct || loading}>
                            {loading ? <Spinner size="sm" animation="border" /> : 'Confirm Restock'}
                        </Button>
                    </div>
                </Form>
            </Modal.Body>
        </Modal>
    );
};

export default RestockModal;
