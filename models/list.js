var mongoose = require("mongoose");


// schema for the list
var listSchema = new mongoose.Schema({
	name: String,
	image: {type: String, default: "https://source.unsplash.com/random/300x200"},
	description: String,
	imageId: String,

	author: {
		id: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User"
		}, 
		username: String
	},

	location: String,
	lat: Number,
	lng: Number,

	event_date: String,
	event_date_df: Date

});

// compile to a model
var List = mongoose.model("List", listSchema);

module.exports = List;