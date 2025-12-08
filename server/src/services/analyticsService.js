const Transaction = require('../models/Transaction');
const Product = require('../models/Product');
const Expense = require('../models/Expense');

// Get top performing products by revenue
exports.getTopProducts = async (days = 30) => {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const topProducts = await Transaction.aggregate([
        {
            $match: {
                type: 'sale',
                date: { $gte: startDate }
            }
        },
        { $unwind: '$items' },
        {
            $group: {
                _id: '$items.product',
                totalRevenue: { $sum: { $multiply: ['$items.quantity', '$items.price'] } },
                totalQuantity: { $sum: '$items.quantity' },
                productName: { $first: '$items.productName' }
            }
        },
        { $sort: { totalRevenue: -1 } },
        { $limit: 10 },
        {
            $lookup: {
                from: 'products',
                localField: '_id',
                foreignField: '_id',
                as: 'productDetails'
            }
        },
        {
            $project: {
                productName: { $ifNull: ['$productName', { $arrayElemAt: ['$productDetails.name', 0] }] },
                totalRevenue: 1,
                totalQuantity: 1,
                costPrice: { $arrayElemAt: ['$productDetails.costPrice', 0] },
                salePrice: { $arrayElemAt: ['$productDetails.salePrice', 0] }
            }
        }
    ]);

    // Calculate profit margin for each product
    const productsWithMargin = topProducts.map(p => {
        const cost = p.costPrice || 0;
        const price = p.salePrice || 0;
        const margin = price > 0 ? ((price - cost) / price * 100) : 0;
        return {
            ...p,
            profitMargin: Math.round(margin)
        };
    });

    return productsWithMargin;
};

// Get category performance metrics
exports.getCategoryPerformance = async (days = 30) => {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get sales by category
    const categorySales = await Transaction.aggregate([
        {
            $match: {
                type: 'sale',
                date: { $gte: startDate }
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
                revenue: { $sum: { $multiply: ['$items.quantity', '$items.price'] } },
                quantitySold: { $sum: '$items.quantity' },
                avgCost: { $avg: '$productInfo.costPrice' },
                avgPrice: { $avg: '$items.price' }
            }
        }
    ]);

    // Get current stock by category
    const categoryStock = await Product.aggregate([
        {
            $group: {
                _id: '$category',
                totalStock: { $sum: '$quantity' }
            }
        }
    ]);

    // Merge and calculate metrics
    const performance = categorySales.map(cat => {
        const stock = categoryStock.find(s => s._id === cat._id);
        const turnoverRate = stock?.totalStock > 0 ? (cat.quantitySold / stock.totalStock * 100) : 0;
        const profit = (cat.avgPrice - cat.avgCost) * cat.quantitySold;

        return {
            category: cat._id || 'Uncategorized',
            revenue: Math.max(0, cat.revenue),
            profit: Math.max(0, profit),
            quantitySold: cat.quantitySold,
            turnoverRate: Math.round(turnoverRate),
            currentStock: stock?.totalStock || 0
        };
    });

    return performance.sort((a, b) => b.revenue - a.revenue);
};

// Get sales trends (last 12 months)
exports.getSalesTrends = async () => {
    const trends = [];
    const today = new Date();

    for (let i = 11; i >= 0; i--) {
        const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
        const monthStart = new Date(date.getFullYear(), date.getMonth(), 1, 0, 0, 0);
        const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59);

        // Get sales revenue
        const sales = await Transaction.aggregate([
            {
                $match: {
                    type: 'sale',
                    date: { $gte: monthStart, $lte: monthEnd }
                }
            },
            {
                $group: {
                    _id: null,
                    revenue: { $sum: '$totalAmount' }
                }
            }
        ]);

        // Get expenses
        const expenses = await Expense.aggregate([
            {
                $match: {
                    date: { $gte: monthStart, $lte: monthEnd }
                }
            },
            {
                $group: {
                    _id: null,
                    totalExpenses: { $sum: '$amount' }
                }
            }
        ]);

        const revenue = Math.max(0, sales[0]?.revenue || 0);
        const expense = Math.max(0, expenses[0]?.totalExpenses || 0);
        const profit = Math.max(0, revenue - expense);

        trends.push({
            date: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`,
            label: date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
            revenue: revenue,
            expenses: expense,
            profit: profit
        });
    }

    return trends;
};

module.exports = exports;
