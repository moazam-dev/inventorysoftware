const Transaction = require('../models/Transaction');
const Product = require('../models/Product');
const Log = require('../models/Log');
const logService = require('./logService');

exports.createSale = async (data) => {
    const { items, discount, partyName, customerId, partyPhone, paymentMethod, paidAmount, notes } = data;
    // paymentMethod here is expected to be an ObjectId string for the PaymentMethod model

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
    const amountPaid = Number(paidAmount) || 0;

    // 2. Handle Customer Logic (Balance Update)
    let customerGivenName = partyName;
    let finalCustomerId = customerId;

    // If no ID but we have details, try to find or create
    if (!finalCustomerId && partyName && partyPhone) {
        const Customer = require('../models/Customer');
        let customer = await Customer.findOne({ phone: partyPhone });

        if (customer) {
            // Check if names match (case-insensitive loose check)
            if (customer.name.toLowerCase() !== partyName.toLowerCase()) {
                throw new Error(`Phone number ${partyPhone} belongs to ${customer.name}. Use a different number.`);
            }
        } else {
            customer = await Customer.create({
                name: partyName,
                phone: partyPhone
            });
        }
        finalCustomerId = customer._id;
    }

    if (finalCustomerId) {
        const Customer = require('../models/Customer');
        const customer = await Customer.findById(finalCustomerId);
        if (customer) {
            customerGivenName = customer.name;
            // Total cost = finalAmount.
            // Paid = amountPaid.
            // Remaining = finalAmount - amountPaid.
            // Add Remaining to Balance (Debt increases)
            const remaining = finalAmount - amountPaid;

            customer.totalPurchased += finalAmount;
            customer.currentBalance += remaining; // If paid in full, remaining is 0.
            customer.totalPaid += amountPaid; // Track total lifetime paid
            customer.lastTransactionDate = new Date();
            await customer.save();
        }
    }

    // 3. Create Transaction
    const transaction = await Transaction.create({
        type: 'sale',
        items: processedItems,
        totalAmount: finalAmount,
        discount: discount || 0,
        partyName: customerGivenName,
        customer: finalCustomerId || undefined,
        partyPhone,
        paymentMethod: paymentMethod, // ObjectId
        paidAmount: amountPaid,
        notes,
        date: new Date()
    });

    // 4. Create Payment Record (for the amount paid immediately)
    if (amountPaid > 0 && paymentMethod) {
        const Payment = require('../models/Payment');
        const PaymentMethod = require('../models/PaymentMethod');

        // Update Payment Method Balance
        const method = await PaymentMethod.findById(paymentMethod);
        if (method) {
            method.currentBalance += amountPaid;
            await method.save();
        }

        await Payment.create({
            date: new Date(),
            type: 'receive_customer',
            amount: amountPaid,
            customer: customerId || undefined,
            paymentMethod: paymentMethod,
            description: `Sale Payment (Tx #${transaction._id})`,
            transactionRef: transaction._id
        });
    }

    // 5. Update Daily Log (Centralized)
    const itemsSold = items.reduce((acc, item) => acc + item.quantity, 0);
    // CASH BASIS: Only log the PAID amount as revenue.
    await logService.updateDailyLog(new Date(), 'sale', amountPaid, itemsSold, transaction._id);

    return transaction;
};

exports.getTransactionById = async (id) => {
    return await Transaction.findById(id).populate('items.product');
};

exports.getAllTransactions = async (query = {}) => {
    return await Transaction.find(query).sort({ date: -1 });
};

exports.createPurchase = async (data) => {
    let { items, product: productId, quantity, costPrice, supplier, paidAmount, paymentMethod, notes } = data;
    // Normalize to items array if single product provided
    if (!items && productId) {
        items = [{
            product: productId,
            quantity: Number(quantity),
            costPrice: Number(costPrice)
        }];
    }

    if (!items || items.length === 0) {
        throw new Error('No items provided for purchase');
    }

    let totalCost = 0;
    const processedItems = [];

    // 1. Update Stock for ALL items
    for (const item of items) {
        const prod = await Product.findById(item.product);
        if (!prod) {
            throw new Error(`Product not found: ${item.product}`);
        }
        prod.quantity += Number(item.quantity);
        // Update cost price if provided (Last Purchase Price)
        if (item.costPrice) prod.costPrice = Number(item.costPrice);
        if (supplier) prod.supplier = supplier;
        await prod.save();

        processedItems.push({
            product: prod._id,
            productName: prod.name,
            quantity: Number(item.quantity),
            price: Number(item.costPrice || prod.costPrice)
        });

        totalCost += Number(item.quantity) * Number(item.costPrice || prod.costPrice);
    }

    // 2. Create Transaction (Type: purchase)
    const amountPaid = Number(paidAmount) || 0;

    const transaction = await Transaction.create({
        type: 'purchase',
        items: processedItems,
        totalAmount: totalCost,
        partyName: supplier || 'Unknown Supplier', // Use provided supplier or default
        paidAmount: amountPaid,
        paymentMethod: paymentMethod || undefined,
        notes,
        date: new Date()
    });

    // 3. Create Payment Record (for the amount paid immediately)
    if (amountPaid > 0 && paymentMethod) {
        const Payment = require('../models/Payment');
        const PaymentMethod = require('../models/PaymentMethod');

        // Update Payment Method Balance (Decrease)
        const method = await PaymentMethod.findById(paymentMethod);
        if (method) {
            method.currentBalance -= amountPaid;
            await method.save();
        }

        await Payment.create({
            date: new Date(),
            type: 'pay_supplier',
            amount: amountPaid,
            supplierName: supplier || 'Unknown Supplier',
            paymentMethod: paymentMethod,
            description: `Stock Purchase (Tx #${transaction._id})`,
            transactionRef: transaction._id
        });
    }

    // 4. Update Daily Log (Expense)
    // CASH BASIS: Only log the PAID amount as expense.
    if (amountPaid > 0) {
        await logService.updateDailyLog(new Date(), 'expense', amountPaid, 0, transaction._id);
    }

    // 5. Create Expense Record (Accrual/Liability for Ledger)
    const Expense = require('../models/Expense');
    // For bulk, title can be generic or first item
    const title = items.length > 1 ? `Bulk Stock Purchase (${items.length} items)` : `Stock Purchase: ${processedItems[0].productName}`;

    await Expense.create({
        title: title,
        amount: totalCost, // Full Amount (Liability)
        paidAmount: amountPaid,
        category: 'Stock Purchase',
        supplier: supplier || 'Unknown Supplier',
        date: new Date(),
        notes: `Restock/Purchase. Paid: ${amountPaid}. Tx #${transaction._id}`
    });

    return transaction;
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
