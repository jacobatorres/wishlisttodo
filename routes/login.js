var express = require("express");
var router = express.Router();
var passport = require("passport");
var User = require("../models/user");




// future landing page
router.get("/", function(req, res){
	res.redirect("/lists");
});


// sign up page view
router.get("/signup", function(req, res){
	res.render("signup");
})


// actually write the new user to the DB
router.post("/signup", function(req, res){

	var isAdminvalue = false;
	if (req.body.AdminCode == "auntiedope") {
		isAdminvalue = true;
	}

	var newUser = new User({username: req.body.username, isAdmin: isAdminvalue});



	User.register(newUser, req.body.password, function(err, user){

		if (err){
			console.log(err);
			req.flash("error", err.message);
			return res.redirect("/errordefault");
		} else {

			// successfully logged in
			passport.authenticate("local")(req, res, function(){

				debugger;

				req.flash("success", "Welcome to the app, " + newUser.username + "!");
				res.redirect("/lists");
			});

		}

	})



})

router.get("/logout", function(req, res){
	req.logout();
	res.redirect("/lists");
});


router.get("/login", function(req, res){
	res.render("login");
})


// login post
// do the middleware to verify if indeed user is valid
router.post("/login", passport.authenticate("local", 
	{
		successRedirect: "/lists",
		failureRedirect: "/login",
		failureFlash: true,
		successFlash: "Welcome back!"
	}), function(req,res){

});




module.exports = router;