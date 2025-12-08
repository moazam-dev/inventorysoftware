const productService = require('../services/productService');
const transactionService = require('../services/transactionService');

exports.getProducts = async (req, res, next) => {
    try {
        const result = await productService.getAllProducts(req.query);
        res.json({ success: true, data: result });
    } catch (error) {
        next(error);
    }
};

exports.getProduct = async (req, res, next) => {
    try {
        const product = await productService.getProductById(req.params.id);
        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }
        res.json({ success: true, data: product });
    } catch (error) {
        next(error);
    }
};



exports.createProduct = async (req, res, next) => {
    try {
        const { quantity, costPrice, supplier, paidAmount, paymentMethod, notes, ...productData } = req.body;

        // 1. Create Product (Initialize with 0 quantity to avoid double counting)
        // We will add the quantity via the Purchase transaction.
        // We MUST include costPrice here as it is required by the model.
        const product = await productService.createProduct({ ...productData, costPrice, quantity: 0 });

        // 2. If initial quantity provided, create a Purchase Transaction
        if (quantity && Number(quantity) > 0) {
            await transactionService.createPurchase({
                product: product._id,
                quantity: Number(quantity),
                costPrice: Number(costPrice),
                supplier: supplier,
                paidAmount: Number(paidAmount),
                paymentMethod: paymentMethod,
                notes: notes || 'Initial Stock'
            });

            // Reload product to get updated quantity
            const updatedProduct = await productService.getProductById(product._id);
            return res.status(201).json({ success: true, data: updatedProduct });
        }

        res.status(201).json({ success: true, data: product });
    } catch (error) {
        next(error);
    }
};

exports.updateProduct = async (req, res, next) => {
    try {
        const product = await productService.updateProduct(req.params.id, req.body);
        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }
        res.json({ success: true, data: product });
    } catch (error) {
        next(error);
    }
};

exports.deleteProduct = async (req, res, next) => {
    try {
        const product = await productService.deleteProduct(req.params.id);
        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }
        res.json({ success: true, message: 'Product deleted' });
    } catch (error) {
        next(error);
    }
};

exports.getCategories = async (req, res, next) => {
    try {
        const categories = await productService.getAllCategories();
        res.json({ success: true, data: categories });
    } catch (error) {
        next(error);
    }
};

exports.createCategory = async (req, res, next) => {
    try {
        const category = await productService.createCategory(req.body);
        res.status(201).json({ success: true, data: category });
    } catch (error) {
        next(error);
    }
};

exports.createProductsBulk = async (req, res, next) => {
    try {
        const { products, supplier, paidAmount, paymentMethod, notes } = req.body;
        // products: [{ name, category, sku, costPrice, salePrice, quantity, description }]

        if (!products || products.length === 0) {
            return res.status(400).json({ success: false, message: 'No products provided' });
        }

        const purchaseItems = [];
        const createdProducts = [];

        for (const prodData of products) {
            const { quantity, costPrice, ...rest } = prodData;

            // 1. Create Product (qty 0)
            // Include costPrice in creation validation, but quantity 0
            const product = await productService.createProduct({
                ...rest,
                costPrice: Number(costPrice),
                quantity: 0,
                supplier // Tag with the bulk supplier
            });

            createdProducts.push(product);

            // 2. Prepare Item for Purchase
            if (quantity && Number(quantity) > 0) {
                purchaseItems.push({
                    product: product._id,
                    quantity: Number(quantity),
                    costPrice: Number(costPrice)
                });
            }
        }

        // 3. Create Bulk Purchase Transaction
        if (purchaseItems.length > 0) {
            await transactionService.createPurchase({
                items: purchaseItems,
                supplier,
                paidAmount: Number(paidAmount),
                paymentMethod,
                notes: notes || 'Bulk Initial Stock'
            });
        }

        res.status(201).json({ success: true, data: createdProducts, message: 'Products created and stock added successfully' });
    } catch (error) {
        next(error);
    }
};
