var express = require("express");
var router = express.Router();
var passport = require("passport");
var User = require("../models/user");
var List = require("../models/list");
var Item = require("../models/item");
var NodeGeocoder = require('node-geocoder');
var moment = require("moment");
var middleware = require("../middleware");


// for geocoding the values for Google maps

var options = {
  provider: 'google',
  httpAdapter: 'https',
  apiKey: process.env.GEOCODER_API_KEY,
  formatter: null
};
 
var geocoder = NodeGeocoder(options);
// needed for image upload
const multer = require("multer");
const storage = multer.diskStorage({
	filename: function(req, file, callback){
		callback(null, Date.now() + file.originalname); // the naming of this file in cloudinary is unique
	}
});

const imageFilter = function (req, file, cb) {
	// only accept images, not PDF, docx, ...
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif|jfif)$/i)) {
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



	// User.find({_id: req.params.usernameid}, function(err, user){

	// 	if (err){
	// 		console.log(err);
	// 	} else {

	// 		List.find({'author.id': req.params.usernameid}, function(err, userlists){

	// 			if (err){
	// 				console.log(err);
	// 			} else {
	// 				res.render("userprofile", {userlists: userlists, userinfo: user});
	// 			}


	// 		})

	// 	}
	// });


// index route
router.get("/lists", function(req, res){

	// find all lists
	List.find({}, function(err, all_lists){
		if(err){
			req.flash("error", "There was an error fetching the lists.");
			return res.redirect("back");
		} else {


			if (req.isAuthenticated()){


				// if logged in, show upcoming events
				// sort by how near the next one is

				upcoming_lists = [];


				// if the event will happen this week
				all_lists.forEach(function(list){
					if (list.event_date_df > moment() && list.event_date_df < moment().add(7, 'days')) {
						upcoming_lists.push(list);
					}
				})


				upcoming_lists.sort((a, b) => (a.event_date_df > b.event_date_df) ? 1 : -1);


				// if user is logged in,
				// theyll see all their reserved items
				Item.find({'reserved': true, 'reserved_by.id': req.user._id}, null, {sort: {event_date_df: 1}}, function(err, usersitems) {

					items_to_happen = [];

					// get only those that is still about to happen
					usersitems.forEach(function(item){
						if (item.event_date_df > moment()) {
							items_to_happen.push(item);
						}
					});


					if (err){
						console.log(err);
					} else {
						res.render("index", {lists:upcoming_lists, usersitems: items_to_happen, moment: moment});

					}
				})



			} else {
				res.render("index", {lists:all_lists});

			}

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
router.post("/", upload.single('image'), middleware.isLoggedIn, middleware.verifyeventfuture, function(req, res){


	const author_of_list = {
		id: req.user._id,
		username: req.user.username
	}

	const list_to_add = {
		name: req.body.name, 
		description: req.body.description,
		event_date: moment(req.body.eventdate).format('MMMM Do YYYY, h:mm a'),
		event_date_df: req.body.eventdate

	};

	geocoder.geocode(req.body.location, function(err,data){

		if (err || !data.length){
			req.flash("error", "Invalid address");
			return res.redirect("back");
		}

		// successful geocoding, get lat and lng
		var lat = data[0].latitude;
		var lng = data[0].longitude;
		var location = data[0].formattedAddress;

		list_to_add.lat = lat;
		list_to_add.lng = lng;
		list_to_add.location = location;


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



	});



});

// show
router.get("/lists/:id", middleware.isLoggedIn, function(req, res){


	List.findById(req.params.id, function(err, foundlist){
		if (err){
			console.log("err");
			req.flash("error", "Error showing list");
			return res.redirect("back");

		} else {
			
			// get all the items relating to this list
			Item.find({'list_origin.id': foundlist._id}, function(err, list_item){

				if (err){
					console.log(err);
				} else if (list_item.length == 0){
					res.render("show", {list: foundlist, items: {}, moment:moment});
				} else {
					// also show all items where this is the user
					res.render("show", {list: foundlist, items: list_item, moment:moment });

				}
			})


		}
	});

});

// edit 
router.get("/lists/:id/edit", middleware.isLoggedIn, middleware.checkownership,  function(req, res){

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


			// update the parts for Google maps
			geocoder.geocode(req.body.location, function(err, data){

				if (err || !data.length){
					req.flash("error", "Invalid Address");
					return res.redirect("back");
				}


				list.lat = data[0].latitude;
				list.lng = data[0].longitude;
				list.location = data[0].formattedAddress;
				
				list.event_date = moment(req.body.eventdate).format('MMMM Do YYYY, h:mm a');
				list.event_date_df = req.body.eventdate;

			});

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

			// also remove attached items
			Item.deleteMany({'list_origin.id': req.params.id}, function(err){
				if (err){
					console.log(err);
					return res.redirect("back");

				} else {


					// deleted list and corresponding items successfully
					res.redirect("/lists");



				}
			})
		}
	})

});


router.get("/searchlists", middleware.isLoggedIn, function(req, res){

	List.find({}, function(err, all_lists){
		if(err){
			req.flash("error", "There was an error fetching the lists.");
			return res.redirect("back");
		} else {

				// all_lists shows all lists
				// show also upcoming lists

				upcoming_lists = [];

				all_lists.forEach(function(list){
					if (list.event_date_df > moment() && list.event_date_df < moment().add(7, 'days')) {
						upcoming_lists.push(list);
					}
				})


				upcoming_lists.sort((a, b) => (a.event_date_df > b.event_date_df) ? 1 : -1);


				res.render("searchlists", {all_lists: all_lists, upcoming_lists: upcoming_lists});


		}
	})
})



module.exports = router;