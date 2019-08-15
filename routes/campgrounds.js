var express = require("express");
var router = express.Router();
var campground = require("../models/campground");
var comment = require("../models/comment");
var user = require("../models/user")
var middleware = require("../middleware");
var multer = require("multer");
var fs = require("fs");
var cloudinary = require("cloudinary").v2;
require('dotenv').config();


//storage engine//

var storage = multer.diskStorage({
    filename: function(req, file, callback){
        callback(null, Date.now() + file.originalname);
    }
});

//image filter//

var imageFilter = function(req, file, cb){
    //Accept image file only
    if(!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)){
        return cb(new error ("Only image files are allowed"), false);
    }
    cb(null, true);
}

//image uplaod configuration
var upload = multer({storage:storage, fileFilter:imageFilter});

//Cloudinary configuration//
cloudinary.config({
    cloud_name: "yelpcampimag",
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});




//campgrounds  page route //
router.get("/", function(req, res){
    var noMatch = null;
    if(req.query.search){
        const regexCity = new RegExp(escapeRegex(req.query.search.city), 'gi');
        const regexState = new RegExp(escapeRegex(req.query.search.state), 'gi');
        campground.find({"address.state":regexState, "address.district":regexCity}, function(err, allcampgrounds){
        if (err){
            req.flash("error", err.message);
            res.redirect("/");
            } else {
                if(allcampgrounds.length < 1){
                            noMatch = "No campgrounds match that query, please try again"; 
                        }
                        res.render("campgrounds", {campgrounds:allcampgrounds, noMatch:noMatch});
                    }       
        });

    }   else {
    //get all the campgrounds from db
        campground.find({}, function(err, allcampgrounds){
        if(err){
            req.flash("error", err.message);
            return res.redirect("back");
            } else{
                res.render("campgrounds",{campgrounds:allcampgrounds, noMatch:noMatch});
            }
        });
    }
});

//Create new campgrounds//
// Create form route//
router.get("/new", middleware.checkCustomertype, function(req, res){
    res.render("new");
});


//post route to create new campgrounds//
router.post("/", middleware.isLoggedIn, middleware.checkCustomertype, upload.single('image'), function(req, res){
    cloudinary.uploader.upload(req.file.path, function(err, result) {
        if(err) {
          req.flash('error', err.message);
          return res.redirect('back');
        }
        //add cloudinary url for the image to the campground object under image property
        req.body.campground.image = result.secure_url;
        //add cloudinary image's public_id to the campground object under imageId property
        req.body.campground.imageID = result.public_id;
        //add author to campground
        req.body.campground.author = {
        id: req.user._id,
        username: req.user.username
    };
        req.body.campground.activities =[];
        for (let i=0; i<req.body.activity.length; i++){
            req.body.campground.activities.push(req.body.activity[i]);
        }
        req.body.campground.services = [];
        for (let i=0; i<req.body.service.length; i++){
            req.body.campground.services.push(req.body.service[i]);
        }
        req.body.campground.address = req.body.address;
        console.log(req.body.address);
        
    campground.create(req.body.campground, function(err, newlyCreated){
        if(err){
            req.flash("error", err.message);
            res.redirect("back");
        } else{
            console.log(newlyCreated);
            
         res.redirect("/campgrounds/"+newlyCreated._id);
        }
        });
   });   
});

//Show route//
router.get("/:id", function(req, res){
    campground.findById(req.params.id).populate("comments").exec(function(err, foundcampground){
        if (err || !foundcampground){
            req.flash("error", "Campground not found");
            return res.redirect("/campgrounds");
        } else {
            user.findById(foundcampground.author.id, function(err, founduser){
                if(err){
                    req.flash("error", "Campground not found");
                    return res.redirect("/campgrounds");
                } else {
                    res.render("show", {campground: foundcampground, user: founduser});
                }
            })
            
        }
    });
});

//Edit route//
//Show edit page
router.get("/:id/edit", middleware.checkCampgroundWonership, function(req, res){
    campground.findById(req.params.id, function(err, editcampground){
        if (err || !editcampground){
            req.flash("error", "Campground not found");
            res.redirect("back");
        } else {
            console.log(editcampground);
            
            res.render("edit", {campground:editcampground});
        }
    });
    
});

//update logic//

router.put("/:id/edit", middleware.checkCampgroundWonership, upload.single('image'), function(req, res){
    campground.findById(req.params.id, async function(err, campground){
        if (err){
            req.flash("error", err.message);
            res.redirect("back");
        }else {
            if(req.file){
                try{
                    await cloudinary.api.delete_resources(campground.imageId);
                    var result = await cloudinary.uploader.upload(req.file.path);
                    campground.imageId = result.public_id;
                    campground.image = result.secure_url;
                } catch (err){
                    req.flash("error", err.message);
                    res.redirect("back");
                }
            }
            campground.name = req.body.name;
            campground.description = req.body.description;
            campground.address = req.body.address;
            campground.addressUrl = req.body.addressUrl;
            campground.contactNumber = req.body.contactNumber;
            campground.activities = [];
            campground.services = [];
            await campground.save(function(err){
                if (err){
                    req.flash("error", err.message);
                    res.redirect("back");
                } else {
                    for (let i=0; i<req.body.activity.length; i++){
                        campground.activities.push(req.body.activity[i]);
                        }
                    for (let i=0; i<req.body.service.length; i++){
                        campground.services.push(req.body.service[i]);
                        }
                    
                    campground.save();
                    console.log(campground);
                    
                    req.flash("success", "Campground updated successfully");
                    res.redirect("/campgrounds/"+campground.id);
                }
            });
            
        }
    });
});


//delete route

router.delete("/:id", middleware.checkCampgroundWonership, function(req, res){
    campground.findById(req.params.id, async function(err, foundcampground){
        if(err){
            req.flash("error", err.message);
            res.redirect("back");
        }
            try{
                await cloudinary.api.delete_resources(foundcampground.imageId);
                comment.deleteMany({_id:{$in : foundcampground.comments}}, function(err){
                    if (err){
                        req.flash("error", err.message);
                        res.redirect("back");
                    } else {

                        foundcampground.remove();
                        req.flash("success", "Campground deleted successfully");
                        res.redirect("/campgrounds");
                    }
                });
                
            } catch (err){
                if (err) {
                    req.flash("error", err.message);
                    res.redirect("back");
                }
                
            }
    });
    
});


function escapeRegex(text){
return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};
module.exports = router;