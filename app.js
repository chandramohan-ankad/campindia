var express = require("express");
var app = express();
var bodyparser = require("body-parser");
var mongoose = require("mongoose");
var passport = require("passport");
var localStrategy = require("passport-local");
var methodOverride = require("method-override");
var flash = require("connect-flash");
var campground = require("./models/campground");
var user = require("./models/user");
var comment = require("./models/comment");
var seedDB = require("./seeds");

var campgroundRoutes = require("./routes/campgrounds");
var commentRoutes = require("./routes/comments");
var indexRoutes = require("./routes/index");
var resetRoutes = require("./routes/reset");




mongoose.connect("mongodb+srv://testing:process.env.DBPW@yelpcamp-3yrwn.mongodb.net/test?retryWrites=true&w=majority", { 
    useNewUrlParser: true,
    useCreateIndex: true 
}).then(() => {
    console.log("Data Base connected")
}).catch(err =>{
    res.send("Server not Found");
});


app.use(bodyparser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));
app.use(flash());
// seedDB(); // seeding database


//passport configuration//

app.use(require("express-session")({
    secret: "Rusty is best",
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(user.authenticate()));
passport.serializeUser(user.serializeUser());
passport.deserializeUser(user.deserializeUser());

app.use(function(req, res, next){
    res.locals.currentuser = req.user;
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    next();
});


app.use("/campgrounds",campgroundRoutes);
app.use("/campgrounds/:id/comment",commentRoutes);
app.use("/user",indexRoutes);
app.use("/",resetRoutes);

// landing page//
app.get("/", function(req, res){
    res.render("home");
});




//port configuration//
app.listen(process.env.PORT || 3000, function(){
    console.log("Express server listening on port %d in %s mode", this.address().port, app.settings.env);
  });