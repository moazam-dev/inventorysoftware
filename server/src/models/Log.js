const mongoose = require('mongoose');

const logSchema = new mongoose.Schema({
    date: {
        type: String, // Format: YYYY-MM-DD
        required: true,
        unique: true,
        index: true
    },
    year: {
        type: Number,
        required: true,
        index: true
    },
    month: {
        type: Number,
        required: true, // 1-12
        index: true
    },
    day: {
        type: Number,
        required: true
    },
    totalRevenue: {
        type: Number,
        default: 0
    },
    totalExpenses: {
        type: Number,
        default: 0
    },
    totalProfit: {
        type: Number,
        default: 0
    },
    itemsSold: {
        type: Number,
        default: 0
    },
    itemsReturned: {
        type: Number,
        default: 0
    },
    transactions: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Transaction'
    }]
}, {
    timestamps: true
});

module.exports = mongoose.model('Log', logSchema);
