

var middlewareobject = {};
var List = require("../models/list");
var User = require("../models/user");


console.log("im in");

middlewareobject.checkownership = function(req, res, next){

	console.log("eyy check ownership");
	// check if logged in
	// then, check if he owns the list
	// if so, next()
	// if not, warn him and go back to the same screen


	// if logged in
	if (req.isAuthenticated()) {


		// search for the list he clicked, then check if he owns it
		List.findById(req.params.id, function(err, foundlist){

			console.log(foundlist.author);

			// does he own the list?
			if(foundlist.author.id.equals(req.user._id)){

				next();
			} else {
				console.log("you are not the author of this page...");
				res.redirect("/lists/" + foundlist._id );
			}



		})



	}


}


middlewareobject.isLoggedIn = function(req, res, next){

	// if logged in
	// this isAuthenticated function I believe came from passport

	if (req.isAuthenticated()){
		return next();
	} 


	// FLASH: must be logged in first

	res.redirect("/login");




}


module.exports = middlewareobject;