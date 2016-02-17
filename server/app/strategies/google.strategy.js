var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

passport.use(
    new GoogleStrategy({
        clientID: '397769699190-lcb9lrph6tcnakmlffq280n8eb2p913p.apps.googleusercontent.com',
        clientSecret: 'azHqcaX9yhtmeQecJmh8IL1U',
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