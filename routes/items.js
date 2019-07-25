var express = require("express");
var router = express.Router();
var passport = require("passport");
var User = require("../models/user");
var List = require("../models/list");
// var app = express.createServer();

// app.use(express.bodyParser());

var middleware = require("../middleware");


// when user hits Enter in show > Add new Item, this route will be used
router.post("/lists/:list_id/items", function(req, res){

	console.log("yeah baby");

	console.log(req);

	res.redirect("/lists/" + req.params.list_id);

});



module.exports = router;