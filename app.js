require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const md5 = require("md5");

const app = express();

// console.log(process.env.SECRET);

app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));

mongoose.connect("mongodb://localhost:27017/userDB");

//user schema
const userSchema = new mongoose.Schema ({
    email: {
        type: String,
        require: "Please add a valid email address to proceed"
    },
    password: String
});

const User = new mongoose.model("User", userSchema);

app.get("/", function(req, res){
    res.render("home");
})

app.route("/login")
    .get(function(req, res){
        res.render("login");
    })

    .post(function(req, res){
        const userName = req.body.username;
        const password = md5(req.body.password);

        User.findOne({email: userName}, function(err, foundUser){
            if(!foundUser){
                res.send("Sorry, this email is not registered. Register or Try again.");
            } else {
                if(password === foundUser.password){
                    res.render("secrets");
                } else {
                    res.send("Incorrect password. Try again.");
                }
            }
        })
    });

app.route("/register")
    .get(function(req, res){
    
        res.render("register");
    })  

    .post(function(req, res){
        const newUser = new User ({
            email: req.body.username,
            password: md5(req.body.password)
        });

        newUser.save(function(err){
            if(err){
                console.log(err);
            } else {
                res.render("secrets");
            }
        });
        console.log("UN: " + req.body.username + " PW: " + md5(req.body.password));
    });


app.listen(3000, function(){
    console.log("SECRETS: server running on port 3000")
});