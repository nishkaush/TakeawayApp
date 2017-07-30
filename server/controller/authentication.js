require("dotenv").config({
    path: "myvariables.env"
});

const session = require("express-session");
const passport = require("passport");
const bcrypt = require("bcryptjs");
const LocalStrategy = require("passport-local").Strategy;
const FacebookStrategy = require("passport-facebook").Strategy;
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;


var mongoose = require("../models/users").mongoose;
var Users = require("../models/users").Users;


//passport is asked to store userID in the sessions object
// this will be used while signing up or loggin
passport.serializeUser((user, done) => {
    done(null, user._id);
});

// passport is asked to get user from db by userID stored in the sessions object, this is used in accessing different pages of the website
passport.deserializeUser((id, done) => {
    Users.findById(id, (err, user) => {
        done(err, user);
    });
});



// ###############   SIGNUP STRATEGY    ###############

// creating a middleware that will help in authenticating signup
passport.use("local-signup", new LocalStrategy({
    usernameField: "email",
    passwordField: "password",
    passReqToCallback: true //this gives "req obj" to callback on next line
}, (req, email, password, done) => {
    Users.findOne({
        email: email
    }, (err, user) => {
        if (err) {
            return done(err);
        }
        if (user) {
            return done(null, false, {
                message: "email already exists"
            });
        }

        // hash password first
        bcrypt.genSalt(10, (err, salt) => {
            if (err) {
                return err;
            }
            bcrypt.hash(password, salt, (err, hash) => {
                var newUser = new Users({
                    email: email,
                    password: hash,
                    localName: req.body.username
                });
                newUser.save();

                done(null, newUser, {
                    message: `Welcome ${newUser.localName}`
                });
            });

        });


    });
}));





// ################### LOGIN STRATEGY ##########################

passport.use("local-login", new LocalStrategy({
    usernameField: "email",
    passwordField: "password",
    passReqToCallback: true
}, (req, email, password, done) => {
    Users.findOne({
        email: email
    }, (err, user) => {
        if (err) {
            return done(err);
        }
        if (!user) {
            return done(null, false, {
                message: "no account exists, please signup"
            });
        }

        // compare hashed password from db with the provided password
        bcrypt.compare(password, user.password, (err, resp) => {
            if (err) {
                return done(err);
            }
            if (resp === true) {
                return done(null, user, {
                    message: `Welcome back ${user.localName}`
                });
            }
            return done(null, false, {
                message: "wrong password"
            });
        });
    });

}));




// ###################  FACEBOOK STRATEGY  ####################

passport.use("facebook", new FacebookStrategy({
    clientID: process.env.fbId,
    clientSecret: process.env.fbSecret,
    callbackURL: `http://localhost:3000/auth/facebook/callback`,
    profileFields: ["id", "email", "displayName"]
}, (accessToken, refreshToken, profile, done) => {
    Users.findOne({
        fbId: profile.id
    }, (err, user) => {
        if (err) {
            return done(err);
        }
        if (user) {
            return done(null, user, {
                message: `Welcome Back ${user.fbName}`
            });
        } else {
            let newUser = new Users({
                email: profile.emails[0].value,
                fbId: profile.id,
                fbName: profile.displayName
            });
            newUser.save();
            return done(null, newUser, {
                message: `Welcome ${newUser.fbName}`
            });
        }

    });

}));




// ###################  GOOGLE STRATEGY  ####################

passport.use("google", new GoogleStrategy({
    clientID: process.env.googleID,
    clientSecret: process.env.googleSecret,
    callbackURL: "http://localhost:3000/auth/google/callback"
}, (accessToken, refreshToken, profile, done) => {
    // use the profile id coming back from google to check db
    Users.findOne({
        googleId: profile.id
    }, (err, user) => {
        if (err) {
            return done(err);
        }
        // if user exists, log them in
        if (user) {
            done(null, user, {
                message: `Welcome back ${user.googleName}`
            });
        }
        // if no user then sign them up and save the user in db
        let newUser = new Users({
            email: profile.emails[0].value,
            googleName: profile.displayName,
            googleId: profile.id
        });
        newUser.save();
        return done(null, newUser, {
            message: `Welcome ${newUser.googleName}`
        });
    });
}));
