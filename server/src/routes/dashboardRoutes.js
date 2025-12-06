const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');

router.get('/summary', dashboardController.getSummary);
router.get('/stock', dashboardController.getStockOverview);
router.get('/trend', dashboardController.getTrend);

module.exports = router;
