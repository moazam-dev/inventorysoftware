import React, { useState } from 'react'
import { Row, Col } from 'react-bootstrap'
import axios from 'axios'
import { toast } from 'react-toastify'
import ProductSelector from '../components/checkout/ProductSelector'
import Cart from '../components/checkout/Cart'
import InvoicePreview from '../components/checkout/InvoicePreview'

const Checkout = () => {
    const [cartItems, setCartItems] = useState([]);
    const [discount, setDiscount] = useState(0);
    const [customer, setCustomer] = useState({ name: '', phone: '' });
    const [paymentMethod, setPaymentMethod] = useState('cash');
    const [notes, setNotes] = useState('');
    const [showInvoice, setShowInvoice] = useState(false);
    const [invoiceData, setInvoiceData] = useState(null);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const handleAddToCart = (product) => {
        const existingItem = cartItems.find(item => item.product === product._id);
        if (existingItem) {
            if (existingItem.qty + 1 > product.quantity) {
                toast.warning(`Only ${product.quantity} items in stock`);
                return;
            }
            setCartItems(cartItems.map(item =>
                item.product === product._id ? { ...item, qty: item.qty + 1 } : item
            ));
        } else {
            setCartItems([...cartItems, {
                product: product._id,
                name: product.name,
                price: product.salePrice,
                qty: 1,
                maxQty: product.quantity
            }]);
        }
    };

    const handleUpdateQty = (index, newQty) => {
        if (newQty < 1) return;
        const item = cartItems[index];
        if (newQty > item.maxQty) {
            toast.warning(`Only ${item.maxQty} items in stock`);
            return;
        }
        const newCart = [...cartItems];
        newCart[index].qty = newQty;
        setCartItems(newCart);
    };

    const handleRemoveItem = (index) => {
        const newCart = [...cartItems];
        newCart.splice(index, 1);
        setCartItems(newCart);
    };

    const calculateTotal = () => {
        return cartItems.reduce((acc, item) => acc + (item.price * item.qty), 0);
    };

    const handleCheckout = async () => {
        if (cartItems.length === 0) return;

        try {
            const payload = {
                items: cartItems.map(item => ({ product: item.product, quantity: item.qty })),
                discount,
                partyName: customer.name,
                partyPhone: customer.phone,
                paymentMethod,
                notes: notes || 'Sale via Checkout'
            };

            const res = await axios.post('http://localhost:5000/api/transactions/sale', payload);

            if (res.data.success) {
                toast.success('Sale completed successfully!');
                setInvoiceData(res.data.data);
                setShowInvoice(true);
                setCartItems([]);
                setDiscount(0);
                setCustomer({ name: '', phone: '' });
                setNotes('');
                setRefreshTrigger(prev => prev + 1); // Trigger product list refresh
            }
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || 'Transaction failed');
        }
    };

    return (
        <div className="container-fluid p-4" style={{ height: 'calc(100vh - 60px)' }}>
            <div className="mb-3">
                <h2 className="fw-bold">Checkout</h2>
            </div>

            <Row className="h-100 g-4">
                <Col md={7} className="h-100">
                    <ProductSelector onAddToCart={handleAddToCart} refreshTrigger={refreshTrigger} />
                </Col>
                <Col md={5} className="h-100">
                    <Cart
                        cartItems={cartItems}
                        onRemove={handleRemoveItem}
                        onUpdateQty={handleUpdateQty}
                        onCheckout={handleCheckout}
                        total={calculateTotal()}
                        discount={discount}
                        setDiscount={setDiscount}
                        customer={customer}
                        setCustomer={setCustomer}
                        paymentMethod={paymentMethod}
                        setPaymentMethod={setPaymentMethod}
                        notes={notes}
                        setNotes={setNotes}
                    />
                </Col>
            </Row>

            <InvoicePreview
                show={showInvoice}
                onHide={() => setShowInvoice(false)}
                invoiceData={invoiceData}
            />
        </div>
    )
}

export default Checkout
