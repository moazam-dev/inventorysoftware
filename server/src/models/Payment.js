const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
    date: {
        type: Date,
        default: Date.now,
        required: true,
        index: true
    },
    type: {
        type: String,
        enum: ['pay_supplier', 'receive_customer'],
        required: true
    },
    amount: {
        type: Number,
        required: true,
        min: 0
    },

    // For paying Suppliers
    supplierName: {
        type: String,
        trim: true
    },

    // For receiving from Customers
    customer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Customer'
    },

    paymentMethod: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'PaymentMethod',
        required: true
    },

    description: String,

    // Links to related entities if applicable (e.g. specific transaction)
    transactionRef: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Transaction'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Payment', paymentSchema);
