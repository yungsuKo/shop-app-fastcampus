const express = require('express');
const app = express();
const PORT = 4000;
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

app.use('/static', express.static(path.join(__dirname, 'public')));
// view engine setup
app.set('views', path.join(__dirname, '/views'));
app.set('view engine', 'ejs');

mongoose
  .connect(`${process.env.MONGO_URL}`)
  .then(() => {
    console.log('mongodb connected');
  })
  .catch((err) => {
    console.log(err);
  });

app.get('/', checkAuthenticated, (req, res) => {
  console.log(req.user);
  res.render('index');
});
app.get('/login', checkNotAuthenticated, (req, res) => {
  res.render('login');
});
app.post('/login', (req, res, next) => {
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

app.get('/auth/google', passport.authenticate('google'), () => {});
app.get(
  '/auth/google/callback',
  passport.authenticate('google', {
    successReturnToOrRedirect: '/',
    failureRedirect: '/login',
  })
);

app.get('/signup', checkNotAuthenticated, (req, res) => {
  res.render('signup');
});
app.post('/signup', async (req, res, next) => {
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
app.post('/logout', (req, res) => {
  req.logOut(function (err) {
    if (err) return next(err);
    res.redirect('/login');
  });
});

app.listen(PORT, () => {
  console.log(`Listening on ${PORT}`);
});
