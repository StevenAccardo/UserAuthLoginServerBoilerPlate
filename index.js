//Maining starting point of our server

const express = require('express');
const http = require('http');
const bodyParser = require('body-parser');
const morgan = require('morgan');
// App setup - express setup
const app = express();
const router = require('./router');
const mongoose = require('mongoose');

// DB Setup
//connects mongoose to our instance of mongoDB, which right now is on our local machine.
//The /auth portion is what creates a new Database inside of mongoDB named auth, if you wanted to change the name of it, you can do that there.
mongoose.connect('mongodb://localhost/auth');

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  // we're connected!
});

//express middlewares
//morgan is a logging framework, use it for debugging
app.use(morgan('combined'));
app.use(bodyParser.json({ type: '*/*' }));

router(app);

// Server setup

const port = process.env.PORT || 3090;

//http is a native node library
//sets up some low-level handling of http requests
//forwards any incoming requests onto app, our express instance.
const server = http.createServer(app);
server.listen(port);
console.log('Server listening on:', port);
