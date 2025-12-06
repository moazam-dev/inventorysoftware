const mongoose = require('mongoose');
const dotenv = require('dotenv');
const connectDB = require('../config/db');
const Product = require('../models/Product');
const Category = require('../models/Category');

dotenv.config({ path: './.env' }); // Adjust path if running from root or src

const categories = [
    { name: 'Suits', description: 'Women suits' },
    { name: 'Kurtis', description: 'Casual and formal kurtis' },
    { name: 'Abayas', description: 'Modest wear' },
    { name: 'Party Wear', description: 'Fancy dresses' },
    { name: 'Winter Collection', description: 'Warm clothes' }
];

const products = [
    {
        name: 'Embroidered Lawn Suit',
        category: 'Suits',
        sku: 'SUIT-001',
        costPrice: 2500,
        salePrice: 3500,
        quantity: 25,
        description: '3-piece lawn suit'
    },
    {
        name: 'Cotton Kurti',
        category: 'Kurtis',
        sku: 'KURTI-001',
        costPrice: 1200,
        salePrice: 1800,
        quantity: 40,
        description: 'Printed cotton kurti'
    }
];

const importData = async () => {
    try {
        await connectDB();

        await Product.deleteMany();
        await Category.deleteMany();

        console.log('Data Destroyed...');

        await Category.insertMany(categories);
        console.log('Categories Imported...');

        await Product.insertMany(products);
        console.log('Products Imported...');

        process.exit();
    } catch (error) {
        console.error(`${error}`);
        process.exit(1);
    }
};

const destroyData = async () => {
    try {
        await connectDB();
        await Product.deleteMany();
        await Category.deleteMany();
        console.log('Data Destroyed...');
        process.exit();
    } catch (error) {
        console.error(`${error}`);
        process.exit(1);
    }
};

if (process.argv[2] === '-d') {
    destroyData();
} else {
    importData();
}
