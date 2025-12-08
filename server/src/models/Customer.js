const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        index: true
    },
    phone: {
        type: String,
        trim: true
    },
    currentBalance: {
        type: Number,
        default: 0
    },
    totalPurchased: {
        type: Number,
        default: 0
    },
    totalPaid: {
        type: Number,
        default: 0
    },
    lastTransactionDate: {
        type: Date
    },
    notes: String
}, {
    timestamps: true
});

module.exports = mongoose.model('Customer', customerSchema);
