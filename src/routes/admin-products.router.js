const express = require('express');
const { checkAdmin } = require('../middlewares/auth');
const Category = require('../models/categories.model');
const router = express.Router();

router.get('/add-product', checkAdmin,async(req, res) => {
    try{
        const categories = await Category.find();
        res.render('admin/add-product', {
            categories: categories
        })
    }catch(error){
        console.log(error);
        next(error);
    }
})

module.exports = router;