const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    category: {
        type: String,
        required: true,
        index: true
    },
    sku: {
        type: String,
        unique: true,
        sparse: true
    },
    costPrice: {
        type: Number,
        required: true,
        min: 0
    },
    salePrice: {
        type: Number,
        required: true,
        min: 0
    },
    quantity: {
        type: Number,
        required: true,
        default: 0,
        min: 0
    },
    supplier: {
        type: String,
        required: false
    },
    description: {
        type: String
    },
    lowStockThreshold: {
        type: Number,
        default: 5
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Product', productSchema);
