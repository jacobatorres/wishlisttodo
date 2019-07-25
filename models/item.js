var mongoose = require("mongoose");

var itemSchema = new mongoose.Schema({
	name: String,
	reserved: {type: Boolean, default: false},
	author: {
		id: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User"
		}, 
		username: String
	}
});

module.exports = mongoose.model("Item", itemSchema);

