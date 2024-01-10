const express = require('express');
const Product = require('../models/products.model');
const router = express.Router();

router.post('/:productId', async(req, res, next) => {
    const slug = req.params.productId;
    try{
        const product = await Product.find({slug: slug});

        if(!req.session.cart){
            req.session.cart = [];
            req.session.cart.push({
                title: slug,
                qty : 1,
                price : product.price,
                image : '/product-images/' + product._id+'/'+product.image
            })
        }else {
            let cart= req.session.cart;
            let newItem = true;

            // 만약 이미 카트에 있는 상품이라면 한 개 추가하고 loop break
            for(let i = 0; i< cart.length; i++){
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
                    price : product.price,
                    image : '/product-images/' + product._id+'/'+product.image
                })
            }
        }
        req.flash('success', '상품이 추가되었습니다.');
        res.redirect('back');
    }catch(err){
        console.log(err);
        next(err);
    }
})

module.exports = router;