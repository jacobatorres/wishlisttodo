// env variables
require('dotenv').config();


const express = require("express"),
app = express(),
bodyparser = require("body-parser"),
mongoose = require("mongoose"),
// models
methodOverride = require("method-override"),
List = require("./models/list"),
User = require("./models/user"),
hostname = '127.0.0.1',
passport = require("passport"),
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
mongoose.connect('mongodb://localhost:27017/wishlist_appv2', {useNewUrlParser: true});
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));


// session for logging in
// might also be needed for middleware?
app.use(require("express-session")({
    secret: "nadarangnanaman",
    resave: false,
    saveUninitialized: false
}));


// passport dependencies
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate())); // you can .authenticate because of plugin in user.js
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());



// global username
app.use(function(req, res, next){
    res.locals.currentUser = req.user;
    next();
});







/// routes
///
///
///
///



// future landing page
app.get("/", function(req, res){
	res.redirect("/lists");
});


// sign up page view
app.get("/signup", function(req, res){
	res.render("signup");
})


// actually write the new user to the DB
app.post("/signup", function(req, res){


	var newUser = new User({username: req.body.username});


	User.register(newUser, req.body.password, function(err, user){

		if (err){
			console.log(err);
		} else {

			// successfully logged in
			passport.authenticate("local")(req, res, function(){
				res.redirect("/lists");
			});

		}

	})



})


app.post("")



app.get("/login", function(req, res){
	res.render("login");
})





// login page



// index route
app.get("/lists", function(req, res){

	// find all lists
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


	cloudinary.v2.uploader.upload(req.file.path, function(err, result){

		if (err){
			console.log("error at list post part");
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
app.put("/lists/:id", upload.single('image'), function(req, res){
	// prep the body to update


	List.findById(req.params.id, function(err, list){
		if (err){
			console.log("err");
		} else {

			console.log("old image id: " + list.imageId);
			console.log("sup losers");
			// if someone uploaded a file (middleware), then do this
			if (req.file){

				console.log(list.imageId);
				cloudinary.v2.uploader.destroy(list.imageId, function(err, result){
					if(err){
						console.log(result, err);
						console.log("suppp");
					}

					cloudinary.v2.uploader.upload(req.file.path, function(err, result){
						if (err){
							console.log("error for some reason2 ");
							// return res.redirect("back");
						}



					
						// add the imageId and image (name, description are already in list object)
						list.imageId = result.public_id;
						list.image = result.secure_url;

						list.name = req.body.name;
						list.description = req.body.description;


						console.log("boyyy");
						list.save();
						res.redirect("/lists/" + list._id);

						console.log(list);



					});


					
				});
			}





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