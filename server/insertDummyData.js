// Script to insert dummy data for dashboard charts
// Run with: node insertDummyData.js

const mongoose = require('mongoose');

// MongoDB connection URI - update if your connection string is different
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/inventory_db';

async function insertDummyData() {
    try {
        // Connect to MongoDB
        console.log('Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('✓ Connected to MongoDB');

        const db = mongoose.connection.db;

        // 1. Clear existing test data (optional - uncomment if needed)
        // await db.collection('transactions').deleteMany({});
        // await db.collection('expenses').deleteMany({});

        // 2. Insert dummy transactions (sales) for last 12 months
        console.log('Inserting transactions...');
        await db.collection('transactions').insertMany([
            {
                type: 'sale',
                date: new Date('2025-01-15'),
                totalAmount: 120000,
                partyName: 'Customer A',
                items: [
                    { productName: 'Suit A', quantity: 10, price: 5000 },
                    { productName: 'Kurti B', quantity: 15, price: 3000 }
                ],
                notes: 'January sales'
            },
            {
                type: 'sale',
                date: new Date('2025-02-12'),
                totalAmount: 150000,
                partyName: 'Customer B',
                items: [
                    { productName: 'Abaya C', quantity: 20, price: 4000 },
                    { productName: 'Party Wear D', quantity: 10, price: 7000 }
                ],
                notes: 'February sales'
            },
            {
                type: 'sale',
                date: new Date('2025-03-20'),
                totalAmount: 200000,
                partyName: 'Customer C',
                items: [
                    { productName: 'Suit A', quantity: 25, price: 5000 },
                    { productName: 'Winter Coat', quantity: 15, price: 5000 }
                ],
                notes: 'March sales'
            },
            {
                type: 'sale',
                date: new Date('2025-04-10'),
                totalAmount: 180000,
                partyName: 'Customer D',
                items: [
                    { productName: 'Kurti B', quantity: 30, price: 3000 },
                    { productName: 'Suit A', quantity: 12, price: 5000 }
                ],
                notes: 'April sales'
            },
            {
                type: 'sale',
                date: new Date('2025-05-18'),
                totalAmount: 220000,
                partyName: 'Customer E',
                items: [
                    { productName: 'Party Wear D', quantity: 20, price: 7000 },
                    { productName: 'Abaya C', quantity: 15, price: 4000 }
                ],
                notes: 'May sales'
            },
            {
                type: 'sale',
                date: new Date('2025-06-22'),
                totalAmount: 250000,
                partyName: 'Customer F',
                items: [
                    { productName: 'Suit A', quantity: 30, price: 5000 },
                    { productName: 'Kurti B', quantity: 20, price: 5000 }
                ],
                notes: 'June sales'
            },
            {
                type: 'sale',
                date: new Date('2025-07-08'),
                totalAmount: 210000,
                partyName: 'Customer G',
                items: [
                    { productName: 'Winter Coat', quantity: 25, price: 5000 },
                    { productName: 'Party Wear D', quantity: 11, price: 5500 }
                ],
                notes: 'July sales'
            },
            {
                type: 'sale',
                date: new Date('2025-08-14'),
                totalAmount: 230000,
                partyName: 'Customer H',
                items: [
                    { productName: 'Abaya C', quantity: 35, price: 4000 },
                    { productName: 'Suit A', quantity: 18, price: 5000 }
                ],
                notes: 'August sales'
            },
            {
                type: 'sale',
                date: new Date('2025-09-19'),
                totalAmount: 240000,
                partyName: 'Customer I',
                items: [
                    { productName: 'Kurti B', quantity: 40, price: 3000 },
                    { productName: 'Party Wear D', quantity: 15, price: 7000 }
                ],
                notes: 'September sales'
            },
            {
                type: 'sale',
                date: new Date('2025-10-21'),
                totalAmount: 260000,
                partyName: 'Customer J',
                items: [
                    { productName: 'Suit A', quantity: 32, price: 5000 },
                    { productName: 'Winter Coat', quantity: 20, price: 5500 }
                ],
                notes: 'October sales'
            },
            {
                type: 'sale',
                date: new Date('2025-11-11'),
                totalAmount: 280000,
                partyName: 'Customer K',
                items: [
                    { productName: 'Party Wear D', quantity: 25, price: 7000 },
                    { productName: 'Abaya C', quantity: 20, price: 5250 }
                ],
                notes: 'November sales'
            },
            {
                type: 'sale',
                date: new Date('2025-12-08'),
                totalAmount: 215000,
                partyName: 'Customer L',
                items: [
                    { productName: 'Suit A', quantity: 28, price: 5000 },
                    { productName: 'Kurti B', quantity: 17, price: 5000 }
                ],
                notes: 'December sales'
            }
        ]);

        console.log("✓ Transactions inserted");

        // 3. Insert dummy expenses for last 12 months
        console.log('Inserting expenses...');
        await db.collection('expenses').insertMany([
            { date: new Date('2025-01-15'), amount: 90000, category: 'Stock Purchase', title: 'Suits and Kurtis', notes: 'January stock' },
            { date: new Date('2025-02-12'), amount: 110000, category: 'Stock Purchase', title: 'Abayas and Party Wear', notes: 'February stock' },
            { date: new Date('2025-03-20'), amount: 140000, category: 'Stock Purchase', title: 'Mixed inventory', notes: 'March stock' },
            { date: new Date('2025-04-10'), amount: 160000, category: 'Stock Purchase', title: 'Suits restocking', notes: 'April stock' },
            { date: new Date('2025-05-18'), amount: 180000, category: 'Stock Purchase', title: 'Party wear collection', notes: 'May stock' },
            { date: new Date('2025-06-22'), amount: 210000, category: 'Stock Purchase', title: 'Summer collection', notes: 'June stock' },
            { date: new Date('2025-07-08'), amount: 160000, category: 'Stock Purchase', title: 'Winter preparation', notes: 'July stock' },
            { date: new Date('2025-08-14'), amount: 200000, category: 'Stock Purchase', title: 'Mixed inventory', notes: 'August stock' },
            { date: new Date('2025-09-19'), amount: 210000, category: 'Stock Purchase', title: 'Kurtis and Party Wear', notes: 'September stock' },
            { date: new Date('2025-10-21'), amount: 220000, category: 'Stock Purchase', title: 'Winter collection', notes: 'October stock' },
            { date: new Date('2025-11-11'), amount: 230000, category: 'Stock Purchase', title: 'Party wear restocking', notes: 'November stock' },
            { date: new Date('2025-12-08'), amount: 121500, category: 'Stock Purchase', title: 'Year-end inventory', notes: 'December stock' }
        ]);

        console.log("✓ Expenses inserted");
        console.log("\n✓ Dummy data inserted successfully!");
        console.log("Now refresh your dashboard to see the charts updated.");

    } catch (error) {
        console.error('Error inserting dummy data:', error);
        process.exit(1);
    } finally {
        // Close the connection
        await mongoose.connection.close();
        console.log('✓ Connection closed');
    }
}

// Run the function
insertDummyData();
