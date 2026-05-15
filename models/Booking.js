const mongoose = require("mongoose");

const bookingSchema =
new mongoose.Schema({

    hospitalName:String,

    patientName:String,

    patientAge:String,

    type:String,

    paymentMode:String,

    receipt:String,

    date:String
});

module.exports =
mongoose.model(
    "Booking",
    bookingSchema
);