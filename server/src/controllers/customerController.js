const Customer = require('../models/Customer');
const Transaction = require('../models/Transaction');
const Payment = require('../models/Payment');

exports.createCustomer = async (req, res, next) => {
    try {
        const { name, phone, notes } = req.body;
        const customer = await Customer.create({ name, phone, notes });
        res.status(201).json({ success: true, data: customer });
    } catch (error) {
        next(error);
    }
};

exports.getCustomers = async (req, res, next) => {
    try {
        const customers = await Customer.find().sort({ name: 1 });
        res.json({ success: true, data: customers });
    } catch (error) {
        next(error);
    }
};

exports.getCustomerById = async (req, res, next) => {
    try {
        const customer = await Customer.findById(req.params.id);
        if (!customer) {
            return res.status(404).json({ success: false, message: 'Customer not found' });
        }
        res.json({ success: true, data: customer });
    } catch (error) {
        next(error);
    }
};

exports.updateCustomer = async (req, res, next) => {
    try {
        const customer = await Customer.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json({ success: true, data: customer });
    } catch (error) {
        next(error);
    }
};

exports.getCustomerLedger = async (req, res, next) => {
    const customerId = req.params.id;
    try {
        const customer = await Customer.findById(customerId);
        if (!customer) {
            return res.status(404).json({ success: false, message: 'Customer not found' });
        }

        // 1. Sales (Debits)
        // We need to link Transactions to Customers. 
        // Currently Transaction has partyName. We should probably update Transaction to have customerId.
        // For now, let's assume we will filter by customerId if present, or partyName match.
        // The robust way is to rely on the new 'customer' field I should add to Transaction.
        // BUT for keeping it simple and backward compatible, I will query by partyName too if needed?
        // No, let's stick to the new plan: Transactions will have 'customer' field.

        const sales = await Transaction.find({
            customer: customerId,
            type: 'sale'
        }).lean();

        // 2. Returns (Credits)
        const returns = await Transaction.find({
            customer: customerId,
            type: 'return_from_customer'
        }).lean();

        // 3. Payments Received (Credits)
        const payments = await Payment.find({
            customer: customerId,
            type: 'receive_customer'
        }).populate('paymentMethod', 'name').lean();

        // Merge
        const ledger = [
            ...sales.flatMap(t => {
                if (t.paidAmount !== undefined && t.paidAmount > 0 && t.paidAmount < t.totalAmount) {
                    // Partial Split
                    return [
                        {
                            _id: t._id + '_paid',
                            date: t.date,
                            type: 'sale',
                            description: 'Sale (Paid)',
                            amount: t.paidAmount,
                            isDebit: true,
                            notes: t.notes
                        },
                        {
                            _id: t._id + '_pending',
                            date: t.date,
                            type: 'sale',
                            description: 'Sale (Pending)',
                            amount: t.totalAmount - t.paidAmount,
                            isDebit: true,
                            notes: t.notes
                        }
                    ];
                }

                let status = '';
                if (t.paidAmount !== undefined && t.paidAmount === 0) status = ' (Pending)';

                return [{
                    _id: t._id,
                    date: t.date,
                    type: 'sale',
                    description: 'Sale' + status,
                    amount: t.totalAmount,
                    isDebit: true,
                    notes: t.notes
                }];
            }),
            ...returns.map(t => ({
                _id: t._id,
                date: t.date,
                type: 'return',
                description: 'Return from Customer',
                amount: t.totalAmount,
                isDebit: false, // Customer balance reduces
                notes: t.notes
            })),
            ...payments.map(p => ({
                _id: p._id,
                date: p.date,
                type: 'payment',
                description: `Payment via ${p.paymentMethod?.name || 'Unknown'}`,
                amount: p.amount,
                isDebit: false, // Customer balance reduces
                notes: p.description
            }))
        ].sort((a, b) => new Date(b.date) - new Date(a.date));

        res.json({
            success: true,
            data: {
                customer,
                ledger
            }
        });

    } catch (error) {
        next(error);
    }
};
