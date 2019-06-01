var mongoose = require("mongoose");


// schema for the list
var listSchema = new mongoose.Schema({
	name: String,
	description: String
});

// compile to a model
var List = mongoose.model("List", listSchema);

module.exports = List;