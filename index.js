// env variables
require('dotenv').config();




const express = require("express"),
bodyparser = require("body-parser"),
mongoose = require("mongoose"),
methodOverride = require("method-override"),
session = require('express-session'),
cookieParser = require('cookie-parser'),
flash = require('connect-flash'),
List = require("./models/list"),
User = require("./models/user"),
hostname = '127.0.0.1',
passport = require("passport"),
LocalStrategy = require("passport-local"),
middleware = require("./middleware");
port = 3000
app = express();




// necessary for mongodb, referencing CSS files
app.set("view engine", "ejs");
app.use(bodyparser.urlencoded({extended: true}));
mongoose.connect('mongodb://localhost:27017/wishlist_appv3', {useNewUrlParser: true});
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));


// // session for logging in
// // might also be needed for middleware?
// app.use(require("express-session")({
//     secret: "nadarangnanaman",
//     resave: false,
//     saveUninitialized: false
// }));

// for flash
app.use(cookieParser('secret'));
app.use(session({cookie: {maxAge: 60000}}));
app.use(flash());


app.use(function (req, res, next) {
  // flash a message
  req.flash('info', 'hello!');
  next();
})

// passport dependencies
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate())); // you can .authenticate because of plugin in user.js
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());



// global username
app.use(function(req, res, next){
    res.locals.currentUser = req.user;
    res.locals.flash_success = req.flash("success");
    res.locals.flash_error = req.flash("error");
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