const express = require('express');
const app = express();
const PORT = 3000;
const path = require('path');
const { default: mongoose } = require('mongoose');
const bodyParser = require('body-parser');
const User = require('./models/users.model');
const passport = require('passport');
const cookieSession = require('cookie-session');
const {
  checkAuthenticated,
  checkNotAuthenticated,
} = require('./middlewares/auth');
require('dotenv').config();
const flash = require('connect-flash');

const mainRouter = require('./routes/main.router');
const usersRouter = require('./routes/users.router');
const productsRouter = require('./routes/products.router');
const cartRouter = require('./routes/cart.router');
const adminCategoriesRouter = require('./routes/admin-categories.router');
const adminProductsRouter = require('./routes/admin-products.router');

app.use(
  cookieSession({
    name: 'cookie-session-name',
    keys: [process.env.COOKIE_KEY],
  })
);
app.use(passport.initialize());
app.use(passport.session());
app.use(function (request, response, next) {
  if (request.session && !request.session.regenerate) {
    request.session.regenerate = (cb) => {
      cb();
    };
  }

  if (request.session && !request.session.save) {
    request.session.save = (cb) => {
      cb();
    };
  }

  next();
});
require('./config/passport');

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use( express.static(path.join(__dirname, 'public')));
// view engine setup
app.set('views', path.join(__dirname, '/views'));
app.set('view engine', 'ejs');
app.use(flash());

mongoose
  .connect(`${process.env.MONGO_URL}`)
  .then(() => {
    console.log('mongodb connected');
  })
  .catch((err) => {
    console.log(err);
  });

app.use((req, res, next) => {
  res.locals.error = req.flash('error');
  res.locals.success = req.flash('success');
  res.locals.currentUser = req.user;
  console.log(req.user);
  next();
})
app.use('/', mainRouter);
app.use('/auth', usersRouter);
app.use('/admin/categories', adminCategoriesRouter);
app.use('/admin/products', adminProductsRouter);
app.use('/products', productsRouter);
app.use('/cart', cartRouter);

app.use((err, req, res, next) => {
  res.status(err.status || 500);
  res.send(err.message || '에러가 났습니다.');
})

app.post('/logout', (req, res) => {
  req.logOut(function (err) {
    if (err) return next(err);
    res.redirect('/login');
  });
});

app.listen(PORT, () => {
  console.log(`Listening on ${PORT}`);
});
