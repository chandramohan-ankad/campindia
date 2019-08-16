const mongoose = require("mongoose");
// const comment = require("./comment");
//Schema Setup
var campgroundSchema = new mongoose.Schema({
    name: {type:String, required: true},
    price: {type:String, required: true},
    image: String,
    imageId: String,
    activities:[{type:String}],
    services:[{type:String}],
    address: 
        {
        address1: String,
        city: String,
        district: String,
        state: String,
        postalCode: String
        },
    addressUrl: String,
    contactNumber: String,
    description: String,
    author: {
        id:{
            type:mongoose.Schema.Types.ObjectId,
            ref: "user"
        },
        username: String
    },
    comments: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "comment"
        }
    ]
});

//model
module.exports = mongoose.model("campground", campgroundSchema);
