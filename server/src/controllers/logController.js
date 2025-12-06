const logService = require('../services/logService');

exports.getYears = async (req, res, next) => {
    try {
        const years = await logService.getYears();
        res.json({ success: true, data: years });
    } catch (error) {
        next(error);
    }
};

exports.getMonths = async (req, res, next) => {
    try {
        const months = await logService.getMonthsByYear(req.params.year);
        res.json({ success: true, data: months });
    } catch (error) {
        next(error);
    }
};

exports.getDays = async (req, res, next) => {
    try {
        const days = await logService.getDaysByMonth(req.params.year, req.params.month);
        res.json({ success: true, data: days });
    } catch (error) {
        next(error);
    }
};

exports.getDayDetails = async (req, res, next) => {
    try {
        const details = await logService.getDayDetails(req.params.year, req.params.month, req.params.day);
        res.json({ success: true, data: details });
    } catch (error) {
        next(error);
    }
};

exports.search = async (req, res, next) => {
    try {
        const results = await logService.searchLogs(req.query);
        res.json({ success: true, data: results });
    } catch (error) {
        next(error);
    }
};
