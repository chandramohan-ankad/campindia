var middlewareObj = {};
var campground = require("../models/campground");
var comment = require("../models/comment");

middlewareObj.isLoggedIn = function(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    req.flash("error", "You need to be logged in to do that !");
    res.redirect("/user/login");
}

middlewareObj.checkCampgroundWonership = function(req, res, next){
    if(req.isAuthenticated()){
        campground.findById(req.params.id, function(err, foundcampground){
            if (err || !foundcampground){
                req.flash("error", "Campground not found");
                res.redirect("back");
            }else{
                if(foundcampground.author.id.equals(req.user._id) || req.user.isAdmin){
                    next();
                }else{
                    req.flash("error", "You don't have permission to do that !");
                    res.redirect("back");
                }
            }
        });
    }else{
        req.flash("error", "You need to be logged in to do that !");
        res.redirect("/user/login");
    }
}


middlewareObj.checkCommentWonership = function(req, res, next){
    if(req.isAuthenticated()){
        comment.findById(req.params.comment_id, function(err, foundcomment){
            if (err || !foundcomment){
                req.flash("error", "Something went wrong !!!");
                res.redirect("/campgrounds/"+ req.params.id);
            }else{
                if(foundcomment.author.id.equals(req.user._id) || req.user.isAdmin){
                    next();
                }else{
                    req.flash("error", "You don't have permission to do that !");
                    res.redirect("back");
                }
            }
        });
    }else{
        req.flash("error", "You need to be logged in to do that !");
        res.redirect("/user/login");
    }
}

middlewareObj.checkCustomertype = function (req, res, next) {
    if(req.isAuthenticated()){
        if(req.user.userType === "owner" || (!req.user.type && req.user.isAdmin)){
            return next();
        } else{
            if (req.user.type === "customer"){
                req.flash("error", " You are not registered as owner. Only owners/service providers can add campgrounds");
                return res.redirect("/campgrounds");
            } 
        }
    }
    req.flash("error", "You need to be logged in to do that !");
    res.redirect("/user/login");
}

module.exports = middlewareObj;