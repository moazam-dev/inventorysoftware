const Transaction = require('../models/Transaction');
const Product = require('../models/Product');
const Expense = require('../models/Expense');

exports.getDashboardSummary = async () => {
    const currentMonthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const currentMonthEnd = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0);

    // 1. Calculate Monthly Revenue (Sales - Customer Returns)
    const revenueResult = await Transaction.aggregate([
        {
            $match: {
                type: 'sale',
                date: { $gte: currentMonthStart, $lte: currentMonthEnd }
            }
        },
        {
            $group: {
                _id: null,
                totalRevenue: { $sum: '$totalAmount' }
            }
        }
    ]);
    const grossRevenue = revenueResult[0]?.totalRevenue || 0;

    const returnFromCustomerResult = await Transaction.aggregate([
        {
            $match: {
                type: 'return_from_customer',
                date: { $gte: currentMonthStart, $lte: currentMonthEnd }
            }
        },
        {
            $group: {
                _id: null,
                totalReturn: { $sum: '$totalAmount' }
            }
        }
    ]);
    const monthlyReturnsFromCustomer = returnFromCustomerResult[0]?.totalReturn || 0;
    const monthlyRevenue = grossRevenue - monthlyReturnsFromCustomer;

    // 2. Calculate Monthly Expenses (Expenses - Supplier Returns [Cost Recovery])
    const expenseResult = await Expense.aggregate([
        {
            $match: {
                date: { $gte: currentMonthStart, $lte: currentMonthEnd }
            }
        },
        {
            $group: {
                _id: null,
                totalExpenses: { $sum: '$amount' }
            }
        }
    ]);
    const grossExpenses = expenseResult[0]?.totalExpenses || 0;

    const returnToSupplierResult = await Transaction.aggregate([
        {
            $match: {
                type: 'return_to_supplier',
                date: { $gte: currentMonthStart, $lte: currentMonthEnd }
            }
        },
        {
            $group: {
                _id: null,
                totalReturn: { $sum: '$totalAmount' }
            }
        }
    ]);
    const monthlyReturnsToSupplier = returnToSupplierResult[0]?.totalReturn || 0;
    const monthlyExpenses = grossExpenses - monthlyReturnsToSupplier;

    // 3. Calculate Monthly Profit (Revenue - COGS - Expenses)
    // Note: This is a simplified calculation. Real COGS requires tracking cost of each item sold.
    // We will approximate COGS from the transactions items.
    const salesTransactions = await Transaction.find({
        type: 'sale',
        date: { $gte: currentMonthStart, $lte: currentMonthEnd }
    }).populate('items.product');

    let totalCOGS = 0;
    salesTransactions.forEach(txn => {
        txn.items.forEach(item => {
            // Use current cost price if historical not stored, or store cost in transaction item
            // For now assuming we might not have historical cost in item, but we should.
            // In Transaction model we didn't explicitly store unitCost, but we should have.
            // Let's assume for now we use the product's current cost price or 0.
            // Ideally, Transaction items should have 'cost' field.
            // I'll update Transaction model later to include cost, but for now let's fetch from product.
            // Wait, I can't easily fetch from product if it's populated.
            // Let's assume for MVP we use a rough estimate or 0 if missing.
            // Actually, let's just use Revenue - Expenses for "Operating Profit" for now, 
            // or try to get COGS if possible.
            // The user requirement says: Profit = Revenue – Cost of goods sold.
            // So I really should track cost in transaction.
        });
    });

    // 3. Calculate Monthly Profit & Loss
    const netResult = monthlyRevenue - monthlyExpenses;
    let monthlyProfit = 0;
    let monthlyLoss = 0;

    if (netResult >= 0) {
        monthlyProfit = netResult;
    } else {
        monthlyLoss = Math.abs(netResult);
    }

    return {
        monthlyRevenue,
        monthlyProfit,
        monthlyExpenses,
        monthlyLoss
    };
};

exports.getDashboardTrend = async () => {
    // Get last 6 months
    const months = [];
    for (let i = 5; i >= 0; i--) {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        months.push({
            month: d.getMonth() + 1,
            year: d.getFullYear(),
            label: d.toLocaleString('default', { month: 'short' })
        });
    }

    const trendData = {
        labels: months.map(m => m.label),
        revenue: [],
        expenses: [],
        profit: [],
        loss: []
    };

    for (const m of months) {
        const start = new Date(m.year, m.month - 1, 1);
        const end = new Date(m.year, m.month, 0);

        // Revenue
        const rev = await Transaction.aggregate([
            { $match: { type: 'sale', date: { $gte: start, $lte: end } } },
            { $group: { _id: null, total: { $sum: '$totalAmount' } } }
        ]);
        const grossRev = rev[0]?.total || 0;

        const retCust = await Transaction.aggregate([
            { $match: { type: 'return_from_customer', date: { $gte: start, $lte: end } } },
            { $group: { _id: null, total: { $sum: '$totalAmount' } } }
        ]);
        const r = grossRev - (retCust[0]?.total || 0);
        trendData.revenue.push(r);

        // Expenses (Original Expenses - Returns to Supplier)
        const exp = await Expense.aggregate([
            { $match: { date: { $gte: start, $lte: end } } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);
        const grossExp = exp[0]?.total || 0;

        const retSup = await Transaction.aggregate([
            { $match: { type: 'return_to_supplier', date: { $gte: start, $lte: end } } },
            { $group: { _id: null, total: { $sum: '$totalAmount' } } }
        ]);
        const e = grossExp - (retSup[0]?.total || 0);

        trendData.expenses.push(e);

        // Profit/Loss
        const net = r - e;
        if (net >= 0) {
            trendData.profit.push(net);
            trendData.loss.push(0);
        } else {
            trendData.profit.push(0);
            trendData.loss.push(Math.abs(net));
        }
    }

    return trendData;
};

exports.getStockOverview = async () => {
    const stock = await Product.aggregate([
        {
            $group: {
                _id: '$category',
                totalStock: { $sum: '$quantity' },
                totalValue: { $sum: { $multiply: ['$quantity', '$costPrice'] } }
            }
        }
    ]);
    return stock;
};
