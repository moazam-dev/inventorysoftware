const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');

router.get('/top-products', analyticsController.getTopProducts);
router.get('/category-performance', analyticsController.getCategoryPerformance);
router.get('/sales-trends', analyticsController.getSalesTrends);

module.exports = router;
