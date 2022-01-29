require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const app = express();

app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));

mongoose.connect("mongodb://localhost:27017/userDB");

const saltRounds = 10;
const myPlaintextPassword = 's0/\/\P4$$w0rD';
const someOtherPlaintextPassword = 'not_bacon';

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
        const password = req.body.password;

        User.findOne({email: userName}, function(err, foundUser){
            if(!foundUser){
                res.send("Sorry, this email is not registered. Register or Try again.");
            } else {
                bcrypt.compare(password, foundUser.password, function(err, foundPassword){
                    if(foundPassword){
                        res.render("secrets");
                        
                    } else {
                        res.send("Incorrect password. Try again.");
                        
                    }
                })
            }
        })
    });

app.route("/register")
    .get(function(req, res){
    
        res.render("register");
    })  

    .post(function(req, res){

        const email = req.body.username;
        const password = req.body.password;

        bcrypt.hash(password, saltRounds, function(err, hash){
            if (!err){
                const newUser = new User ({
                    email: email,
                    password: hash
                }); 
                console.log("UN: " + email + " PW: " + hash);

                newUser.save(function(err){
                    if(err){
                        console.log(err);
                    } else {
                        res.render("secrets");
                    }
                });
            } else {
                res.send(err);
            }
            
        })

    });


app.listen(3000, function(){
    console.log("SECRETS: server running on port 3000")
});