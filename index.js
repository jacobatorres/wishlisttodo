// env variables
require('dotenv').config();


const express = require("express"),
app = express(),
bodyparser = require("body-parser"),
mongoose = require("mongoose"),
// models
methodOverride = require("method-override"),
List = require("./models/lists"),
hostname = '127.0.0.1',
port = 3000;

// needed for image upload
const multer = require("multer");
const storage = multer.diskStorage({
	filename: function(req, file, callback){
		callback(null, Date.now() + file.originalname); // the naming of this file in cloudinary is unique
	}
});

const imageFilter = function (req, file, cb) {
	// only accept images, not PDF, docx, ...
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
        return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
};

const upload = multer({ storage: storage, fileFilter: imageFilter});


const cloudinary = require('cloudinary');
cloudinary.config({
	cloud_name: 'desridyje',
	api_key: process.env.CLOUDINARY_API_KEY,
	api_secret: process.env.CLOUDINARY_API_SECRET
});


// most necessary
app.set("view engine", "ejs");
app.use(bodyparser.urlencoded({extended: true}));
mongoose.connect('mongodb://localhost:27017/wishlist_app', {useNewUrlParser: true});
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));


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
app.post("/", upload.single('image'), function(req, res){

	const list_to_add = {
		name: req.body.name, 
		description: req.body.description

	};


	cloudinary.uploader.upload(req.file.path, function(result){

		// add in user reference later on... 
		// req.body.campground.author = {
		// id: req.user._id,
		// username: req.user.username
		// }

		// the new image link in the db
		// secure url is literally a URL, it's a pointer to a storage in cloudinary
		list_to_add.image = result.secure_url;


		List.create(list_to_add, function(err, list){

			if (err){
				console.log("YATAP");
				return res.redirect('back');
			} 

			// if successful, see show page
			console.log('/lists/' + list.id);
			res.redirect('/lists/' + list.id);



		})



	})


	// List.create(list_to_add, function(err, newlist){
	// 	if(err){
	// 		console.log("err");
	// 	} else {
	// 		// successfully added list! go back to index
	// 		res.redirect("/lists")
	// 	}
	// });

});

// show
app.get("/lists/:id", function(req, res){


	List.findById(req.params.id, function(err, foundlist){
		if (err){
			console.log("err");
		} else {
			res.render("show", {list: foundlist});

		}
	});

});

// edit 
app.get("/lists/:id/edit", function(req, res){

	List.findById(req.params.id, function(err, foundlist){
		if (err){
			console.log("err");
		} else {
			res.render("edit", {list:foundlist});

		}
	});

});


// update
app.put("/lists/:id", function(req, res){
	// prep the body to update

	const list_to_update = {
		name: req.body.name, 
		description: req.body.description
	};


	List.findByIdAndUpdate(req.params.id, list_to_update, function(err, editedlist){
		if (err){
			console.log("err");
		} else {
			console.log("yess");
			res.redirect("/lists/" + req.params.id);

		}
	});
});


// delete
app.delete("/lists/:id", function(req, res){

	List.findByIdAndRemove(req.params.id, function(err){
		if (err){
			console.log("err");
		} else {
			// deleted successfully
			res.redirect("/lists");
		}
	})



});




app.listen(port, hostname, function(){
	console.log("app listening...");
});