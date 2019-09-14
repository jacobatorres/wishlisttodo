var express = require("express");
var router = express.Router();
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


// show
router.get("/users/:usernameid", middleware.isLoggedIn, function(req, res){



	User.find({_id: req.params.usernameid}, function(err, user){

		if (err){
			console.log(err);
		} else {

			List.find({'author.id': req.params.usernameid}, function(err, userlists){

				if (err){
					console.log(err);
				} else {
					res.render("userprofile", {userlists: userlists, userinfo: user});
				}


			})

		}
	});


});

// "/users/<%= userinfo[0]._id %>/edit" 
// edit route
router.get("/users/:usernameid/edit", middleware.isLoggedIn,  middleware.isuserthesame,   function(req, res){

	User.findById(req.params.usernameid, function(err, founduser){

		if(err){
			console.log("err");
			req.flash("error", "Error searching for user");
			return res.redirect("back");
		} else {
			res.render("userprofile_edit", {user: founduser});

		}
	})


});

// UPDATE route
router.put("/users/:id", upload.single('profilepic'),  function(req, res){

	// 1 find user to update
	// 2 once seen, update the image 
	// 3 then the bio

	User.findById(req.params.id, function(err, founduser){

		if (err){
			console.log("err");
			req.flash("error", "Error updating user");
			return res.redirect("back");
		} else {


			// 2

			// this will always satisfy because of the middleware
			if (req.file){


				// if user already uploaded something as a profile pic, delete that first
				if (founduser.profilepic.indexOf("source.unsplash.com") == -1){
					cloudinary.v2.uploader.destroy(founduser.imageId, function(result) {console.log("Deleted current picture.")} );

				}

				// upload pic
				cloudinary.v2.uploader.upload(req.file.path, function(err, result){
					if (err){
						console.log(err);
						req.flash("error", "Error in uploading image");
						return res.redirect("back");
					}

					founduser.imageId = result.public_id;
					founduser.profilepic = result.secure_url;

					founduser.bio = req.body.bio;

					founduser.save();

					req.flash("success", "User profile updated!");

					res.redirect("/users/" + founduser._id);	





				})

			}


		}




	});


});


router.get("/searchusers", middleware.isLoggedIn, function(req, res){

	res.render("searchusers");

})

router.get("/search", function(req, res, next){

	User.find({
		username: {
			$regex: new RegExp(req.query.q, 'i')
		}
	}, function (err, data){
		console.log(data);
		res.json(data);
	}).limit(3);



});


module.exports = router;