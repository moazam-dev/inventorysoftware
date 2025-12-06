import React from 'react'
import { Table, Badge, Button } from 'react-bootstrap'
import { FaEdit, FaTrash } from 'react-icons/fa'

const ProductList = ({ products, onEdit, onDelete }) => {
    return (
        <div className="table-responsive">
            <Table hover className="align-middle">
                <thead className="bg-light">
                    <tr>
                        <th className="border-0 text-secondary small text-uppercase fw-normal ps-3">Product</th>
                        <th className="border-0 text-secondary small text-uppercase fw-normal">Category</th>
                        <th className="border-0 text-secondary small text-uppercase fw-normal">Cost</th>
                        <th className="border-0 text-secondary small text-uppercase fw-normal">Sale Price</th>
                        <th className="border-0 text-secondary small text-uppercase fw-normal text-center">Stock</th>
                        <th className="border-0 text-secondary small text-uppercase fw-normal text-end pe-3">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {products.length === 0 ? (
                        <tr>
                            <td colSpan="6" className="text-center py-4 text-muted">No products found</td>
                        </tr>
                    ) : (
                        products.map((product) => (
                            <tr key={product._id}>
                                <td className="ps-3">
                                    <div className="fw-bold text-dark">{product.name}</div>
                                    <small className="text-muted">Supplier: {product.supplier || 'N/A'}</small>
                                </td>
                                <td>
                                    <Badge bg="light" text="dark" className="border fw-normal rounded-pill px-3">
                                        {product.category}
                                    </Badge>
                                </td>
                                <td>Rs {product.costPrice.toLocaleString()}</td>
                                <td>Rs {product.salePrice.toLocaleString()}</td>
                                <td className="text-center">
                                    <Badge
                                        bg={product.quantity <= (product.lowStockThreshold || 5) ? 'danger' : 'light'}
                                        text={product.quantity <= (product.lowStockThreshold || 5) ? 'white' : 'dark'}
                                        className={`rounded-3 px-3 py-2 ${product.quantity > (product.lowStockThreshold || 5) ? 'border' : ''}`}
                                    >
                                        {product.quantity}
                                    </Badge>
                                </td>
                                <td className="text-end pe-3">
                                    <Button variant="link" className="text-dark p-0 me-3 opacity-75 hover-opacity-100" onClick={() => onEdit(product)}>
                                        <FaEdit />
                                    </Button>
                                    <Button variant="link" className="text-danger p-0 opacity-75 hover-opacity-100" onClick={() => onDelete(product._id)}>
                                        <FaTrash />
                                    </Button>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </Table>
        </div>
    )
}

export default ProductList
