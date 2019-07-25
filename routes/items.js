var express = require("express");
var router = express.Router();
var passport = require("passport");
var Item = require("../models/item");

// var app = express.createServer();

// app.use(express.bodyParser());
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

var middleware = require("../middleware");

// when user hits Enter in show > Add new Item, this route will be used
router.post("/lists/:id/items", middleware.checkownership, function(req, res){


	var obj = {};

	Item.create(req.body, function(err, list){

		if (err){
			console.log("error", "Error creating the list");
			return res.redirect("back");
		} 

		// if successful, flash success and see show page
		res.redirect('/lists/' + req.params.id);



	})


});

// when user hits Enter in show > Add new Item, this route will be used
router.post("/lists/:id/itemsreserve/:item_id", function(req, res){


	var obj = {};
	console.log("going");
	console.log(req.params.item_id);
	console.log(req.body);
	Item.findByIdAndUpdate(req.params.item_id, req.body, function(err, updateditem){

		if (err){
			console.log("error", "Error updating the item");
			return res.redirect("back");
		} 

		console.log("SSUCC");

		console.log(req.body);
		console.log("ASJASDJASDJA");
		console.log(updateditem);
		// if successful, flash success and see show page



	})


});





module.exports = router;