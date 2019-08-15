var express = require("express");
var router = express.Router({mergeParams: true});
var campground = require("../models/campground");
var comment = require("../models/comment");
var middleware = require("../middleware");


//post comment route//

router.post("/", middleware.isLoggedIn, function(req, res){
    //find campground by id//
    campground.findById(req.params.id, function(err, foundcampground){
        if (err || !foundcampground){
            req.flash("error", "Something went wrong");
            res.redirect("back");
        } else {
            comment.create(req.body.comment, function(err, comment){
                if (err){
                    req.flash("error", "Something went wrong");
                    res.redirect("back");
                } else{
                    comment.author.id = req.user._id;
                    comment.author.username = req.user.username;
                    comment.save();
                    foundcampground.comments.push(comment);
                    foundcampground.save();
                    res.redirect("/campgrounds/" + foundcampground._id);
                }
            });
        }
    });
});

//Edit comment//
//get edit comment form
router.get("/:comment_id/edit", middleware.checkCommentWonership, function(req,res){
    campground.findById(req.params.id, function(err, foundcampground){
        if (err || !foundcampground){
            req.flash("error", "Something went wrong");
            res.redirect("back");
        }
        comment.findById(req.params.comment_id, function(err, foundcomment){
            if (err){
                res.redirect("back");
            }else{
                res.render("editcomment", {campground_id: req.params.id, comment: foundcomment});
            }
    });
    });
});

//update comment//
router.put("/:comment_id", middleware.checkCommentWonership, function(req, res){
    comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function(err, updatedcomment){
        if(err){
            res.redirect("back");
        }else{
            res.redirect("/campgrounds/" + req.params.id);
        }
    });
});


//delete
router.delete("/:comment_id", middleware.checkCommentWonership, function(req, res){
    comment.findByIdAndDelete(req.params.comment_id, function(err){
        if (err){
            req.flash("error", "Something went wrong");
            res.redirect("back");
        } else {
            req.flash("success", "Comment deleted !");
            res.redirect("/campgrounds/" + req.params.id)
        }
    });
});



module.exports = router;
