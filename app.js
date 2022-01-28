const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");

const app = express();

app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));

mongoose.connect("mongodb://localhost:27017/userDB");

//user schema
const userSchema = {
    email: {
        type: String,
        require: "Please add a valid email address to proceed"
    },
    password: String
};

const User = new mongoose.model("User", userSchema);

app.get("/", function(req, res){
    res.render("home");
})

app.get("/login", function(req, res){
    
    res.render("login");
})

app.route("/register")
    .get(function(req, res){
    
        res.render("register");
    })  

    .post(function(req, res){
        const newUser = new User ({
            email: req.body.username,
            password: req.body.password
        });

        newUser.save(function(err){
            if(err){
                console.log(err);
            } else {
                res.render("secrets");
            }
        });
        console.log("UN: " + req.body.username + " PW: " + req.body.password);
    })


app.listen(3000, function(){
    console.log("SECRETS: server running on port 3000")
});