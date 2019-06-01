const express = require("express"),
app = express(),
// debug = require("debug"),
bodyparser = require("body-parser"),
mongoose = require("mongoose"),
hostname = '127.0.0.1',
port = 3000;


// most necessary
app.set("view engine", "ejs");
app.use(bodyparser.urlencoded({extended: true}));
mongoose.connect('mongodb://localhost:27017/wishlist_app', {useNewUrlParser: true});

// schema for the list
var listSchema = new mongoose.Schema({
	name: String,
	description: String
});

// compile to a model
var List = mongoose.model("List", listSchema);

// // sample list
// List.create(
// 	{
// 		name: "Trip to Europe",
// 		description: "Make sure I dont forget these things:"
// 	}, function(err, campground){
// 		if (err){
// 			console.log(err);
// 		} else {
// 			console.log("new campground!!!");
// 			console.log(campground);
// 		}
// });




/// routes

// future landing page
app.get("/", function(req, res){
	res.redirect("/lists");
});

// index route
app.get("/lists", function(req, res){

	// find all campgrounds
	List.find({}, function(err, all_lists){
		if(err){
			console.log(err);
		} else {
			res.render("index", {lists:all_lists});
		}
	});

});


// new route
app.get("/lists/new", function(req, res){
	res.render("new");
});


// create route 
app.post("/", function(req, res){

	const list_to_add = {
		name: req.body.name, 
		description: req.body.description
	};


	List.create(list_to_add, function(err, newlist){
		if(err){
			console.log("err");
		} else {
			// successfully added list! go back to index
			res.redirect("/lists")
		}
	});

});

app.listen(port, hostname, function(){
	console.log("app listening...");
});