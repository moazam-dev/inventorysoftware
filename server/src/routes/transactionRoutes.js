const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');

router.post('/sale', transactionController.createSale);
router.post('/return-to-supplier', transactionController.returnToSupplier);
router.post('/return-from-customer', transactionController.returnFromCustomer);
router.get('/:id', transactionController.getTransaction);

module.exports = router;
