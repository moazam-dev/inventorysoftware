const Expense = require('../models/Expense');
const logService = require('../services/logService');

exports.getAllExpenses = async (req, res, next) => {
    try {
        // We could add pagination/filtering later
        const expenses = await Expense.find().sort({ date: -1, createdAt: -1 });
        res.json({ success: true, data: expenses });
    } catch (error) {
        next(error);
    }
};

exports.createExpense = async (req, res, next) => {
    try {
        const expense = await Expense.create(req.body);

        // Update Log
        if (expense) {
            await logService.updateDailyLog(new Date(expense.date), 'expense', expense.amount);
        }

        res.status(201).json({ success: true, data: expense });
    } catch (error) {
        next(error);
    }
};
