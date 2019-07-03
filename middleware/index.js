

var middlewareobject = {};
var List = require("../models/list");
var User = require("../models/user");


console.log("im in");
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