'use strict'; 

var app = require('express')();
var path = require('path');
var session = require('express-session');
var User = require('../api/users/user.model');
var bodyParser = require("body-parser");
var passport = require("passport");
var env = require('../../env.json');

app.use(require('./logging.middleware'));
app.use(bodyParser.json())
app.use(bodyParser.urlencoded())


app.use(session({
    // this mandatory configuration ensures that session IDs are not predictable
    secret: 'tongiscool'
}));

app.use(passport.initialize());
app.use(passport.session());

  // don't forget to install passport-google-oauth
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
var TwitterStrategy = require('passport-twitter').Strategy;


passport.use(
    new GoogleStrategy({
        clientID: env.development.google_app_id,
        clientSecret: env.development.google_app_secret,
        callbackURL: 'http://127.0.0.1:8080/auth/google/callback'
    },
    // google will send back the token and profile
    function (token, refreshToken, profile, done) {
        //the callback will pass back user profilie information and each service (Facebook, Twitter, and Google) will pass it back a different way. Passport standardizes the information that comes back in its profile object.
        /*
        --- fill this part in --
        */
        User.findOne({ 'google.id' : profile.id }, function (err, user) {
            // if there is an error, stop everything and return that
            // ie an error connecting to the database
            if (err) return done(err);
            // if the user is found, then log them in
            if (user) {
                console.log('exists', user)
                return done(null, user); // user found, pass along that user
            } else {
                // if there is no user found with that google id, create them
                var newUser = new User();
                // set all of the google information in our user model
                newUser.google.id = profile.id; // set the users google id                   
                newUser.google.token = token; // we will save the token that google provides to the user                    
                newUser.google.name = profile.displayName; // look at the passport user profile to see how names are returned
                newUser.google.email = profile.emails[0].value; // google can return multiple emails so we'll take the first
                // don't forget to include the user's email, name, and photo
                newUser.email = newUser.google.email; // required field
                newUser.name = newUser.google.name; // nice to have
                newUser.photo = profile.photos[0].value; // nice to have
                // save our user to the database
                newUser.save(function (err) {
                    if (err) done(err);
                    // if successful, pass along the new user
                    else done(null, newUser);
                });
            }
        });
    })
);

passport.use(
    new TwitterStrategy({
        consumerKey: env.development.twitter_app_id,
        consumerSecret: env.development.twitter_app_secret,
        callbackURL: "http://127.0.0.1:8080/auth/twitter/callback"
  },
  function(token, tokenSecret, profile, done) {
        User.findOne({ 'twitter.id' : profile.id }, function (err, user) {
            // if there is an error, stop everything and return that
            // ie an error connecting to the database
            if (err) return done(err);
            // if the user is found, then log them in
            if (user) {
                console.log('exists', user)
                return done(null, user); // user found, pass along that user
            } else {
                // if there is no user found with that google id, create them
                var newUser = new User();
                // set all of the google information in our user model
                newUser.twitter.id = profile.id; // set the users google id                   
                newUser.twitter.token = token; // we will save the token that google provides to the user                    
                newUser.twitter.name = profile.displayName; // look at the passport user profile to see how names are returned
                newUser.twitter.email = profile.username + '@fake-email-address.com';
                 // don't forget to include the user's email, name, and photo
                newUser.email = newUser.twitter.email; // required field
                newUser.name = newUser.twitter.name; // nice to have
                newUser.photo = profile.photos[0].value; // nice to have
                // save our user to the database
                newUser.save(function (err) {
                    if (err) done(err);
                    // if successful, pass along the new user
                    else done(null, newUser);
                });
            }
        });
    })
);

passport.serializeUser(function (user, done) {
    done(null, user._id)
});

passport.deserializeUser(function (id, done) {
    User.findById(id, done);
});

//google authentication and login 
app.get('/auth/google', passport.authenticate('google', { scope : 'email' }));
//twitter authentication and login 
app.get("/auth/twitter", passport.authenticate("twitter"));

// handle the callback after google has authenticated the user
app.get('/auth/google/callback',
  passport.authenticate('google', {
    successRedirect : '/stories',
    failureRedirect : '/signup'
  })
);

app.get("/auth/twitter/callback",
    passport.authenticate("twitter", {
        successRedirect : '/stories',
        failureRedirect : '/signup'
    })
);

// //Log cookies
// app.use(function (req, res, next) {
// 	console.log(req.session)
// 	next();
// })

app.post('/login', function (req, res, next) {
    console.log('body',req.body)
    User.findOne({
        email: req.body.email,
        password: req.body.password
    })
    .exec()
    .then(function (user) {
        if (!user) {
            res.sendStatus(401);
        } else {
            req.session.userId = user._id;
            res.sendStatus(200);
        }
    })
    // .then(null, next);
});

app.put('/logout', function (req, res, next) {
    delete req.session.userId
    delete req.session.passport
    res.json({})
});

app.get('/validsession', function (req, res, next) {
    if(req.session.userId || req.session.passport) res.send(true)
        else res.send(false)
});


// app.use(require('./requestState.middleware'));

app.use(require('./statics.middleware'));

app.use('/api', require('../api/api.router'));

var validFrontendRoutes = ['/', '/stories', '/users', '/stories/:id', '/users/:id', '/signup', '/login'];
var indexPath = path.join(__dirname, '..', '..', 'public', 'index.html');
validFrontendRoutes.forEach(function (stateRoute) {
	app.get(stateRoute, function (req, res) {
        console.log('req.user',req.user.toString())
		res.sendFile(indexPath);
	});
});

app.use(require('./error.middleware'));

module.exports = app;