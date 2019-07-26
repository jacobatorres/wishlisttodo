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
Item = require("./models/item"),
hostname = '127.0.0.1',
passport = require("passport"),
LocalStrategy = require("passport-local"),
middleware = require("./middleware");
port = 3000,
app = express();


var jsdom;
try {
  jsdom = require("jsdom/lib/old-api.js"); // jsdom >= 10.x
} catch (e) {
  jsdom = require("jsdom"); // jsdom <= 9.x
}

// necessary for mongodb, referencing CSS files
app.set("view engine", "ejs");

app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));
app.use(bodyparser.urlencoded({extended: true}));
mongoose.connect('mongodb+srv://yelpcamp:sOxDnj88nH5DmsNY@cluster0-hqj8a.mongodb.net/test?retryWrites=true&w=majority', {
  useNewUrlParser: true,
  useCreateIndex: true
}).then(() => {
  console.log("connected to DB");
}).catch(err => {
  console.log('ERROR:', err.message);
});



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
userProfileRoutes = require("./routes/users");
itemRoutes = require("./routes/items");

app.use("/", loginRoutes);
app.use("/", listRoutes);
app.use("/", userProfileRoutes);
app.use("/", itemRoutes);


// for any invalid link
app.get("/*", function(req, res){
	req.flash("error", "Invalid link -- sending you back to /lists");
	return res.redirect("/lists");
})



app.listen(process.env.PORT || 5000, process.env.IP, function(){
	console.log("app listening...");
});