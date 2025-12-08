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

exports.deleteExpense = async (req, res, next) => {
    try {
        const expense = await Expense.findById(req.params.id);
        if (!expense) {
            return res.status(404).json({ success: false, message: 'Expense not found' });
        }

        const expenseAmount = expense.amount;
        const expenseDate = new Date(expense.date);

        await Expense.findByIdAndDelete(req.params.id);

        // Revert Log Logic
        // We need to subtract the expenseAmount from totalExpenses and add it back to totalProfit.
        // We can reuse updateDailyLog but need to handle "reversion".
        // Or we pass a negative amount? 
        // Let's check updateDailyLog logic:
        // if type == expense: log.totalExpenses += amount; log.totalProfit -= amount;
        // If we pass NEGATIVE amount:
        // log.totalExpenses += (-amount)  => decreases expense. Correct.
        // log.totalProfit -= (-amount) => increases profit. Correct.

        await logService.updateDailyLog(expenseDate, 'expense', -expenseAmount);

        res.json({ success: true, message: 'Expense deleted' });
    } catch (error) {
        next(error);
    }
};
