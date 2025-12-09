const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load env vars
dotenv.config({ path: path.join(__dirname, '../.env') });

const CustomerSchema = new mongoose.Schema({
    name: String,
    phone: String,
    totalPurchased: Number,
    totalPaid: Number,
    currentBalance: Number
});

const Customer = mongoose.model('Customer', CustomerSchema);

const connectDB = async () => {
    try {
        const uri = process.env.MONGO_URI.replace('inventorydbTest', 'inventorydb');
        console.log('Connecting to:', uri);
        await mongoose.connect(uri);
        console.log('MongoDB Connected');

        // List collections to verify we are in the right DB
        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log('Collections in DB:', collections.map(c => c.name));

        // Count customers
        const count = await Customer.countDocuments();
        console.log('Total Customers:', count);

        // Search for Qasim
        const qusim = await Customer.find({ name: { $regex: 'qasim', $options: 'i' } });
        console.log('--- Searching for Qasim ---');
        console.log(JSON.stringify(qusim, null, 2));

        // List all to be sure
        const all = await Customer.find({});
        console.log(`--- All Customers (${all.length}) ---`);
        all.forEach(c => {
            console.log(`${c.name} | Phone: "${c.phone}" | ID: ${c._id}`);
        });

        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

connectDB();
