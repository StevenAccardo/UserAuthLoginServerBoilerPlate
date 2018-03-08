//routes the incoming requests to their corresponding controllers

const Authentication = require('./controllers/authentication');
const passportService = require('./services/passport');
const passport = require('passport');

//The session: false property stops passport from making a cookie based session for the login request, which is default functionality for passport. Since we are using tokens, we don't want that.
//The first arg is the strategey we are using
const requireAuth = passport.authenticate('jwt', { session: false });
const requireSignin = passport.authenticate('local', { session: false });

module.exports = function(app) {
  //any post request from /signup will be handled by the signup function in the authentication controller file
  app.get('/', requireAuth, function(req, res) {
    res.send({ hi: 'there' });
  });
  //requires the request to go through middleware, where the user will have to be authenticated via requireSignin before it is passed to the route handler Authentication.signin
  app.post('/signin', requireSignin, Authentication.signin);
  app.post('/signup', Authentication.signup);
};
