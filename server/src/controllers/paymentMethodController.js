const PaymentMethod = require('../models/PaymentMethod');
const Payment = require('../models/Payment'); // To show ledger for a method

exports.createPaymentMethod = async (req, res, next) => {
    try {
        const { name, type, details, accountNumber } = req.body;
        const method = await PaymentMethod.create({ name, type, details, accountNumber });
        res.status(201).json({ success: true, data: method });
    } catch (error) {
        next(error);
    }
};

exports.getPaymentMethods = async (req, res, next) => {
    try {
        const methods = await PaymentMethod.find({ isActive: true }).sort({ name: 1 });
        res.json({ success: true, data: methods });
    } catch (error) {
        next(error);
    }
};

exports.updatePaymentMethod = async (req, res, next) => {
    try {
        const method = await PaymentMethod.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json({ success: true, data: method });
    } catch (error) {
        next(error);
    }
};

exports.getPaymentMethodLedger = async (req, res, next) => {
    const methodId = req.params.id;
    try {
        const method = await PaymentMethod.findById(methodId);
        if (!method) return res.status(404).json({ success: false, message: 'Method not found' });

        const payments = await Payment.find({ paymentMethod: methodId })
            .sort({ date: -1 })
            .lean();

        // We could also calculate balance here if we want to verify 'currentBalance' field

        res.json({
            success: true,
            data: {
                method,
                payments
            }
        });
    } catch (error) {
        next(error);
    }
};
