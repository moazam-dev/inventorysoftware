const analyticsService = require('../services/analyticsService');

exports.getTopProducts = async (req, res, next) => {
    try {
        const days = parseInt(req.query.days) || 30;
        const data = await analyticsService.getTopProducts(days);
        res.json({ success: true, data });
    } catch (error) {
        next(error);
    }
};

exports.getCategoryPerformance = async (req, res, next) => {
    try {
        const days = parseInt(req.query.days) || 30;
        const data = await analyticsService.getCategoryPerformance(days);
        res.json({ success: true, data });
    } catch (error) {
        next(error);
    }
};

exports.getSalesTrends = async (req, res, next) => {
    try {
        const days = parseInt(req.query.days) || 30;
        const data = await analyticsService.getSalesTrends(days);
        res.json({ success: true, data });
    } catch (error) {
        next(error);
    }
};
