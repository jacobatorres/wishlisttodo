const express = require("express"),
app = express(),
// debug = require("debug"),
bodyparser = require("body-parser"),
hostname = '127.0.0.1',
port = 3000;


// most necessary
app.set("view engine", "ejs");
app.use(bodyparser.urlencoded({extended: true}));

/// routes

// future landing page
app.get("/", function(req, res){
	res.redirect("/lists");
});

// index route
app.get("/lists", function(req, res){
	res.render("index");
});


// new route
app.get("/lists/new", function(req, res){
	res.render("new");
});


// create route 
app.post("/", function(req, res){

	const return_object = {
		title: req.body.title, 
		description: req.body.description
	};
	res.render("temppost", {object: return_object});

});

app.listen(port, hostname, function(){
	console.log("app listening...");
});