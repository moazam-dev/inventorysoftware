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
    const monthlyRevenue = Math.max(0, grossRevenue - monthlyReturnsFromCustomer);

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
    const monthlyExpenses = Math.max(0, grossExpenses - monthlyReturnsToSupplier);

    // 3. Calculate Monthly Profit (Revenue - COGS - Expenses)
    const salesTransactions = await Transaction.find({
        type: 'sale',
        date: { $gte: currentMonthStart, $lte: currentMonthEnd }
    }).populate('items.product');

    let totalCOGS = 0;
    salesTransactions.forEach(txn => {
        txn.items.forEach(item => {
            // Simplified COGS calculation
        });
    });

    // 3. Calculate Monthly Profit & Loss
    const netResult = monthlyRevenue - monthlyExpenses;
    let monthlyProfit = 0;
    let monthlyLoss = 0;

    if (netResult >= 0) {
        monthlyProfit = netResult;
        monthlyLoss = 0;
    } else {
        monthlyProfit = 0;
        monthlyLoss = Math.abs(netResult);
    }

    return {
        monthlyRevenue: Math.max(0, monthlyRevenue),
        monthlyProfit: Math.max(0, monthlyProfit),
        monthlyExpenses: Math.max(0, monthlyExpenses),
        monthlyLoss: Math.max(0, monthlyLoss)
    };
};

exports.getDashboardTrend = async () => {
    // Get last 12 months
    const months = [];
    for (let i = 11; i >= 0; i--) {
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
        expenses: []
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

        // Expenses
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
    }

    return trendData;
};

exports.getStockOverview = async () => {
    // Get current stock by category
    const stock = await Product.aggregate([
        {
            $group: {
                _id: '$category',
                totalStock: { $sum: '$quantity' },
                totalValue: { $sum: { $multiply: ['$quantity', '$costPrice'] } }
            }
        }
    ]);

    // Get sold items by category (current month)
    const currentMonthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const currentMonthEnd = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0);

    const salesByCategory = await Transaction.aggregate([
        {
            $match: {
                type: 'sale',
                date: { $gte: currentMonthStart, $lte: currentMonthEnd }
            }
        },
        { $unwind: '$items' },
        {
            $lookup: {
                from: 'products',
                localField: 'items.product',
                foreignField: '_id',
                as: 'productInfo'
            }
        },
        { $unwind: { path: '$productInfo', preserveNullAndEmptyArrays: true } },
        {
            $group: {
                _id: '$productInfo.category',
                totalSold: { $sum: '$items.quantity' }
            }
        }
    ]);

    // Merge stock and sold data
    const categoryMap = new Map();

    stock.forEach(item => {
        categoryMap.set(item._id, {
            _id: item._id,
            totalStock: item.totalStock,
            totalValue: item.totalValue,
            totalSold: 0
        });
    });

    salesByCategory.forEach(item => {
        if (item._id) {
            if (categoryMap.has(item._id)) {
                categoryMap.get(item._id).totalSold = item.totalSold;
            } else {
                categoryMap.set(item._id, {
                    _id: item._id,
                    totalStock: 0,
                    totalValue: 0,
                    totalSold: item.totalSold
                });
            }
        }
    });

    return Array.from(categoryMap.values());
};
