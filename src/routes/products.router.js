const express = require('express');
const { getAllCategories } = require('../middlewares/product');
const router = express.Router();
const Product = require('../models/products.model');

router.get('/', getAllCategories ,async (req, res, next) => {
    try{
        const products = await Product.find();
        res.render('product', {
            products: products,
        });
    }catch(err){
        console.log(err);
        next(err);
    }
    
})

module.exports = router