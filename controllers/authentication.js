//imports the model class
const User = require('../models/user');
const jwt = require('jwt-simple');
const config = require('../config');

//user model as arg
function tokenForUser(user) {
  const timestamp = new Date().getTime();
  //1st arg is info we want to encode, 2nd arg is secret string to encode
  //as a convention json web tokens (JWTs) have a sub property, sub is short for subject.
  //iat is also a JWT convention and stands for "issues at time"
  return jwt.encode({ sub: user.id, iat: timestamp }, config.secret);
}

exports.signin = function(req, res, next) {
  //User has already had their email and password auth'd, now they just need token
  //calls the tokenForUser method to send a token back to the user
  //req.user is available because the middleware passed the user model into the the done() method, which passport then placed that user model onto the req object
  res.send({ token: tokenForUser(req.user) });
};

exports.signup = function(req, res, next) {
  const email = req.body.email;
  const password = req.body.password;

  if (!email || !password) {
    return res.status(422).send({ error: 'You must provide email and password' });
  }

  // See if a user with a given email exists
  //existing user will be undefined unless there is already an instance of that e-mail in the database.
  //err will have a value if there was an issue connecting to the database or something similar
  User.findOne({ email: email }, function(err, existingUser) {
    //database error
    if (err) {
      return next(err);
    }

    //If user with email does exist, return an Error
    if (existingUser) {
      //returns an http status code of 422, unprocessable entity.
      return res.status(422).send({ error: 'Email is in use' });
    }

    //If a user with email does NOT exist, create and save user record
    const user = new User({
      email: email,
      password: password
    });

    user.save(function(err) {
      if (err) {
        return next(err);
      }
      //Respond to request indicating the user was created
      res.json({ token: tokenForUser(user) });
    });
  });
};
