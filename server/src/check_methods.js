const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const PaymentMethodSchema = new mongoose.Schema({
    name: String,
    accountNumber: String,
    details: String
}, { strict: false });

const PaymentMethod = mongoose.model('PaymentMethod', PaymentMethodSchema);

const checkMethods = async () => {
    try {
        const uri = process.env.MONGO_URI.replace('inventorydbTest', 'inventorydb');
        await mongoose.connect(uri);
        console.log('Connected to:', uri);

        const methods = await PaymentMethod.find({});
        console.log('Payment Methods:', JSON.stringify(methods, null, 2));

        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

checkMethods();
