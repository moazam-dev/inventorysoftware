const express = require('express');
const router = express.Router();
const ledgerController = require('../controllers/ledgerController');

router.get('/suppliers', ledgerController.getSuppliers);
router.get('/:supplier', ledgerController.getSupplierLedger);

module.exports = router;
