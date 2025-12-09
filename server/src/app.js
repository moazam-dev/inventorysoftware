const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const connectDB = require('./config/db');
const dotenv = require("dotenv")



// Connect to Database
connectDB();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));

const dashboardRoutes = require('./routes/dashboardRoutes');
const productRoutes = require('./routes/productRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const logRoutes = require('./routes/logRoutes');
const expenseRoutes = require('./routes/expenseRoutes');

// Routes
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/products', productRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/logs', logRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/ledger', require('./routes/ledgerRoutes'));
app.use('/api/analytics', require('./routes/analyticsRoutes'));
app.use('/api/customers', require('./routes/customerRoutes'));
app.use('/api/payment-methods', require('./routes/paymentMethodRoutes'));
app.use('/api/payments', require('./routes/paymentRoutes'));


app.get('/', (req, res) => {
    res.send('Inventory API is running...');
});

app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
});

// Error Handling Middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: err.message || 'Server Error'
    });
});

module.exports = app;
