var express = require("express");
var router = express.Router();
var passport = require("passport");
var user = require("../models/user");
var campground = require("../models/campground");
var middleware = require("../middleware/index");
var async = require("async");
var nodemailer = require("nodemailer");
var crypto =require("crypto");




//AUth routes//
//Admin register form
router.get("/register/admin", function(req, res){
    res.render("adminregister");
});


//Show register form//
router.get("/register", function(req, res){
    res.render("register");
});



//handle sign up logic//
router.post("/register", function(req, res){
    var newUser = new user({
        username:req.body.username,
        firstName:req.body.firstName,
        lastName:req.body.lastName,
        email:req.body.email,
        contactNumber: req.body.contactNumber
    });
    if(req.body.admincode === "secretecode123"){
        newUser.isAdmin = true;
    } else{
        newUser.userType= req.body.userType;
    }
    user.register(newUser, req.body.password, function(err, user){
        if (err){    
            req.flash("error", err.message);
            return res.redirect("/user/register");
        }
        passport.authenticate("local")(req, res, function(){
            req.flash("success", "Welcome to Yelp Camp" + " " +user.username);
            res.redirect("/campgrounds");
        });
    });
});

//show login page//
router.get("/login", function(req, res){
    res.render("login");
});

//handle login logic//
router.post("/login", passport.authenticate("local",
{
    successRedirect: "/campgrounds",
    failureRedirect: "/user/login"
}), function(req, res){
});

//logout route//
router.get("/logout", function(req, res){
    req.logout();
    res.redirect("/campgrounds");
});


// Profile Page//
router.get("/:id", function(req, res){
    user.findById(req.params.id, function(err, founduser){
        if (err){
            req.flash("error", err.message);
            res.redirect("back");
        } else{
            campground.find().where("author.id").equals(founduser._id).exec(function(err, campgrounds){
                if(err){
                    req.flash("error", err.message);
                    res.redirect("back");
                }
                res.render("profile", {user: founduser, campgrounds:campgrounds});
            });
        }
    });
});

//get edit prfile page//
router.get("/:id/edit", middleware.isLoggedIn, function(req, res){
    user.findById(req.params.id, function(err, founduser){
        if(err || !founduser){
            req.flash("error", err.message);
            res.redirect("back");  
        } else {
            if(founduser._id.equals(req.user._id) || req.user.isAdmin){
                res.render("editProfile", {user:founduser});
                } else{
                    req.flash("error", "You dont have permision to do that");
                    res.redirect("back");
                }
        }
        
    });
});

// update pprofile ////
router.put("/:id", middleware.isLoggedIn, function(req, res){
    user.findById(req.params.id, function(err, founduser){
        if(err || !founduser){
            req.flash("error", "Something went wrong");
            res.redirect("back");
        }else{
            if(founduser._id.equals(req.user._id) || req.user.isAdmin) {
                founduser.firstName = req.body.firstName;
                founduser.lastName = req.body.lastName;
                founduser.email = req.body.email;
                founduser.contactNumber = req.body.contactNumber;
                founduser.save();
                req.flash("success", "Profile updated");
                res.redirect("/user/"+ founduser._id);
            } else{
                req.flash("error", "You don't have permission to do that");
                res.redirect("/campgrounds");
            }
        }
    });
});


//Delete profile//
router.delete("/:id", middleware.isLoggedIn, function(req, res){
    user.findById(req.params.id, function(err, founduser){
        if(err || !founduser){
            req.flash("error", "Something went wrong");
            res.redirect("back");
        } else {
            if(founduser._id.equals(req.user._id) || req.user.isAdmin){
                founduser.delete();
                req.flash("success", "User profile deleted");
                res.redirect("/campgrounds");
            } else {
                req.flash("error", "You don't have permission to do that");
                res.redirect("back");
            }
        }
    });
});

module.exports = router;