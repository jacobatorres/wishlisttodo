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
	},

	list_origin: {
		id: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "List"
		}
	}
});

module.exports = mongoose.model("Item", itemSchema);
