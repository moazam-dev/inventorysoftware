const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    amount: {
        type: Number,
        required: true,
        min: 0
    },
    category: {
        type: String,
        required: true, // e.g., Rent, Utilities, Salary
        index: true
    },
    date: {
        type: Date,
        default: Date.now
    },
    notes: String
}, {
    timestamps: true
});

module.exports = mongoose.model('Expense', expenseSchema);
