const Transaction = require('../models/Transaction');
const Product = require('../models/Product');
const Log = require('../models/Log');
const logService = require('./logService');

exports.createSale = async (data) => {
    const { items, discount, partyName, partyPhone, paymentMethod, notes } = data;

    // 1. Validate Stock & Calculate Total
    let totalAmount = 0;
    const processedItems = [];

    for (const item of items) {
        const product = await Product.findById(item.product);
        if (!product) {
            throw new Error(`Product not found: ${item.product}`);
        }
        if (product.quantity < item.quantity) {
            throw new Error(`Insufficient stock for product: ${product.name}`);
        }

        // Update Stock
        product.quantity -= item.quantity;
        await product.save();

        processedItems.push({
            product: product._id,
            productName: product.name,
            quantity: item.quantity,
            price: product.salePrice // Use current sale price
        });

        totalAmount += product.salePrice * item.quantity;
    }

    // Apply Discount
    const finalAmount = totalAmount - (discount || 0);

    // 2. Create Transaction
    const transaction = await Transaction.create({
        type: 'sale',
        items: processedItems,
        totalAmount: finalAmount,
        discount: discount || 0,
        partyName,
        partyPhone,
        paymentMethod,
        notes,
        date: new Date()
    });

    // 3. Update Daily Log (Simplified)
    // Ideally, this should be an async background task or handled via triggers
    // For now, we update/create the log for today.
    const today = new Date();
    const dateStr = today.toISOString().split('T')[0];
    const year = today.getFullYear();
    const month = today.getMonth() + 1;
    const day = today.getDate();

    let log = await Log.findOne({ date: dateStr });
    if (!log) {
        log = new Log({ date: dateStr, year, month, day });
    }

    // 3. Update Daily Log (Centralized)
    const itemsSold = items.reduce((acc, item) => acc + item.quantity, 0);
    await logService.updateDailyLog(new Date(), 'sale', finalAmount, itemsSold, transaction._id);

    return transaction;
};

exports.getTransactionById = async (id) => {
    return await Transaction.findById(id).populate('items.product');
};

exports.createReturnToSupplier = async (data) => {
    const { product: productId, quantity, refundAmount, notes } = data;

    const product = await Product.findById(productId);
    if (!product) {
        throw new Error('Product not found');
    }

    if (product.quantity < quantity) {
        throw new Error(`Insufficient stock to return. Current stock: ${product.quantity}`);
    }

    // Update Stock
    product.quantity -= Number(quantity);
    await product.save();

    // Create Transaction
    const transaction = await Transaction.create({
        type: 'return_to_supplier',
        items: [{
            product: product._id,
            productName: product.name,
            quantity: Number(quantity),
            price: Number(refundAmount) // Store total refund amount as price for simplicity or unit price? 
            // The model expects price per item usually, but for returns we might just want total refund.
            // Let's store unit refund price = refundAmount / quantity
        }],
        totalAmount: Number(refundAmount),
        partyName: product.supplier || 'Supplier', // Use product supplier if available
        notes,
        date: new Date()
    });

    // We might want to fix the item price structure above. 
    // If refundAmount is total, unit price is refundAmount / quantity.
    // Ideally we should pass unit price or total. Let's assume input is Total Refund Amount.
    // Update the item definition in transaction update above if needed.
    // For now:
    const unitRefund = Number(refundAmount) / Number(quantity);
    transaction.items[0].price = unitRefund;
    await transaction.save();

    // Update Log
    await logService.updateDailyLog(new Date(), 'return_to_supplier', Number(refundAmount), quantity, transaction._id);

    return transaction;
};

exports.createReturnFromCustomer = async (data) => {
    const { product: productId, quantity, refundAmount, customerName, notes } = data;

    const product = await Product.findById(productId);
    if (!product) {
        throw new Error('Product not found');
    }

    // Update Stock
    product.quantity += Number(quantity);
    await product.save();

    // Create Transaction
    const transaction = await Transaction.create({
        type: 'return_from_customer',
        items: [{
            product: product._id,
            productName: product.name,
            quantity: Number(quantity),
            price: Number(refundAmount) / Number(quantity)
        }],
        totalAmount: Number(refundAmount),
        partyName: customerName || 'Customer',
        notes,
        date: new Date()
    });

    // Update Log
    await logService.updateDailyLog(new Date(), 'return_from_customer', Number(refundAmount), quantity, transaction._id);

    return transaction;
};
