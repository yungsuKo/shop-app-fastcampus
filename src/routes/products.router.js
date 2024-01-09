const express = require('express');
const { getAllCategories } = require('../middlewares/product');
const router = express.Router();
const Product = require('../models/products.model');
const fs = require('fs-extra');

router.get('/', getAllCategories ,async (req, res, next) => {
    try{
        const products = await Product.find();
        res.render('products', {
            products: products,
        });
    }catch(err){
        console.log(err);
        next(err);
    }
    
})

router.get('/:category', getAllCategories, async(req, res, next) => {
    try{
        const products = await Product.find({
            category: req.params.category,
        });
        console.log(products);
        res.render('products', {
            products: products
        });
    } catch (err){
        console.log(err);
        next(err);
    }
})

router.get('/:category/:product', async(req, res, next) => {
    try{
        const product = await Product.findOne({slug: req.params.product});
        const galleryDir = 'src/public/product-images/'+product._id+'/gallery';
        const galleryImages = await fs.readdir(galleryDir);

        res.render('product', {
            product,
            galleryImages
        })
    }catch(err){
        console.log(err);
        next(err);
    }
})
module.exports = router