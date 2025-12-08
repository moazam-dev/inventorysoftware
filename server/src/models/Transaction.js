const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['sale', 'purchase', 'return_to_supplier', 'return_from_customer'],
        required: true
    },
    items: [{
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true
        },
        productName: String, // Snapshot in case product is deleted
        quantity: {
            type: Number,
            required: true
        },
        price: {
            type: Number,
            required: true
        }
    }],
    totalAmount: {
        type: Number,
        required: true
    },
    discount: {
        type: Number,
        default: 0
    },
    partyName: {
        type: String, // Supplier name or Walk-in Customer name
        default: 'Walk-in Customer'
    },
    customer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Customer'
    },
    partyPhone: {
        type: String
    },
    paymentMethod: {
        type: mongoose.Schema.Types.ObjectId, // Link to PaymentMethod model
        ref: 'PaymentMethod'
    },
    paidAmount: {
        type: Number,
        default: 0
    },
    date: {
        type: Date,
        default: Date.now
    },
    notes: String
}, {
    timestamps: true
});

module.exports = mongoose.model('Transaction', transactionSchema);
