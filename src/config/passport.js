const passport = require('passport');
const User = require('../models/users.model');
const LocalStrategy = require('passport-local').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;

// logIn 사용할 때 실행됨
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  console.log('eeeeee');
  User.findById(id).then((user) => {
    done(null, user);
  });
});

passport.use(
  new LocalStrategy(
    { usernameField: 'email', passwordField: 'password' },
    async (email, password, done) => {
      console.log('haha');
      const user = await User.findOne({ email: email.toLocaleLowerCase() });
      if (!user)
        return done(null, false, { msg: `Email ${email} does not found` });

      user.comparePassword(password, (err, isMatch) => {
        if (err) return done(err);
        if (isMatch) {
          return done(null, user);
        }
        return done(null, err);
      });
    }
  )
);

const googleClientID = `${process.env.GOOGLE_CLIENT_ID}`;
const googleClientSecret = `${process.env.GOOGLE_CLIENT_SECRET}`;

const googleStrategyConfig = new GoogleStrategy(
  {
    clientID: googleClientID,
    clientSecret: googleClientSecret,
    callbackURL: '/auth/google/callback',
    scope: ['email', 'profile'],
  },
  async (accessToken, refreshToken, profile, done) => {
    console.log(profile);
    const user = await User.findOne({ googleId: profile.id });
    console.log('user :', user);
    return done(null, user);
    if (user) {
    } else {
      const user = new User();
      user.email = profile.emails[0].value;
      user.googleId = profile.id;
      user.save();
      if (user) {
        done(null, user);
      } else {
        done('err');
      }
    }
  }
);
passport.use('google', googleStrategyConfig);

module.exports = passport;
