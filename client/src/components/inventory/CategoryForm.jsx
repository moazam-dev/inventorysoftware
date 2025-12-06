import React from 'react'
import { Modal, Form, Button } from 'react-bootstrap'
import { useForm } from 'react-hook-form'

const CategoryForm = ({ show, onHide, onSubmit }) => {
    const { register, handleSubmit, reset } = useForm();

    const handleFormSubmit = (data) => {
        onSubmit(data);
        reset();
    };

    return (
        <Modal show={show} onHide={onHide} centered>
            <Modal.Header closeButton>
                <Modal.Title>Add New Category</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form onSubmit={handleSubmit(handleFormSubmit)}>
                    <Form.Group className="mb-3">
                        <Form.Label>Category Name</Form.Label>
                        <Form.Control
                            {...register('name', { required: true })}
                            placeholder="e.g. Scarves, Tops"
                            autoFocus
                        />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Description (Optional)</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={3}
                            {...register('description')}
                            placeholder="Optional description..."
                        />
                    </Form.Group>
                    <div className="d-flex justify-content-end">
                        <Button variant="secondary" className="me-2" onClick={onHide}>Cancel</Button>
                        <Button variant="primary" type="submit">Add Category</Button>
                    </div>
                </Form>
            </Modal.Body>
        </Modal>
    )
}

export default CategoryForm
