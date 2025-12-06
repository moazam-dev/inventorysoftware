const dashboardService = require('../services/dashboardService');

exports.getSummary = async (req, res, next) => {
    try {
        const summary = await dashboardService.getDashboardSummary();
        res.json({ success: true, data: summary });
    } catch (error) {
        next(error);
    }
};

exports.getStockOverview = async (req, res, next) => {
    try {
        const overview = await dashboardService.getStockOverview();
        res.json({ success: true, data: overview });
    } catch (error) {
        next(error);
    }
};

exports.getTrend = async (req, res, next) => {
    try {
        const trend = await dashboardService.getDashboardTrend();
        res.json({ success: true, data: trend });
    } catch (error) {
        next(error);
    }
};
