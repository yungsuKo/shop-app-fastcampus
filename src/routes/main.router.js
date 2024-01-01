const express = require('express');
const { checkNotAuthenticated } = require('../middlewares/auth');
const router = express.Router();

router.get('/', (req, res) => {
    console.log(req.user);
    res.redirect('/products');
});

router.get('/login', checkNotAuthenticated, (req, res) => {
    res.render('auth/login');
});

router.get('/signup', checkNotAuthenticated, (req, res) => {
    res.render('auth/signup');
});

module.exports = router;