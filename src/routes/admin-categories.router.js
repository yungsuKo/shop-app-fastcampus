const express = require('express');
const { checkAdmin } = require('../middlewares/auth');
const Category = require('../models/categories.model');
const router = express.Router();

router.get('/', checkAdmin, async(req, res) => {
    try{
        const categories = await Category.find();
        res.render('admin/categories', {
            categories: categories
        });
    }catch(error){
        console.log(error);
        next(error);
    }
    
})

router.get('/add-category', checkAdmin, async(req, res) => {
    res.render('admin/add-category');
})

router.post('/add-category', checkAdmin, async(req, res) => {
    try {
        const title = req.body.title;
        const slug = title.replace(/\s+/g, '-').toLowerCase();
        const category = await Category.findOne({slug: slug});
        if(category) {
            req.flash('error', '이미 존재하는 카테고리 입니다. 다른 카테고리를 선택해주세요.');
            res.render('admin/add-category', {
                title: title
            })
        }
        const newCategory = new Category({
            title: title,
            slug: slug
        });
        await newCategory.save();
        req.flash('success', '카테고리가 추가되었습니다.');
        res.redirect('/admin/categories');
    }catch(err){
        console.log(err);
        next(err);
    }
})

router.get('/delete-category/:id', async(req, res) => {
    try{
        await Category.findByIdAndDelete(req.params.id);
        req.flash('success', '삭제가 완료되었습니다.');
        res.redirect('back');
    }catch(error){
        console.log(error);
        next(error);
    }
    
})

module.exports = router;