const transactionService = require('../services/transactionService');

exports.createSale = async (req, res, next) => {
    try {
        const transaction = await transactionService.createSale(req.body);
        res.status(201).json({ success: true, data: transaction });
    } catch (error) {
        next(error);
    }
};

exports.getTransaction = async (req, res, next) => {
    try {
        const transaction = await transactionService.getTransactionById(req.params.id);
        if (!transaction) {
            return res.status(404).json({ success: false, message: 'Transaction not found' });
        }
        res.json({ success: true, data: transaction });
    } catch (error) {
        next(error);
    }
};

exports.returnToSupplier = async (req, res, next) => {
    try {
        const transaction = await transactionService.createReturnToSupplier(req.body);
        res.status(201).json({ success: true, data: transaction });
    } catch (error) {
        next(error);
    }
};

exports.returnFromCustomer = async (req, res, next) => {
    try {
        const transaction = await transactionService.createReturnFromCustomer(req.body);
        res.status(201).json({ success: true, data: transaction });
    } catch (error) {
        next(error);
    }
};
