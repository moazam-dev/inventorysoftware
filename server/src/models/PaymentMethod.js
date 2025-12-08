const mongoose = require('mongoose');

const paymentMethodSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true, // e.g., "JazzCash 1", "Meezan Bank"
        trim: true,
        unique: true
    },
    type: {
        type: String,
        enum: ['cash', 'bank', 'mobile_wallet', 'other'],
        default: 'other'
    },
    details: {
        type: String // Account #, etc.
    },
    currentBalance: {
        type: Number,
        default: 0 // Track how much money is in this account
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('PaymentMethod', paymentMethodSchema);
