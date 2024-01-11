const express = require('express');
const Product = require('../models/products.model');
const router = express.Router();

router.get('/checkout', async (req, res, next) => {
    res.render('checkout');
})

router.post('/:productId', async(req, res, next) => {
    const slug = req.params.productId;
    try{
        const product = await Product.find({slug: slug});
        if(!req.session.cart){
            req.session.cart = [];
            req.session.cart.push({
                title: slug,
                qty : 1,
                price : product[0].price,
                image : '/product-images/' + product[0]._id+'/'+product[0].image
            })
        }else {
            let cart= req.session.cart;
            let newItem = true;

            // 만약 이미 카트에 있는 상품이라면 한 개 추가하고 loop break
            for(let i = 0; i< cart.length; i++){
                console.log(cart);
                if(cart[i].title === slug){
                    cart[i].qty++;
                    newItem = false;
                    break;
                }
            }
            // 처음 추가
            if(newItem){
                cart.push({
                    title: slug,
                    qty : 1,
                    price : product[0].price,
                    image : '/product-images/' + product[0]._id+'/'+product[0].image
                })
            }
        }
        req.flash('success', '상품이 추가되었습니다.');
        res.redirect('back');
    }catch(err){
        console.log(err);
        next(err);
    }
});

router.get('/update/:product', async (req, res, next) => {
    const slug = req.params.product;
    const action = req.query.action;
    let cart = req.session.cart;
    
    for(let i = 0; i<cart.length; i++){
        if(cart[i].title === slug){
            console.log('activated');
            switch(action){
                case "add":
                    cart[i].qty++;
                    break;
                case "remove":
                    cart[i].qty--;
                    break;
                case "clear":
                    cart.splice(i, 1);
                    if(cart.length === 0){
                        delete req.session.cart;
                    }
                    break;
                default:
                    console.log('update problem');
                    break;
            }
        }
        break;
    }
    req.flash('success', '장바구니가 업데이트되었습니다.')
    res.redirect('back');
})

router.delete('/', async (req, res, next) => {
    delete req.session.cart;
    req.flash('success', '장바구니가 지워졌습니다.');
    res.redirect('back');
})

module.exports = router;