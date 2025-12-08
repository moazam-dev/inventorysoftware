const Log = require('../models/Log');
const Transaction = require('../models/Transaction');
const Expense = require('../models/Expense');

// Helper to get start/end of day
const getDayRange = (year, month, day) => {
    const start = new Date(year, month - 1, day, 0, 0, 0, 0);
    const end = new Date(year, month - 1, day, 23, 59, 59, 999);
    return { start, end };
};

exports.getYears = async () => {
    const yearlyData = await Log.aggregate([
        {
            $group: {
                _id: '$year',
                itemsSold: { $sum: '$itemsSold' },
                totalRevenue: { $sum: '$totalRevenue' },
                totalProfit: { $sum: '$totalProfit' }
            }
        },
        { $sort: { _id: -1 } }
    ]);
    return yearlyData;
};

exports.getMonthsByYear = async (year) => {
    const monthlyData = await Log.aggregate([
        { $match: { year: parseInt(year) } },
        {
            $group: {
                _id: "$month",
                itemsSold: { $sum: '$itemsSold' },
                totalRevenue: { $sum: '$totalRevenue' },
                totalExpenses: { $sum: '$totalExpenses' },
                totalProfit: { $sum: '$totalProfit' },
                itemsReturned: { $sum: '$itemsReturned' },
                totalLoss: { $sum: '$totalLoss' }
            }
        }
    ]);

    const fullMonths = [];
    const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    for (let i = 1; i <= 12; i++) {
        const found = monthlyData.find(m => m._id === i);
        fullMonths.push({
            month: i,
            name: monthNames[i - 1],
            itemsSold: found ? found.itemsSold : 0,
            totalRevenue: found ? found.totalRevenue : 0,
            totalExpenses: found ? found.totalExpenses : 0,
            totalProfit: found ? found.totalProfit : 0,
            itemsReturned: found ? found.itemsReturned : 0,
            totalLoss: found ? found.totalLoss : 0,
            hasData: !!found
        });
    }

    return fullMonths;
};

exports.getDaysByMonth = async (year, month) => {
    const logs = await Log.find({ year: parseInt(year), month: parseInt(month) }).sort({ day: 1 });
    return logs;
};

exports.getDayDetails = async (year, month, day) => {
    // 1. Get the Log for top-level stats
    const log = await Log.findOne({ year: parseInt(year), month: parseInt(month), day: parseInt(day) })
        .populate({
            path: 'transactions',
            populate: { path: 'items.product' }
        });

    // 2. Get Expenses for this day
    const { start, end } = getDayRange(year, month, day);
    const expenses = await Expense.find({
        date: { $gte: start, $lte: end }
    });

    // 3. Merge Transactions and Expenses
    let mergedList = [];

    if (log && log.transactions) {
        mergedList = log.transactions.map(t => t.toObject());
    }

    expenses.forEach(e => {
        mergedList.push({
            ...e.toObject(),
            type: 'expense', // Ensure consistency
            partyName: e.category, // Map category to partyName for UI consistency
            description: e.title, // Use title as description
            totalAmount: e.amount // Map amount
        });
    });

    // 4. Sort by date
    mergedList.sort((a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt));

    // 5. Structure return data
    // Calculate stats dynamically from the merged list
    let calcRevenue = 0;
    let calcExpenses = 0;

    mergedList.forEach(item => {
        if (item.type === 'sale') {
            calcRevenue += (item.totalAmount || 0);
        } else if (item.type === 'expense' || item.type === 'purchase') {
            calcExpenses += (item.amount || item.totalAmount || 0);
        } else if (item.type === 'return_from_customer') {
            calcRevenue -= (item.totalAmount || 0); // Refund reduces revenue
        } else if (item.type === 'return_to_supplier') {
            calcExpenses -= (item.totalAmount || 0); // Refund reduces expense
        }
    });

    // Ensure revenue and expenses never go negative
    calcRevenue = Math.max(0, calcRevenue);
    calcExpenses = Math.max(0, calcExpenses);

    // Calculate profit/loss properly
    const netResult = calcRevenue - calcExpenses;
    const calcProfit = netResult >= 0 ? netResult : 0;
    const calcLoss = netResult < 0 ? Math.abs(netResult) : 0;

    return {
        totalRevenue: Math.max(0, calcRevenue),
        totalExpenses: Math.max(0, calcExpenses),
        totalProfit: Math.max(0, calcProfit),
        totalLoss: Math.max(0, calcLoss),
        transactions: mergedList
    };
};

// NEW: Centralized Log Update Function
exports.updateDailyLog = async (dateObj, type, amount, itemCount = 0, transactionId = null) => {
    const year = dateObj.getFullYear();
    const month = dateObj.getMonth() + 1;
    const day = dateObj.getDate();
    const dateStr = dateObj.toISOString().split('T')[0];

    // Find or Create Log
    let log = await Log.findOne({ date: dateStr });
    if (!log) {
        log = new Log({ date: dateStr, year, month, day });
    }

    // Update Stats based on Type
    amount = Number(amount);
    itemCount = Number(itemCount);

    if (type === 'sale') {
        log.totalRevenue += amount;
        log.itemsSold += itemCount;
    } else if (type === 'expense' || type === 'purchase') {
        log.totalExpenses += amount;
    } else if (type === 'return_from_customer') {
        log.totalRevenue = Math.max(0, log.totalRevenue - amount);
        log.itemsReturned += itemCount;
    } else if (type === 'return_to_supplier') {
        log.totalExpenses = Math.max(0, log.totalExpenses - amount);
    }

    if (transactionId) {
        if (!log.transactions.includes(transactionId)) {
            log.transactions.push(transactionId);
        }
    }

    // Recalculate profit/loss ensuring no negative values
    log.totalRevenue = Math.max(0, log.totalRevenue);
    log.totalExpenses = Math.max(0, log.totalExpenses);

    const netResult = log.totalRevenue - log.totalExpenses;
    if (netResult >= 0) {
        log.totalProfit = netResult;
        log.totalLoss = 0;
    } else {
        log.totalProfit = 0;
        log.totalLoss = Math.abs(netResult);
    }
    log.totalLoss = (log.totalRevenue - log.totalExpenses) < 0 ? (log.totalExpenses - log.totalRevenue) : 0;

    await log.save();
    return log;
};

exports.searchLogs = async (query) => {
    const { q } = query;
    if (!q) return [];

    const transactions = await Transaction.find({
        $or: [
            { partyName: { $regex: q, $options: 'i' } },
            { notes: { $regex: q, $options: 'i' } },
            { _id: q.match(/^[0-9a-fA-F]{24}$/) ? q : null }
        ]
    }).populate('items.product').sort({ date: -1 }).limit(20);

    return transactions;
};
