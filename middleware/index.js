

var middlewareobject = {};
var List = require("../models/list");
var User = require("../models/user");
var moment = require("moment");


middlewareobject.checkownership = function(req, res, next){

	// check if logged in
	// then, check if he owns the list
	// if so, next()
	// if not, warn him and go back to the same screen


	// if logged in
	if (req.isAuthenticated()) {


		// search for the list he clicked, then check if he owns it
		List.findById(req.params.id, function(err, foundlist){

			// if the current user owns the list, or user is an admin, they can see this list
			if(foundlist.author.id.equals(req.user._id) || req.user.isAdmin){

				next();
			} else {
				req.flash("error", "You're not the author of this list!");
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
	req.flash("error", "You must be logged in first!");
	res.redirect("/login");




}


middlewareobject.isuserthesame = function(req, res, next){

	// check if the user id in the params is the same as the person
	// if logged in
	if (req.isAuthenticated()) {

		// search for the list he clicked, then check if he owns it
		User.findById(req.params.usernameid, function(err, founduser){


			// does he own the list?

			if(founduser._id.equals(req.user._id)){
				next();
			} else {
				req.flash("error", "That's not you!");
				res.redirect("/lists/");
			}



		})



	}

}


middlewareobject.verifyeventfuture =  function(req, res, next){
	
	// check if the event in the list event date is not in the past
	if (moment(req.body.eventdate) <= moment()) {

		req.flash("error", "Date is in the past!");
		res.redirect("/lists/new");
	} else {

		next();
	}




}


module.exports = middlewareobject;