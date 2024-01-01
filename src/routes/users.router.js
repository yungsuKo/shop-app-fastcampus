const express = require('express');
const { checkNotAuthenticated } = require('../middlewares/auth');
const passport = require('passport');
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
        res.redirect('/');
        });
    })(req, res, next);
});

router.get('/google', passport.authenticate('google'), () => {});

router.get(
  '/google/callback',
  passport.authenticate('google', {
    successReturnToOrRedirect: '/',
    failureRedirect: '/login',
  })
);



module.exports = router;