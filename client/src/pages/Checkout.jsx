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

    // New State for Pay Later / Customer Tracking
    const [customers, setCustomers] = useState([]);
    const [paymentMethods, setPaymentMethods] = useState([]);
    const [selectedCustomer, setSelectedCustomer] = useState(''); // Customer ID
    const [paidAmount, setPaidAmount] = useState(''); // Amount paying NOW

    // Legacy/Fallback state (if Walk-in)
    const [customer, setCustomer] = useState({ name: '', phone: '' });

    const [paymentMethod, setPaymentMethod] = useState(''); // ID now
    const [notes, setNotes] = useState('');
    const [showInvoice, setShowInvoice] = useState(false);
    const [invoiceData, setInvoiceData] = useState(null);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const API_URL = 'http://localhost:5000/api';

    React.useEffect(() => {
        fetchCustomers();
        fetchPaymentMethods();
    }, []);

    const fetchCustomers = async () => {
        try {
            const res = await axios.get(`${API_URL}/customers`);
            if (res.data.success) setCustomers(res.data.data);
        } catch (err) { console.error(err); }
    };

    const fetchPaymentMethods = async () => {
        try {
            const res = await axios.get(`${API_URL}/payment-methods`);
            if (res.data.success) {
                setPaymentMethods(res.data.data);
                // Set default cash
                const cash = res.data.data.find(m => m.type === 'cash');
                if (cash) setPaymentMethod(cash._id);
            }
        } catch (err) { console.error(err); }
    };

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
                partyName: customer.name || (selectedCustomer ? customers.find(c => c._id === selectedCustomer)?.name : 'Walk-in Customer'),
                customerId: selectedCustomer || undefined,
                partyPhone: customer.phone,
                paymentMethod, // ObjectId
                paidAmount: paidAmount === '' ? calculateTotal() - discount : Number(paidAmount),
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
                setSelectedCustomer('');
                setPaidAmount('');
                setNotes('');
                setRefreshTrigger(prev => prev + 1); // Trigger product list refresh
            }
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || 'Transaction failed');
        }
    };



    const totalAmount = calculateTotal() - discount;
    const payingNow = paidAmount === '' ? totalAmount : Number(paidAmount);
    const pendingBalance = totalAmount - payingNow;

    return (
        <div className="container-fluid p-4 no-print">
            <div className="mb-3">
                <h2 className="fw-bold">Checkout</h2>
            </div>

            <Row className="g-4">
                <Col md={7}>
                    <ProductSelector onAddToCart={handleAddToCart} refreshTrigger={refreshTrigger} />
                </Col>
                <Col md={5}>
                    <Cart
                        cartItems={cartItems}
                        onRemove={handleRemoveItem}
                        onUpdateQty={handleUpdateQty}
                        onCheckout={handleCheckout}
                        total={calculateTotal()}
                        discount={discount}
                        setDiscount={setDiscount}
                        pendingBalance={pendingBalance} // Pass pending balance to Cart UI if needed, or Cart.jsx handles it?
                        // Cart.jsx handles the input. Let's pass the raw total to help it calculate warnings.
                        grandTotal={totalAmount}

                        // New Props
                        customers={customers}
                        paymentMethods={paymentMethods}
                        selectedCustomer={selectedCustomer}
                        setSelectedCustomer={setSelectedCustomer}
                        paidAmount={paidAmount}
                        setPaidAmount={setPaidAmount}

                        // Fallback/Legacy
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
