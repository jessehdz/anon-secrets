require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const passportLocalMongoose = require("passport-local-mongoose");
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const findOrCreate = require("mongoose-findorcreate");


const app = express();

app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));

app.use(session({
    secret: "Our little secret.",
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

// app.use(passport.initialize());
// app.use(passport.session());

mongoose.connect("mongodb://localhost:27017/userDB");

//user schema
const userSchema = new mongoose.Schema ({
    email: {
        type: String,
        require: "Please add a valid email address to proceed"
    },
    password: String,
    googleId: String
});

//plugin to hash and salt passwords and save users to the DB
userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);

const User = new mongoose.model("User", userSchema);

passport.use(new LocalStrategy (User.authenticate()));

// passport.serializeUser(User.serializeUser());
passport.serializeUser(function(user, cb) {
    process.nextTick(function() {
        cb(null, { id: user.id, username: user.username, name: user.displayName });
    });
});

// passport.deserializeUser(User.deserializeUser());
passport.deserializeUser(function(user, cb) {
    process.nextTick(function() {
        return cb(null, user);
    });
});


passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/google/secrets"
},
    function(accessToken, refreshToken, profile, cb) {
        console.log(profile);
        console.log(profile.id);
        
        User.findOrCreate({ googleId: profile.id }, 
            function (err, user) {
                return cb(err, user);
            });
    }
));

app.get("/", function(req, res){
    res.render("home");
});

app.get("/auth/google", passport.authenticate("google", { scope: ['https://www.googleapis.com/auth/plus.login',
'https://www.googleapis.com/auth/userinfo.email'] }));

app.get("/auth/google/secrets", passport.authenticate("google", { failureRedirect: "/login" }), 
function(req, res) {
    // Successful authentication, redirect to secrets page.
    res.redirect("/secrets");
});

app.route("/login")
    .get(function(req, res){
        res.render("login");
    })

    .post(function(req, res){
        const user = new User ({
            username: req.body.username,
            password: req.body.password
        });

        req.login(user, function(err){
            if(err){
                console.log(err)
            } else {
                passport.authenticate("local")(req, res, function(){
                    res.redirect("/secrets");
                })
            }
        })

    });

app.route("/register")
    .get(function(req, res){
    
        res.render("register");
    })  

    .post(function(req, res){
        User.register({username: req.body.username}, req.body.password, function(err, user){
            if(err){
                console.log(err);
                res.redirect("/register");
            } else {
                passport.authenticate("local")(req, res, function(){
                    res.redirect("/secrets")
                })
            }
        })
    });

    app.route("/secrets")
        .get(function(req, res){
            if (req.isAuthenticated()){
                res.render("secrets");
            } else {
                res.redirect("/login");
            }
        });

    app.get("/logout", function(req, res){
        req.logout();
        res.redirect("/")
    })

app.listen(3000, function(){
    console.log("SECRETS: server running on port 3000")
});