import React, { useState, useEffect } from 'react'
import { Modal, Button, Form, Table, Row, Col, InputGroup } from 'react-bootstrap'
import { useForm, useFieldArray, Controller } from 'react-hook-form'
import { FaTrash, FaPlus, FaMoneyBillWave } from 'react-icons/fa'
import axios from 'axios'
import { toast } from 'react-toastify'

const BulkProductModal = ({ show, onHide, onSuccess }) => {
    const { register, control, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm({
        defaultValues: {
            products: [
                { name: '', category: '', sku: '', costPrice: '', salePrice: '', quantity: '', description: '' }
            ],
            supplier: '',
            paymentMethod: '',
            paidAmount: '',
            notes: ''
        }
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: "products"
    });

    const [paymentMethods, setPaymentMethods] = useState([]);
    const [categories, setCategories] = useState([]);

    const API_URL = 'http://localhost:5000/api';

    useEffect(() => {
        if (show) {
            fetchPaymentMethods();
            fetchCategories();
            reset({
                products: [
                    { name: '', category: '', sku: '', costPrice: '', salePrice: '', quantity: '', description: '' }
                ],
                supplier: '',
                paymentMethod: '',
                paidAmount: '',
                notes: ''
            });
        }
    }, [show, reset]);

    const fetchPaymentMethods = async () => {
        try {
            const res = await axios.get(`${API_URL}/payment-methods`);
            if (res.data.success) {
                setPaymentMethods(res.data.data);
                // Default to Cash
                const cash = res.data.data.find(m => m.type === 'cash');
                if (cash) setValue('paymentMethod', cash._id);
            }
        } catch (err) { console.error(err); }
    };

    const fetchCategories = async () => {
        try {
            const res = await axios.get(`${API_URL}/products/categories`);
            if (res.data.success) setCategories(res.data.data);
        } catch (err) { console.error(err); }
    };

    // Calculate Totals
    const productsWatch = watch('products');
    const totalCost = productsWatch.reduce((acc, curr) => {
        const qty = Number(curr.quantity) || 0;
        const cost = Number(curr.costPrice) || 0;
        return acc + (qty * cost);
    }, 0);

    const onSubmit = async (data) => {
        try {
            // Remove empty rows if any (though UI prevents removing last one easily, good to sanitize)
            const validProducts = data.products.filter(p => p.name && p.costPrice && p.salePrice);

            if (validProducts.length === 0) {
                toast.error('Please add at least one valid product');
                return;
            }

            const payload = {
                products: validProducts,
                supplier: data.supplier,
                paidAmount: data.paidAmount,
                paymentMethod: data.paymentMethod,
                notes: data.notes
            };

            const res = await axios.post(`${API_URL}/products/bulk`, payload);
            if (res.data.success) {
                toast.success('Products added successfully');
                onSuccess();
                onHide();
            }

        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || 'Failed to add products');
        }
    };

    return (
        <Modal show={show} onHide={onHide} size="xl" backdrop="static">
            <Modal.Header closeButton>
                <Modal.Title>Bulk Add Products</Modal.Title>
            </Modal.Header>
            <Modal.Body className="bg-light">
                <Form onSubmit={handleSubmit(onSubmit)}>
                    {/* Common Details */}
                    <div className="bg-white p-3 rounded shadow-sm mb-4">
                        <h5 className="mb-3 text-muted border-bottom pb-2">Supplier & Payment</h5>
                        <Row className="g-3">
                            <Col md={3}>
                                <Form.Group>
                                    <Form.Label>Supplier Name</Form.Label>
                                    <Form.Control
                                        {...register('supplier')}
                                        placeholder="Enter Supplier Name"
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={3}>
                                <Form.Group>
                                    <Form.Label>Payment Method</Form.Label>
                                    <Form.Select {...register('paymentMethod')}>
                                        <option value="">-- Pay Later / None --</option>
                                        {paymentMethods.map(m => (
                                            <option key={m._id} value={m._id}>{m.name} ({m.type})</option>
                                        ))}
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                            <Col md={3}>
                                <Form.Group>
                                    <Form.Label>Total Cost (Calculated)</Form.Label>
                                    <Form.Control
                                        readOnly
                                        value={`Rs ${totalCost.toLocaleString()}`}
                                        className="bg-light fw-bold"
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={3}>
                                <Form.Group>
                                    <Form.Label>Paid Now</Form.Label>
                                    <InputGroup>
                                        <InputGroup.Text>Rs</InputGroup.Text>
                                        <Form.Control
                                            type="number"
                                            {...register('paidAmount')}
                                            placeholder="Enter Amount"
                                        />
                                    </InputGroup>
                                </Form.Group>
                            </Col>
                        </Row>
                        <Row className="mt-3">
                            <Col md={12}>
                                <Form.Group>
                                    <Form.Label>Notes (Optional)</Form.Label>
                                    <Form.Control {...register('notes')} placeholder="Order #1234..." />
                                </Form.Group>
                            </Col>
                        </Row>
                    </div>

                    {/* Products List */}
                    <div className="bg-white p-3 rounded shadow-sm">
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <h5 className="mb-0 text-muted">Product List</h5>
                            <Button variant="outline-primary" size="sm" onClick={() => append({ name: '', category: '', sku: '', costPrice: '', salePrice: '', quantity: '', description: '' })}>
                                <FaPlus className="me-1" /> Add Row
                            </Button>
                        </div>

                        <Table bordered hover responsive size="sm">
                            <thead className="bg-light">
                                <tr>
                                    <th style={{ width: '20%' }}>Name *</th>
                                    <th style={{ width: '15%' }}>Category *</th>
                                    <th style={{ width: '10%' }}>SKU</th>
                                    <th style={{ width: '10%' }}>Cost *</th>
                                    <th style={{ width: '10%' }}>Sale *</th>
                                    <th style={{ width: '10%' }}>Qty *</th>
                                    <th>One-Liner</th>
                                    <th style={{ width: '50px' }}></th>
                                </tr>
                            </thead>
                            <tbody>
                                {fields.map((field, index) => (
                                    <tr key={field.id}>
                                        <td>
                                            <Form.Control
                                                {...register(`products.${index}.name`, { required: true })}
                                                isInvalid={errors.products?.[index]?.name}
                                                size="sm"
                                            />
                                        </td>
                                        <td>
                                            <Form.Control
                                                type="text"
                                                list="categoryOptions"
                                                {...register(`products.${index}.category`, { required: true })}
                                                size="sm"
                                            />
                                            <datalist id="categoryOptions">
                                                {categories.map((c, i) => <option key={i} value={c} />)}
                                            </datalist>
                                        </td>
                                        <td>
                                            <Form.Control {...register(`products.${index}.sku`)} size="sm" />
                                        </td>
                                        <td>
                                            <InputGroup size="sm">
                                                <Form.Control type="number" {...register(`products.${index}.costPrice`, { required: true, min: 0 })} />
                                            </InputGroup>
                                        </td>
                                        <td>
                                            <InputGroup size="sm">
                                                <Form.Control type="number" {...register(`products.${index}.salePrice`, { required: true, min: 0 })} />
                                            </InputGroup>
                                        </td>
                                        <td>
                                            <Form.Control type="number" {...register(`products.${index}.quantity`, { required: true, min: 0 })} size="sm" />
                                        </td>
                                        <td>
                                            <Form.Control {...register(`products.${index}.description`)} size="sm" />
                                        </td>
                                        <td className="text-center align-middle">
                                            {fields.length > 1 && (
                                                <Button variant="link" className="text-danger p-0" onClick={() => remove(index)}>
                                                    <FaTrash />
                                                </Button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    </div>

                    <div className="d-flex justify-content-end mt-4">
                        <Button variant="secondary" className="me-2" onClick={onHide}>
                            Cancel
                        </Button>
                        <Button variant="primary" type="submit">
                            Save All Products
                        </Button>
                    </div>
                </Form>
            </Modal.Body>
        </Modal>
    );
};

export default BulkProductModal;
