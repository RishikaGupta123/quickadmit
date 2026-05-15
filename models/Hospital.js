const mongoose = require("mongoose");

const hospitalSchema = new mongoose.Schema({

    name:String,

    category:String,

    city:String,

    rating:String,

    distance:String,

    ambulance:String,

    phone:String,

    latitude:Number,

    longitude:Number,

    doctors:[String],

    privateBeds:Number,

    sharedBeds:Number,

    icuBeds:Number
});

module.exports = mongoose.model(

    "Hospital",

    hospitalSchema
);