var mongoose = require("mongoose");


// schema for the list
var listSchema = new mongoose.Schema({
	name: String,
	image: {type: String, default: "https://source.unsplash.com/random/300x200"},
	description: String
});

// compile to a model
var List = mongoose.model("List", listSchema);

module.exports = List;