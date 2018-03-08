const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcrypt-nodejs');

// Define our model
const userSchema = new Schema({
  //by using the unique: true property, before mongo will save the new input, it will confirm that it is the only instance of that e-mail within the document.
  //The lowercase true property is used because mongo is case sensitive when it looks for uniqueness, therefore if a user tries to create an account with a duplicate e-mail, but with all caps, mongo will accept it, which is not what we want. To avoid this, we set everything to lowercase.
  email: { type: String, unique: true, lowercase: true },
  password: String
});

// On Save Hook, encrypt password
//Before saving a model, run this function
userSchema.pre('save', function(next) {
  //gives access to the user model
  const user = this;

  //generate a salt then run callback
  //A salt is just a random string of characters
  bcrypt.genSalt(10, function(err, salt) {
    if (err) {
      return next(err);
    }
    //hash(encrypt) our password using the salt
    bcrypt.hash(user.password, salt, null, function(err, hash) {
      if (err) {
        return next(err);
      }

      //ovcerwrite plain text password with encrypted password
      //The encrypted password contains both a hash and a salt, they are distictevly different.
      user.password = hash;
      next();
    });
  });
});

//Whenever we create a user object, it will have access to any methods we define on this methods property.
userSchema.methods.comparePassword = function(candidatePassword, callback) {
  //this is a reference to our user model, so this.password stores the salted + hashed password
  //bcrypt is salting and hashing the candidate pw and then comparing it to the one we have in the record. It is not decoding the pw in the record to match the two string passwords.
  bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
    if (err) {
      return callback(err);
    }

    callback(null, isMatch);
  });
};

// Creates the model class, so that we can create new users
//This loads the Schema into mongoose. The first arg is the name of the mongo collection in which the Schema will be appliaed, the 2nd arg is the Schema that we just created above.
const ModelClass = mongoose.model('user', userSchema);

//Export the model
module.exports = ModelClass;
