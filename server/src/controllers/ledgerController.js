const Expense = require('../models/Expense');
const Transaction = require('../models/Transaction');
const Payment = require('../models/Payment');

exports.getSuppliers = async (req, res, next) => {
    try {
        // Get suppliers from Expenses (Stock Purchases and Restocked)
        const expenseSuppliers = await Expense.distinct('supplier', {
            category: { $in: ['Stock Purchase', 'Restocked'] },
            supplier: { $ne: null }
        });

        // Get suppliers from Transactions (Returns)
        const transactionSuppliers = await Transaction.distinct('partyName', {
            type: 'return_to_supplier'
        });

        // Get suppliers from Payments
        const paymentSuppliers = await Payment.distinct('supplierName', {
            type: 'pay_supplier'
        });

        const allSuppliers = [...new Set([...expenseSuppliers, ...transactionSuppliers, ...paymentSuppliers])].sort();

        res.json({ success: true, data: allSuppliers });
    } catch (error) {
        next(error);
    }
};

exports.getSupplierLedger = async (req, res, next) => {
    const { supplier } = req.params;
    try {
        // 1. Get Expenses (Stock Purchases) - CREDIT (We owe them)
        const expenses = await Expense.find({
            supplier: supplier,
            category: { $in: ['Stock Purchase', 'Restocked'] }
        }).lean();

        // 2. Get Transactions (Returns) - DEBIT (We pay them back/reduce debt)
        const returns = await Transaction.find({
            partyName: supplier,
            type: 'return_to_supplier'
        }).lean();

        // 3. Get Payments - DEBIT (We pay them)
        const payments = await Payment.find({
            supplierName: supplier,
            type: 'pay_supplier'
        }).populate('paymentMethod', 'name').lean();

        // 4. Merge and Sort
        const ledger = [
            ...expenses.flatMap(e => {
                if (e.paidAmount !== undefined && e.paidAmount > 0 && e.paidAmount < e.amount) {
                    // Partial Split
                    return [
                        {
                            _id: e._id + '_paid', // Unique ID
                            date: e.date,
                            type: 'purchase',
                            description: e.title + ' (Paid)',
                            amount: e.paidAmount,
                            isCredit: true,
                            notes: e.notes || ''
                        },
                        {
                            _id: e._id + '_pending',
                            date: e.date,
                            type: 'purchase',
                            description: e.title + ' (Pending)',
                            amount: e.amount - e.paidAmount,
                            isCredit: true, // Still owes this part
                            notes: e.notes || ''
                        }
                    ];
                }

                // Normal (Full or Pending)
                let status = '';
                if (e.paidAmount !== undefined && e.paidAmount === 0) status = ' (Pending)';

                return [{
                    _id: e._id,
                    date: e.date,
                    type: 'purchase',
                    description: e.title + status,
                    amount: e.amount,
                    isCredit: true,
                    notes: e.notes || ''
                }];
            }),
            ...returns.map(t => ({
                _id: t._id,
                date: t.date,
                type: 'return',
                description: 'Return to Supplier',
                amount: t.totalAmount,
                isCredit: false, // We owe -
                notes: t.notes || ''
            })),
            ...payments.map(p => ({
                _id: p._id,
                date: p.date,
                type: 'payment',
                description: `Payment via ${p.paymentMethod?.name || 'Unknown'}`,
                amount: p.amount,
                isCredit: false, // We owe -
                notes: p.description
            }))
        ].sort((a, b) => new Date(b.date) - new Date(a.date));

        // Calculate Stats
        const totalPurchased = expenses.reduce((sum, item) => sum + item.amount, 0); // Total Credit
        const totalReturned = returns.reduce((sum, item) => sum + item.totalAmount, 0); // Total Debit
        const totalPaid = payments.reduce((sum, item) => sum + item.amount, 0); // Total Debit

        // Net Balance = Total Credit - Total Debit
        const currentBalance = totalPurchased - (totalReturned + totalPaid);

        res.json({
            success: true,
            data: {
                supplier,
                stats: {
                    totalPurchased,
                    totalReturned,
                    totalPaid,
                    currentBalance // Postive means we OWE them. Negative means they OWE us (unlikely but possible).
                },
                ledger
            }
        });
    } catch (error) {
        next(error);
    }
};

exports.getSupplierStats = async (req, res, next) => {
    try {
        const Expense = require('../models/Expense');
        // Fetch ALL relevant data
        const [expenses, returns, payments] = await Promise.all([
            Expense.find({
                category: { $in: ['Stock Purchase', 'Restocked'] },
                supplier: { $ne: null }
            }).lean(),
            Transaction.find({
                type: 'return_to_supplier'
            }).lean(),
            Payment.find({
                type: 'pay_supplier'
            }).lean()
        ]);

        const statsMap = {};

        // Helper to init
        const init = (name) => {
            if (!name) return;
            if (!statsMap[name]) {
                statsMap[name] = { name, totalPurchased: 0, totalReturned: 0, totalPaid: 0 };
            }
        };

        // 1. Process Expenses
        expenses.forEach(e => {
            init(e.supplier);
            if (e.supplier) statsMap[e.supplier].totalPurchased += e.amount;
        });

        // 2. Process Returns
        returns.forEach(t => {
            init(t.partyName);
            if (t.partyName) statsMap[t.partyName].totalReturned += t.totalAmount;
        });

        // 3. Process Payments
        payments.forEach(p => {
            init(p.supplierName);
            if (p.supplierName) statsMap[p.supplierName].totalPaid += p.amount;
        });

        // Convert to Array & Calculate Balance
        const report = Object.values(statsMap).map(s => ({
            ...s,
            currentBalance: s.totalPurchased - (s.totalReturned + s.totalPaid)
        })).sort((a, b) => a.name.localeCompare(b.name));

        res.json({ success: true, data: report });
    } catch (error) {
        next(error);
    }
};
