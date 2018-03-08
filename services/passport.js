const passport = require('passport');
const User = require('../models/user');
const config = require('../config');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const LocalStrategy = require('passport-local');

//Create the local Strategy
//LocalStrategy assumes it is going to be passed a user name and password, by default. So we have to tell it that instead of a username, to use an email.
const localOptions = { usernameField: 'email' };
//After LocalStrategy parses the request, it will pass the email and password into the callback function
const localLogin = new LocalStrategy(localOptions, function(email, password, done) {
  //Verify email and PW are stored in DB, call done with the user record
  User.findOne({ email: email }, function(err, user) {
    //if error when trying to access Database
    if (err) {
      return done(err);
    }

    //If not stored in the DB call done with false
    if (!user) {
      return done(null, false);
    }

    //if record was found with matching email, now match password from request with password in record
    //comparePassword method was added to the userSchema in the user.js file, so it is available on the returned record
    user.comparePassword(password, function(err, isMatch) {
      if (err) {
        return done(err);
      }
      if (!isMatch) {
        return done(null, false);
      }

      //assigns the user model that was pulled from the DB to req.user
      return done(null, user);
    });
  });
});

//Setup options for JWT JWTStrategy
//JWTs can sit anywhere in a request, header, body, and etc.
const jwtOptions = {
  //Tells the JwtStrategy where to look for the token on the request, in this case in the header title authorization
  jwtFromRequest: ExtractJwt.fromHeader('authorization'),
  //gives the JwtStrategy the secret that it will need to decode the payload
  secretOrKey: config.secret
};

//Create JWT Strategy
//1st arg, payload, is the decoded JWT token, it will be the object we created earlier on the initial signup with the sub and iat properties.
//2nd arg, done, is a call back function that we need to call if we successfully authenticate the user
const jwtLogin = new JwtStrategy(jwtOptions, function(payload, done) {
  //See if the user ID in payload exists in our Database
  //err is only returned with a value if there is an error, otherwise it is null
  //user would be the record that was found during the query
  User.findById(payload.sub, function(err, user) {
    //if error, return error and done is false
    if (err) {
      return done(err, false);
    }
    //If it does, call 'done' with that user object
    //if user record exists, err is null and pass done the record
    if (user) {
      //assigns the user model that was pulled from the DB to req.user
      done(null, user);
      //otherwise, call done without a user object
      //if user is not found, err is null because there wasn't error, but done is passed false instead
    } else {
      done(null, false);
    }
  });
});

//Tell passport to use these strategies
passport.use(jwtLogin);
passport.use(localLogin);
