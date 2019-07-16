// env variables
require('dotenv').config();


const express = require("express"),
app = express(),
bodyparser = require("body-parser"),
mongoose = require("mongoose"),
// models
methodOverride = require("method-override"),
List = require("./models/list"),
User = require("./models/user"),
hostname = '127.0.0.1',
passport = require("passport"),
LocalStrategy = require("passport-local"),
middleware = require("./middleware");
port = 3000;



// most necessary
app.set("view engine", "ejs");
app.use(bodyparser.urlencoded({extended: true}));
mongoose.connect('mongodb://localhost:27017/wishlist_appv3', {useNewUrlParser: true});
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));


// session for logging in
// might also be needed for middleware?
app.use(require("express-session")({
    secret: "nadarangnanaman",
    resave: false,
    saveUninitialized: false
}));


// passport dependencies
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate())); // you can .authenticate because of plugin in user.js
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());



// global username
app.use(function(req, res, next){
    res.locals.currentUser = req.user;
    next();
});




/// routes
loginRoutes = require("./routes/login");
listRoutes = require("./routes/lists");



app.use("/", loginRoutes);
app.use("/", listRoutes);




app.listen(port, hostname, function(){
	console.log("app listening...");
});