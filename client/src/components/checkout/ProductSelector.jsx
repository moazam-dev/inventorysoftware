import React, { useState, useEffect } from 'react'
import { Form, ListGroup, Badge, InputGroup, Spinner } from 'react-bootstrap'
import { FaSearch, FaPlus } from 'react-icons/fa'
import axios from 'axios'

const ProductSelector = ({ onAddToCart, refreshTrigger }) => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [category, setCategory] = useState('');
    const [categories, setCategories] = useState([]);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await axios.get('http://localhost:5000/api/products/categories');
                if (res.data.success) setCategories(res.data.data);
            } catch (err) {
                console.error(err);
            }
        };
        fetchCategories();
    }, []);

    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            try {
                const res = await axios.get(`http://localhost:5000/api/products?search=${searchTerm}&category=${category}&limit=50`);
                if (res.data.success) setProducts(res.data.data.products);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        const debounce = setTimeout(fetchProducts, 300);
        return () => clearTimeout(debounce);
    }, [searchTerm, category, refreshTrigger]); // Add refreshTrigger dependency

    return (
        <div className="bg-white p-3 rounded shadow-sm h-100">
            <h5 className="mb-3 fw-bold"><FaSearch className="me-2" /> Select Products</h5>

            <div className="d-flex gap-2 mb-3">
                <InputGroup>
                    <InputGroup.Text className="bg-light"><FaSearch /></InputGroup.Text>
                    <Form.Control
                        placeholder="Search products..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </InputGroup>
                <Form.Select style={{ width: '150px' }} value={category} onChange={(e) => setCategory(e.target.value)}>
                    <option value="">All Categories</option>
                    {categories.map(cat => (
                        <option key={cat._id} value={cat.name}>{cat.name}</option>
                    ))}
                </Form.Select>
            </div>

            <div style={{ maxHeight: 'calc(100vh - 200px)', overflowY: 'auto', paddingRight: '5px' }}>
                {loading ? (
                    <div className="text-center py-5"><Spinner animation="border" variant="primary" /></div>
                ) : (
                    <div className="row g-3">
                        {products.map(product => {
                            const isOutOfStock = product.quantity <= 0;
                            return (
                                <div className="col-md-6 col-lg-4" key={product._id}>
                                    <div
                                        className={`card h-100 border-0 shadow-sm ${!isOutOfStock ? 'cursor-pointer hover-card-scale' : 'opacity-50'}`}
                                        onClick={() => !isOutOfStock && onAddToCart(product)}
                                        style={{ cursor: isOutOfStock ? 'not-allowed' : 'pointer', transition: 'all 0.2s' }}
                                    >
                                        <div className="card-body p-3">
                                            <div className="d-flex justify-content-between align-items-start mb-2">
                                                <h6 className="card-title fw-bold mb-0 text-truncate" title={product.name}>{product.name}</h6>
                                                <div className="fw-bold text-primary">Rs {product.salePrice.toLocaleString()}</div>
                                            </div>
                                            <div className="mb-2">
                                                <Badge bg="light" text="dark" className="border fw-normal">{product.category}</Badge>
                                            </div>
                                            <div className={`small ${isOutOfStock ? 'text-danger fw-bold' : 'text-muted'}`}>
                                                {isOutOfStock ? 'Out of Stock' : `${product.quantity} in stock`}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                        {products.length === 0 && (
                            <div className="col-12 text-center text-muted py-5">
                                No products found matching your search.
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}

export default ProductSelector
