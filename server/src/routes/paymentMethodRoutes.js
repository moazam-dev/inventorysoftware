const express = require('express');
const router = express.Router();
const paymentMethodController = require('../controllers/paymentMethodController');

router.post('/', paymentMethodController.createPaymentMethod);
router.get('/', paymentMethodController.getPaymentMethods);
router.put('/:id', paymentMethodController.updatePaymentMethod);
router.get('/:id/ledger', paymentMethodController.getPaymentMethodLedger);

module.exports = router;
