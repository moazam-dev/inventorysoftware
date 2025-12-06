import React, { useEffect } from 'react'
import { Modal, Form, Button, Row, Col } from 'react-bootstrap'
import { useForm } from 'react-hook-form'

const ProductForm = ({ show, onHide, onSubmit, initialData, categories }) => {
    const { register, handleSubmit, reset, setValue } = useForm();

    useEffect(() => {
        if (initialData) {
            Object.keys(initialData).forEach(key => setValue(key, initialData[key]));
        } else {
            reset();
        }
    }, [initialData, reset, setValue, show]);

    const handleFormSubmit = (data) => {
        onSubmit(data);
        reset();
    };

    return (
        <Modal show={show} onHide={onHide} size="lg" centered>
            <Modal.Header closeButton>
                <Modal.Title>{initialData ? 'Edit Product' : 'Add New Product'}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form onSubmit={handleSubmit(handleFormSubmit)}>
                    <Row className="g-3">
                        <Col md={6}>
                            <Form.Group>
                                <Form.Label>Product Name</Form.Label>
                                <Form.Control {...register('name', { required: true })} placeholder="e.g. Embroidered Lawn Suit" />
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group>
                                <Form.Label>Category</Form.Label>
                                <Form.Select {...register('category', { required: true })}>
                                    <option value="">Select Category</option>
                                    {categories.map(cat => (
                                        <option key={cat._id} value={cat.name}>{cat.name}</option>
                                    ))}
                                </Form.Select>
                            </Form.Group>
                        </Col>
                        <Col md={4}>
                            <Form.Group>
                                <Form.Label>SKU (Optional)</Form.Label>
                                <Form.Control {...register('sku')} placeholder="e.g. SUIT-001" />
                            </Form.Group>
                        </Col>
                        <Col md={4}>
                            <Form.Group>
                                <Form.Label>Cost Price</Form.Label>
                                <Form.Control type="number" {...register('costPrice', { required: true, min: 0 })} />
                            </Form.Group>
                        </Col>
                        <Col md={4}>
                            <Form.Group>
                                <Form.Label>Sale Price</Form.Label>
                                <Form.Control type="number" {...register('salePrice', { required: true, min: 0 })} />
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group>
                                <Form.Label>Initial Quantity</Form.Label>
                                <Form.Control type="number" {...register('quantity', { required: true, min: 0 })} disabled={!!initialData} />
                                {initialData && <Form.Text className="text-muted">Use 'Stock Actions' to update quantity.</Form.Text>}
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group>
                                <Form.Label>Low Stock Threshold</Form.Label>
                                <Form.Control type="number" {...register('lowStockThreshold')} defaultValue={5} />
                            </Form.Group>
                        </Col>
                        <Col md={12}>
                            <Form.Group>
                                <Form.Label>Description</Form.Label>
                                <Form.Control as="textarea" rows={3} {...register('description')} />
                            </Form.Group>
                        </Col>
                    </Row>
                    <div className="d-flex justify-content-end mt-4">
                        <Button variant="secondary" className="me-2" onClick={onHide}>Cancel</Button>
                        <Button variant="primary" type="submit">{initialData ? 'Update Product' : 'Add Product'}</Button>
                    </div>
                </Form>
            </Modal.Body>
        </Modal>
    )
}

export default ProductForm
