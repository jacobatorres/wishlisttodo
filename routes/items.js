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
router.post("/lists/:list_id/items", function(req, res){

	console.log("yeah baby");

	var obj = {};
	console.log('body: ' + JSON.stringify(req.body));

	Item.create(req.body, function(err, list){

		if (err){
			console.log("error", "Error creating the list");
			return res.redirect("back");
		} 

		// if successful, flash success and see show page
		res.redirect('/lists/' + req.params.list_id);



	})


});



module.exports = router;