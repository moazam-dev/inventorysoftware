const logService = require('../services/logService');
const PaymentMethod = require('../models/PaymentMethod');
const Customer = require('../models/Customer');
const Payment = require('../models/Payment');

exports.createPayment = async (req, res, next) => {
    const {
        type, // 'pay_supplier', 'receive_customer'
        amount,
        paymentMethodId,
        partyName, // Supplier Name if pay_supplier
        customerId, // Customer ID if receive_customer
        description,
        date
    } = req.body;

    try {
        const method = await PaymentMethod.findById(paymentMethodId);
        if (!method) throw new Error('Invalid Payment Method');

        // 1. Handle Balance Updates
        if (type === 'pay_supplier') {
            // We (Business) PAY Supplier
            // Money goes OUT from PaymentMethod
            method.currentBalance -= Number(amount);

            // Supplier Debt Reduces (Calculated dynamically typically, so no field to update for Supplier unless we add one)
            // But we can check if there's a Transaction Ref? Not required for general payment.

        } else if (type === 'receive_customer') {
            // We RECEIVE from Customer
            // Money comes IN to PaymentMethod
            method.currentBalance += Number(amount);

            // Customer Debt Reduces
            if (customerId) {
                const customer = await Customer.findById(customerId);
                if (customer) {
                    customer.currentBalance -= Number(amount); // They owe less
                    customer.totalPaid += Number(amount);
                    customer.lastTransactionDate = new Date();
                    await customer.save();
                }
            }
        }

        await method.save();

        // 2. Create Record
        const payment = await Payment.create({
            date: date || new Date(),
            type,
            amount,
            supplierName: type === 'pay_supplier' ? partyName : undefined,
            customer: type === 'receive_customer' ? customerId : undefined,
            paymentMethod: paymentMethodId,
            description
        });

        // 3. CASH BASIS LOGGING
        // If this is a deferred payment (not linked to immediate sale/purchase inside transactionService),
        // we must log it here.
        // Even if linked (transactionRef exists), transactionService might NOT have logged it if we move logic here?
        // NO, transactionService handles its own immediate payments.
        // Frontend 'Payments' page calls this endpoint.
        // So this IS for deferred payments (or manual payments).

        // However, transactionService.createPurchase/createSale creates a Payment record directly?
        // Yes, checking transactionService.js... it does `Payment.create`. It does NOT call this controller.
        // So this controller is ONLY used by the Payments Page (Manual Payments).

        // Therefore, we MUST log it here.
        if (type === 'receive_customer') {
            await logService.updateDailyLog(new Date(), 'sale', Number(amount));
            // Note: 'sale' type in logService adds to Revenue. 
            // We don't have item count here, pass 0.
        } else if (type === 'pay_supplier') {
            await logService.updateDailyLog(new Date(), 'expense', Number(amount));
            // Note: 'expense' type in logService adds to Expenses.
        }

        res.status(201).json({ success: true, data: payment });
    } catch (error) {
        next(error);
    }
};

exports.getPayments = async (req, res, next) => {
    try {
        // Filter by supplier if needed
        const { supplier } = req.query;
        let query = {};
        if (supplier) {
            query.supplierName = supplier;
            query.type = 'pay_supplier';
        }

        const payments = await Payment.find(query)
            .populate('paymentMethod', 'name')
            .populate('customer', 'name')
            .sort({ date: -1 });

        res.json({ success: true, data: payments });
    } catch (error) {
        next(error);
    }
};
