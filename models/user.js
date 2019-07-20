var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");

var userSchema = new mongoose.Schema({
	username: String,
	password: String,
	isAdmin: {type: Boolean, default: false},
	profilepic: {type: String, default: "https://source.unsplash.com/random/150x150"},
	bio: String


});


userSchema.plugin(passportLocalMongoose);


module.exports = mongoose.model("User", userSchema);
