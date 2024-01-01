const express = require('express');
const { checkNotAuthenticated } = require('../middlewares/auth');
const passport = require('passport');
const User = require('../models/users.model');
const router = express.Router();


router.post('/login', (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
        if (err) {
        return next(err);
        }
        if (!user) {
        return res.json({ msg: info });
        }
        req.logIn(user, function (err) {
        if (err) return next(err);
        res.redirect('/products');
        });
    })(req, res, next);
});

router.get('/google', passport.authenticate('google'), () => {});

router.get(
  '/google/callback',
  passport.authenticate('google', {
    successReturnToOrRedirect: '/products',
    failureRedirect: '/login',
  })
);

router.post('/signup', async (req, res, next) => {
  // user 객체를 생성함
  const user = new User(req.body);
  try {
    // user 컬렉션에 유저를 저장
    await user.save();
    res.redirect('/login');
  } catch (err) {
    console.log(err);
  }
});



module.exports = router;