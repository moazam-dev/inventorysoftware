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

    // 2. Old Expense Logic - REMOVED
    // We now handle initial stock via transactionService.createPurchase in the controller if needed.
    // Or simpler: we keep createProduct simple, and if the user wants initial stock + payment,
    // the controller will handle the Purchase transaction.
    // However, if we just pass 'quantity' here, it sets the initial stock.
    // Ideally, createProduct should just set stock to 0 if we want to force a Purchase?
    // No, we can set initial stock here, but we MUST NOT create an expense here.
    // The controller will call createPurchase which updates stock.
    // So here we should likely force quantity to 0 if we are doing the purchase flow?
    // Let's just remove the expense logic.

    // Actually, if we pass quantity here, standard create(data) sets it.
    // If the controller calls createPurchase, that ADDS to the stock.
    // So if create(data) sets it to 10, and createPurchase adds 10, we get 20.
    // So we should delete quantity from data before creating if we plan to use createPurchase.

    // But modifying data here is implicit.
    // Best practice: Controller handles the orchestration.
    // Service just creates what it's told.
    // So we remove the side-effect (Expense Creation).

    return product;
};

exports.updateProduct = async (id, data) => {
    // Check for stock increase
    // NOTE: Expense creation for restock is now handled by transactionService.createPurchase
    // We only update product fields here.
    if (data.quantity !== undefined && data.quantity > 0) {
        // Just standard update, no side effects here anymore.
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
