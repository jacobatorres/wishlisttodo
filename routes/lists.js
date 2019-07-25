var express = require("express");
var router = express.Router();
var passport = require("passport");
var User = require("../models/user");
var List = require("../models/list");

var middleware = require("../middleware");


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



// index route
router.get("/lists", function(req, res){

	// find all lists
	List.find({}, function(err, all_lists){
		if(err){
			req.flash("error", "There was an error fetching the lists.");
			return res.redirect("back");
		} else {
			res.render("index", {lists:all_lists});
		}
	});

});


router.get("/errordefasssult", function(req, res){
	res.send("This is the base error page");
})


// new route
router.get("/lists/new", middleware.isLoggedIn, function(req, res){
	res.render("new");
});


// create route 
router.post("/", upload.single('image'), middleware.isLoggedIn, function(req, res){


	const author_of_list = {
		id: req.user._id,
		username: req.user.username
	}

	const list_to_add = {
		name: req.body.name, 
		description: req.body.description

	};


	cloudinary.v2.uploader.upload(req.file.path, function(err, result){

		if (err){
			console.log("error at uploading image part...");
			req.flash("error", "Error in uploading image");
			return res.redirect("back");
		}

		// add in user reference later on... 
		// req.body.campground.author = {
		// id: req.user._id,
		// username: req.user.username
		// }

		// the new image link in the db
		// secure url is literally a URL, it's a pointer to a storage in cloudinary
		list_to_add.image = result.secure_url;
		list_to_add.imageId = result.public_id;
		list_to_add.author = author_of_list;


		List.create(list_to_add, function(err, list){

			if (err){
				console.log("error", "Error creating the list");
				return res.redirect("back");
			} 

			// if successful, flash success and see show page
			req.flash("success", "List successfully created!");
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
router.get("/lists/:id", middleware.isLoggedIn, function(req, res){


	List.findById(req.params.id, function(err, foundlist){
		if (err){
			console.log("err");
			req.flash("error", "Error showing list");
			return res.redirect("back");

		} else {

			res.render("show", {list: foundlist});

		}
	});

});

// edit 
router.get("/lists/:id/edit", middleware.isLoggedIn, middleware.checkownership, function(req, res){

	List.findById(req.params.id, function(err, foundlist){
		if (err){
			console.log("err");
			req.flash("error", "Error editing the list");
			return res.redirect("back");

		} else {
			res.render("edit", {list:foundlist});

		}
	});

});


// update
router.put("/lists/:id", upload.single('image'), middleware.checkownership, function(req, res){
	// prep the body to update


	List.findById(req.params.id, function(err, list){
		if (err){
			console.log("err");
			req.flash("error", "Error updating list");
			return res.redirect("back");

		} else {

			// if someone uploaded a file (middleware), then do this
			if (req.file){

				cloudinary.v2.uploader.destroy(list.imageId, function(err, result){
					if(err){
						console.log(err);
						req.flash("error", "Error in destroying image");
						return res.redirect("back");

					}

					cloudinary.v2.uploader.upload(req.file.path, function(err, result){
						if (err){
							console.log(error);
							req.flash("error", "Error in uploading image");
							return res.redirect("back");
							// return res.redirect("back");
						}



					
						// add the imageId and image (name, description are already in list object)
						list.imageId = result.public_id;
						list.image = result.secure_url;

						list.name = req.body.name;
						list.description = req.body.description;


						list.save();
						req.flash("success", "List successfully edited!");

						res.redirect("/lists/" + list._id);




					});


					
				});
			}





		}
	});
});


// delete
router.delete("/lists/:id", middleware.checkownership, function(req, res){

	List.findByIdAndRemove(req.params.id, function(err){
		if (err){
			console.log(err);
			req.flash("error", "Error deleting image...");
			return res.redirect("back");
		} else {
			// deleted successfully
			res.redirect("/lists");
		}
	})

});

module.exports = router;