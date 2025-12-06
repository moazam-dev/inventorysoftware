import React, { useEffect, useState } from 'react'
import { Button, Row, Col, InputGroup, Form, Spinner, Nav, Card } from 'react-bootstrap'
import { FaPlus, FaSearch, FaFolder } from 'react-icons/fa'
import axios from 'axios'
import { toast } from 'react-toastify'
import ProductList from '../components/inventory/ProductList'
import ProductForm from '../components/inventory/ProductForm'
import StockActions from '../components/inventory/StockActions'
import CategoryForm from '../components/inventory/CategoryForm'
import RestockModal from '../components/inventory/RestockModal'
import ReturnSupplierModal from '../components/inventory/ReturnSupplierModal'
import ReturnCustomerModal from '../components/inventory/ReturnCustomerModal'

const Inventory = () => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [showCategoryForm, setShowCategoryForm] = useState(false);
    const [showRestockModal, setShowRestockModal] = useState(false);
    const [showReturnSupplierModal, setShowReturnSupplierModal] = useState(false);
    const [showReturnCustomerModal, setShowReturnCustomerModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('products');

    const API_URL = 'http://localhost:5000/api';

    const fetchData = async () => {
        try {
            setLoading(true);
            const [productsRes, categoriesRes] = await Promise.all([
                axios.get(`${API_URL}/products?search=${searchTerm}`),
                axios.get(`${API_URL}/products/categories`)
            ]);

            if (productsRes.data.success) {
                setProducts(productsRes.data.data.products);
            }
            if (categoriesRes.data.success) {
                setCategories(categoriesRes.data.data);
            }
        } catch (error) {
            console.error('Error fetching inventory:', error);
            toast.error('Failed to load inventory');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [searchTerm]);

    const handleAddProduct = () => {
        setEditingProduct(null);
        setShowForm(true);
    };

    const handleEditProduct = (product) => {
        setEditingProduct(product);
        setShowForm(true);
    };

    const handleDeleteProduct = async (id) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            try {
                await axios.delete(`${API_URL}/products/${id}`);
                toast.success('Product deleted successfully');
                fetchData();
            } catch (error) {
                toast.error('Failed to delete product');
            }
        }
    };

    const handleFormSubmit = async (data) => {
        try {
            if (editingProduct) {
                await axios.put(`${API_URL}/products/${editingProduct._id}`, data);
                toast.success('Product updated successfully');
            } else {
                await axios.post(`${API_URL}/products`, data);
                toast.success('Product added successfully');
            }
            setShowForm(false);
            fetchData();
        } catch (error) {
            toast.error('Failed to save product');
        }
    };

    const handleCategorySubmit = async (data) => {
        try {
            await axios.post(`${API_URL}/products/categories`, data);
            toast.success('Category added successfully');
            setShowCategoryForm(false);
            fetchData(); // Refresh categories
        } catch (error) {
            console.error('Error adding category:', error);
            toast.error('Failed to add category');
        }
    };

    const handleStockAction = (action) => {
        if (action === 'add_stock') {
            setShowRestockModal(true);
        } else if (action === 'return_supplier') {
            setShowReturnSupplierModal(true);
        } else if (action === 'return_customer') {
            setShowReturnCustomerModal(true);
        } else {
            console.warn('Unknown action:', action);
        }
    };

    return (
        <div className="container-fluid p-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="fw-bold mb-1">Inventory</h2>
                    <p className="text-muted mb-0">Manage your products, stock, and returns</p>
                </div>
                <div className="d-flex gap-2">
                    <Button variant="outline-dark" className="d-flex align-items-center" onClick={() => setShowCategoryForm(true)}>
                        <FaPlus className="me-2" /> Add Category
                    </Button>
                    <Button variant="primary" className="d-flex align-items-center" onClick={handleAddProduct}>
                        <FaPlus className="me-2" /> Add Product
                    </Button>
                </div>
            </div>

            <div className="mb-4">
                <Nav variant="pills" className="bg-light d-inline-flex p-1 rounded" activeKey={activeTab}>
                    <Nav.Item>
                        <Nav.Link
                            eventKey="products"
                            onClick={() => setActiveTab('products')}
                            className={activeTab === 'products' ? 'bg-white shadow-sm text-dark fw-bold' : 'text-muted'}
                        >
                            Products
                        </Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                        <Nav.Link
                            eventKey="actions"
                            onClick={() => setActiveTab('actions')}
                            className={activeTab === 'actions' ? 'bg-white shadow-sm text-dark fw-bold' : 'text-muted'}
                        >
                            Stock Actions
                        </Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                        <Nav.Link
                            eventKey="categories"
                            onClick={() => setActiveTab('categories')}
                            className={activeTab === 'categories' ? 'bg-white shadow-sm text-dark fw-bold' : 'text-muted'}
                        >
                            Categories
                        </Nav.Link>
                    </Nav.Item>
                </Nav>
            </div>

            {activeTab === 'products' && (
                <>
                    <Row className="mb-4">
                        <Col md={5}>
                            <InputGroup className="shadow-sm">
                                <InputGroup.Text className="bg-white border-end-0">
                                    <FaSearch className="text-muted" />
                                </InputGroup.Text>
                                <Form.Control
                                    placeholder="Search products..."
                                    className="border-start-0 border-start-0"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </InputGroup>
                        </Col>
                    </Row>

                    <div className="bg-white p-4 rounded shadow-sm">
                        {loading ? (
                            <div className="text-center py-5">
                                <Spinner animation="border" variant="primary" />
                            </div>
                        ) : (
                            <ProductList
                                products={products}
                                onEdit={handleEditProduct}
                                onDelete={handleDeleteProduct}
                            />
                        )}
                    </div>
                </>
            )}

            {activeTab === 'actions' && (
                <div className="py-4">
                    <StockActions onAction={handleStockAction} />
                </div>
            )}

            {activeTab === 'categories' && (
                <div className="py-4">
                    <h4 className="fw-bold mb-4">Product Categories</h4>
                    <Row className="g-4">
                        {categories.map((cat) => (
                            <Col md={4} key={cat._id}>
                                <Card className="h-100 border-0 shadow-sm hover-card bg-white">
                                    <Card.Body className="d-flex align-items-center p-4">
                                        <div className="p-3 rounded bg-primary bg-opacity-10 text-primary me-3">
                                            <FaFolder size={24} />
                                        </div>
                                        <div>
                                            <h6 className="fw-bold mb-1">{cat.name}</h6>
                                            <small className="text-muted">{cat.description || 'No description'}</small>
                                        </div>
                                    </Card.Body>
                                </Card>
                            </Col>
                        ))}
                        {categories.length === 0 && (
                            <Col xs={12}>
                                <div className="text-center py-5 text-muted">
                                    No categories found. Add one to get started.
                                </div>
                            </Col>
                        )}
                    </Row>
                </div>
            )}

            <ProductForm
                show={showForm}
                onHide={() => setShowForm(false)}
                onSubmit={handleFormSubmit}
                initialData={editingProduct}
                categories={categories}
            />

            <CategoryForm
                show={showCategoryForm}
                onHide={() => setShowCategoryForm(false)}
                onSubmit={handleCategorySubmit}
            />

            <RestockModal
                show={showRestockModal}
                onHide={() => setShowRestockModal(false)}
                onStockAdded={fetchData}
            />

            <ReturnSupplierModal
                show={showReturnSupplierModal}
                onHide={() => setShowReturnSupplierModal(false)}
                onReturnComplete={fetchData}
            />

            <ReturnCustomerModal
                show={showReturnCustomerModal}
                onHide={() => setShowReturnCustomerModal(false)}
                onReturnComplete={fetchData}
            />
        </div>
    )
}

export default Inventory
