const Product = require('../models/Product');
const Category = require('../models/Category');
const Expense = require('../models/Expense');
const logService = require('./logService');

exports.getAllProducts = async (query) => {
    const { search, category, page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;

    let filter = {};
    if (search) {
        filter.name = { $regex: search, $options: 'i' };
    }
    if (category) {
        filter.category = category;
    }

    const products = await Product.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));

    const total = await Product.countDocuments(filter);

    return { products, total, page: parseInt(page), pages: Math.ceil(total / limit) };
};

exports.getProductById = async (id) => {
    return await Product.findById(id);
};

exports.createProduct = async (data) => {
    // Check if category exists, if not create it (optional, or enforce existing)
    // For now, we assume category name is passed string.

    // Handle empty SKU to avoid duplicate key error
    if (data.sku === "") {
        delete data.sku;
    }

    // 1. Create Product
    const product = await Product.create(data);

    // 2. Create Expense for Stock Purchase
    try {
        if (product.quantity > 0 && product.costPrice > 0) {
            const totalCost = product.quantity * product.costPrice;
            await Expense.create({
                title: `Stock Purchase: ${product.name}`,
                amount: totalCost,
                category: 'Stock Purchase',
                date: new Date(),
                notes: `Initial stock of ${product.quantity} units`
            });
            await logService.updateDailyLog(new Date(), 'expense', totalCost);
        }
    } catch (err) {
        console.error('Error auto-creating expense (suppressed):', err);
        // Suppress error so product creation succeeds
    }

    return product;
};

exports.updateProduct = async (id, data) => {
    // Check for stock increase
    if (data.quantity !== undefined) {
        const currentProduct = await Product.findById(id);
        if (currentProduct && data.quantity > currentProduct.quantity) {
            const addedQty = data.quantity - currentProduct.quantity;
            const costPrice = data.costPrice !== undefined ? data.costPrice : currentProduct.costPrice;

            if (costPrice > 0) {
                const addedCost = addedQty * costPrice;
                await Expense.create({
                    title: `Stock Update: ${currentProduct.name}`,
                    amount: addedCost,
                    category: 'Stock Purchase',
                    date: new Date(),
                    notes: `Added ${addedQty} units`
                });
                await logService.updateDailyLog(new Date(), 'expense', addedCost);
            }
        }
    }

    // Handle empty SKU for update as well
    if (data.sku === "") {
        data.sku = undefined; // Mongoose might need explicit $unset if converting existing string to null, but undefined usually skips update of that field.
        // Actually, if we want to REMOVE the sku, we should use $unset.
        // But here assume typical case of just sending cleaned data.
        delete data.sku;
    }

    return await Product.findByIdAndUpdate(id, data, { new: true });
};

exports.deleteProduct = async (id) => {
    return await Product.findByIdAndDelete(id);
};

exports.getAllCategories = async () => {
    return await Category.find().sort({ name: 1 });
};

exports.createCategory = async (data) => {
    return await Category.create(data);
};
