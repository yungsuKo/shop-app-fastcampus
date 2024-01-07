const express = require('express');
const { checkAdmin } = require('../middlewares/auth');
const Category = require('../models/categories.model');
const Product = require('../models/products.model');
const router = express.Router();
const fs = require('fs-extra');
const ResizeImg = require('resize-img');

router.get('/', checkAdmin, async(req, res, next) => {
    try{
        const products = await Product.find();
        res.render('admin/products', {
            products: products
        })
    }catch(err){
        console.log(err);
        next(err);
    }
})

router.get('/add-product', checkAdmin,async(req, res, next) => {
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

router.post('/', checkAdmin, async (req, res, next) => {
    // const imageFile = typeof req.files?.image !== "undefined" ? req.files.image.name : "";
    const imageFile = req.files.image.name;
    const {title, desc, price, category} = req.body;
    const slug = title.replace(/\s+/g, '-').toLowerCase();

    try{
        // 데이터 저장해주기
        const newProduct = new Product({
            title, desc, price, category,
            image: imageFile,
        })
        await newProduct.save();

        // 파일 경로 생성하기
        await fs.mkdirp('src/public/product-images/' + newProduct._id);
        await fs.mkdirp('src/public/product-images/' + newProduct._id + '/gallery');
        await fs.mkdirp('src/public/product-images/' + newProduct._id + '/gallery/thumbs');

        // 이미지 파일을 폴더에 넣기
        if(imageFile !== ""){
            const productImage = req.files.image;
            const path = 'src/public/product-images/' + newProduct._id + '/' + imageFile;
            await productImage.mv(path);
        }
        
        req.flash('success', '상품이 정상적으로 추가되었습니다.');
        res.redirect('/admin/products');

    }catch(err){
        console.log(err);
        next(err);
    }
})

router.delete('/:id', checkAdmin, async(req, res, next) => {
    const id = req.params.id;
    const path = 'src/public/product-images' + id;
    try{
        await fs.remove(path);
        await Product.findByIdAndRemove(id);
        req.flash('success', '성공적으로 삭제가 되었습니다.');
        res.redirect('back');
    }catch(err){
        console.log(err);
        next(err);
    }
});

router.get('/:id/edit', checkAdmin, async (req, res, next) => {
    try{
        const {_id, title, desc, category, price, image} = await Product.findById(req.params.id);
        const categories = await Category.find();
        const galleryDir = 'src/public/product-images/'+_id+'/gallery';
        const galleryImages = await fs.readdir(galleryDir);

        res.render('admin/edit-product', {
            title: title,
            desc: desc,
            categoryS: category.replace(/\s+/g, '-').toLowerCase(),
            price: price,
            image: image,
            galleryImages: galleryImages,
            id: _id,
            categories: categories
        });
    }catch(err){
        console.log(err);
        next(err);
    }
})

router.post('/product-gallery/:id', checkAdmin, async(req, res, next) => {
    const imageFile = req.files.file.name;
    const productImage = req.files.file;
    const path = 'src/public/product-images/' + req.params.id + '/gallery/' + imageFile;
    const thumbPath = 'src/public/product-images/' + req.params.id + '/gallery/thumbs/' + imageFile;
    try{
        await productImage.mv(path);
        const buf = await ResizeImg(fs.readFileSync(path), {width: 100, height: 100});
        fs.writeFileSync(thumbPath, buf);
        res.sendStatus(200);
    }catch(err){
        console.log(err);
        next(err);
    }
})

router.put('/:id', checkAdmin, async(req, res) => {
    try{
        await Product.findByIdAndUpdate(req.params.id, req.body);
        req.flash('success', '수정이 정상적으로 되었습니다.');
    }catch(err){
        console.log(err);
        next(err);
    }
})

module.exports = router;