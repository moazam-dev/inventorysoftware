const express = require('express');
const router = express.Router();
const logController = require('../controllers/logController');

router.get('/years', logController.getYears);
router.get('/:year', logController.getMonths);
router.get('/:year/:month', logController.getDays);
router.get('/:year/:month/:day', logController.getDayDetails);
router.get('/search', logController.search);

module.exports = router;
