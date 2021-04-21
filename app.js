const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const ejs = require('ejs');
const passport = require('passport');
const passportLocalMongoose = require("passport-local-mongoose");
const session = require('express-session');
const { Passport } = require("passport");


const app = express();
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(session({
    secret: 'secret',
    resave: false,
    saveUninitialized: true,
}))
app.use(passport.initialize());
app.use(passport.session());
mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);

mongoose.connect("mongodb://127.0.0.1:27017/authenticationDB", { useNewUrlParser: true, useUnifiedTopology: true }, function () {
    console.log("mongoDB sucesse connection");
});

const accountSchema = new mongoose.Schema({
    email: String,
    password: String
})
// hash password
accountSchema.plugin(passportLocalMongoose);

const Account = mongoose.model("Account", accountSchema);

passport.use(Account.createStrategy());
passport.serializeUser(Account.serializeUser());
passport.deserializeUser(Account.deserializeUser());

app.route("/").
    get(function (req, res) {
        res.render("home")
    })
    .post(function (req, res) {
        res.send('Add a book')
    })
    ;
app.route("/register").
    get(function (req, res) {
        res.render("register")
    })
    .post(function (req, res) {
        Account.register({ username: req.body.username }, req.body.password, function (err) {
            if (err) {
                console.log(err);
                res.redirect("/register")
            } else {
                passport.authenticate("local")(req,res,function(){
                    res.redirect("/secrets")
                });
            }
        })
    })
    ;
app.route("/login").
    get(function (req, res) {
        res.render("login")
    })
    .post(function (req, res) {
        const user = new Account({
            username:req.body.username,
            password:req.body.password
        })
        req.login(user,function(err){
            if(err){
                console.log(err);
            } else{
                passport.authenticate("local")(req,res,function(){
                    res.redirect("/secrets")
                }
                );}
        });
    })
    ;

app.route("/secrets").
    get(function (req, res) {
        if(req.isAuthenticated()){
            res.render("secrets");
        } else{
            res.redirect("/login");
        }
    })
    ;
app.route("/logout").
    get(function (req, res) {
        req.logout();
        res.redirect("/");
    })
    ;
app.route("/submit").
    get(function (req, res) {
        res.render("submit")
    })
    ;



const port = 3000;
app.listen(port, () => {
    console.log(`listening at http://localhost:${port}`)
})