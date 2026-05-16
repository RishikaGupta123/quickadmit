
const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const helmet = require("helmet");

require("dotenv").config();
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


/* OPEN LOGIN PAGE FIRST */
app.get("/", (req, res) => {

    res.sendFile(
        __dirname + "/public/login.html"
    );

});
app.use(express.static("public"));




app.use(helmet());

/* =========================
   MONGODB
========================= */

mongoose.connect(process.env.MONGO_URI)

.then(() => {

console.log("✅ MongoDB Connected");

})

.catch((err) => {

console.log(err);

});

/* =========================
   SCHEMAS
========================= */

const userSchema =
new mongoose.Schema({

name:String,
email:String,
phone:String,
password:String

});

const hospitalSchema =
new mongoose.Schema({

name:String,
category:String,
city:String,
rating:String,

doctors:[String],

privateBeds:Number,
sharedBeds:Number,
icuBeds:Number

});

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

/* =========================
   MODELS
========================= */

const User =
mongoose.model(
"User",
userSchema
);

const Hospital =
mongoose.model(
"Hospital",
hospitalSchema
);

const Booking =
mongoose.model(
"Booking",
bookingSchema
);

/* =========================
   INSERT HOSPITALS
========================= */

async function insertHospitals(){

const count =
await Hospital.countDocuments();

if(count===0){

await Hospital.insertMany([

{

name:"AIIMS Delhi",
category:"government",
city:"Delhi",
rating:"4.8 ⭐",

doctors:[
"Cardiologist",
"Neurologist",
"Orthopedic"
],

privateBeds:5,
sharedBeds:10,
icuBeds:3

},

{

name:"KGMU Lucknow",
category:"government",
city:"Lucknow",
rating:"4.5 ⭐",

doctors:[
"Dentist",
"ENT",
"Pediatrician"
],

privateBeds:3,
sharedBeds:8,
icuBeds:2

},

{

name:"Apollo Hospital",
category:"private",
city:"Delhi",
rating:"4.9 ⭐",

doctors:[
"Cardiologist",
"Skin Specialist",
"Eye Specialist"
],

privateBeds:7,
sharedBeds:5,
icuBeds:4

}

]);

console.log("✅ Hospitals Inserted");
}
}

insertHospitals();

/* =========================
   GET HOSPITALS
========================= */

app.get("/api/hospitals", async(req,res)=>{

try{

const hospitals =
await Hospital.find();

res.json(hospitals);

}catch(err){

console.log(err);

res.json([]);

}

});


/* =========================
   SIGNUP
========================= */

app.post("/api/signup", async(req,res)=>{

try{

const {
name,
email,
phone,
password
} = req.body;

console.log("SIGNUP EMAIL:", email);

if(
!name ||
!email ||
!phone ||
!password
){

return res.json({
success:false,
message:"Fill all fields"
});

}


const existingUser =
await User.findOne({

email: email.trim()

});

if(existingUser !== null){

return res.json({

success:false,
message:"Email already exists"

});

}
const newUser = new User({

name,
email,
phone,
password

});

await newUser.save();

return res.json({

success:true,

user:{
name:newUser.name,
email:newUser.email,
phone:newUser.phone
}

});

}catch(err){

console.log(err);

return res.json({
success:false,
message:"Signup Failed"
});

}

});


/* =========================
   LOGIN
========================= */

app.post("/api/login", async(req,res)=>{

try{

const { email,password } = req.body;

if(!email || !password){

return res.json({
success:false,
message:"Fill all fields"
});

}

const user =
await User.findOne({

email: email.trim()

});

if(!user){

return res.json({
success:false,
message:"User not found"
});

}

if(user.password !== password.trim()){

return res.json({
success:false,
message:"Invalid Credentials"
});

}

return res.json({

success:true,

user:{
name:user.name,
email:user.email,
phone:user.phone
}

});

}catch(err){

console.log(err);

return res.json({
success:false,
message:"Login Failed"
});

}

});


/* =========================
   GET HOSPITALS
========================= */

app.get("/api/hospitals",

async(req,res)=>{

try{

const hospitals =
await Hospital.find();

res.json(hospitals);

}catch(err){

console.log(err);

res.json([]);

}

});

/* =========================
   BOOK BED
========================= */

app.post("/api/book",

async (req,res)=>{

try{

const {

hospitalName,
patientName,
patientAge,
type,
paymentMode

} = req.body;

if(
!hospitalName ||
!patientName ||
!patientAge ||
!type ||
!paymentMode
){

return res.json({

success:false,
message:"Fill all fields"

});
}

const hospital =
await Hospital.findOne({

name:hospitalName

});

if(!hospital){

return res.json({

success:false,
message:"Hospital not found"

});
}

/* PRIVATE */

if(type==="private"){

if(hospital.privateBeds<=0){

return res.json({

success:false,
message:"Private Beds Full"

});
}

hospital.privateBeds--;
}

/* SHARED */

if(type==="shared"){

if(hospital.sharedBeds<=0){

return res.json({

success:false,
message:"Shared Beds Full"

});
}

hospital.sharedBeds--;
}

/* ICU */

if(type==="icu"){

if(hospital.icuBeds<=0){

return res.json({

success:false,
message:"ICU Beds Full"

});
}

hospital.icuBeds--;
}

await hospital.save();

/* RECEIPT */

const receipt =

"RCPT" +

Math.floor(
100000 +
Math.random()*900000
);

const booking =
new Booking({

hospitalName,
patientName,
patientAge,
type,
paymentMode,
receipt,

date:
new Date()
.toLocaleString()

});

await booking.save();

res.json({

success:true,

message:
"Bed Booked Successfully",

receipt

});

}catch(err){

console.log(err);

res.json({

success:false,
message:"Booking Failed"

});
}
});

/* =========================
   GET BOOKINGS
========================= */

app.get("/api/bookings",

async (req,res)=>{

try{

const bookings =
await Booking.find();

res.json(bookings);

}catch(err){

res.json([]);

}
});

/* =========================
   CANCEL BOOKING
========================= */

app.post("/api/cancel-booking",

async (req,res)=>{

try{

const { receipt } =
req.body;

const booking =
await Booking.findOne({

receipt

});

if(!booking){

return res.json({

success:false,
message:"Booking not found"

});
}

const hospital =
await Hospital.findOne({

name:
booking.hospitalName

});

if(hospital){

if(booking.type==="private"){

hospital.privateBeds++;
}

if(booking.type==="shared"){

hospital.sharedBeds++;
}

if(booking.type==="icu"){

hospital.icuBeds++;
}

await hospital.save();
}

await Booking.deleteOne({

receipt

});

res.json({

success:true,
message:"Booking Cancelled"

});

}catch(err){

console.log(err);

res.json({

success:false,
message:"Cancellation Failed"

});
}
});

/* =========================
   APPOINTMENT
========================= */

app.post("/api/appointment",

(req,res)=>{

try{

const appointmentNumber =

"APT" +

Math.floor(
1000 +
Math.random()*9000
);

res.json({

success:true,

appointmentNumber,

message:
"Appointment Confirmed. Please arrive 15 mins before appointment."

});

}catch(err){

console.log(err);

res.json({

success:false,
message:"Appointment Failed"

});
}
});

/* =========================
   AMBULANCE
========================= */

app.post("/api/ambulance",

(req,res)=>{

try{

const ambulanceNumber =

"UP32-" +

Math.floor(
1000 +
Math.random()*9000
);

const drivers = [

{
name:"Rahul Verma",
phone:"9876543210"
},

{
name:"Amit Singh",
phone:"9123456789"
},

{
name:"Ramesh Kumar",
phone:"9988776655"
}

];

const selectedDriver =

drivers[
Math.floor(
Math.random()*drivers.length
)
];

const arrival =

Math.floor(
5 +
Math.random()*10
);

res.json({

success:true,

ambulanceNumber,

driver:
selectedDriver.name,

driverPhone:
selectedDriver.phone,

arrival

});

}catch(err){

console.log(err);

res.json({

success:false,
message:"Ambulance Failed"

});
}
});

/* =========================
   AI CHATBOT
========================= */

app.post("/api/chatbot",

async (req,res)=>{

try{

const msg=
req.body.message
.toLowerCase()
.trim();

let reply="";

if(
msg.includes("hi") ||
msg.includes("hello") ||
msg.includes("hey")
){

reply=
"Hello 👋 I am your AI Health Assistant.";
}

else if(
msg.includes("fever")
){

reply=
"🤒 Fever may happen due to infection or flu. Stay hydrated and consult doctor if fever continues.";
}

else if(
msg.includes("cough")
){

reply=
"😷 Persistent cough may need medical attention.";
}

else if(
msg.includes("doctor")
){

reply=
"👨‍⚕ Doctors are available inside hospital cards.";
}

else if(
msg.includes("appointment")
){

reply=
"📅 Click Book Appointment button to schedule consultation.";
}

else if(
msg.includes("ambulance")
){

reply=
"🚑 Use Call Ambulance feature for emergency support.";
}

else if(
msg.includes("bed")
){

reply=
"🛏 You can check ICU, Shared and Private bed availability inside hospital cards.";
}

else{

reply=
"🤖 I can help with hospitals, doctors, ambulance and appointments.";
}

res.json({

reply

});

}catch(err){

console.log(err);

res.json({

reply:
"⚠ AI assistant unavailable"

});
}
});

/* =========================
   SERVER
========================= */

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {

console.log(
"✅ Server running on http://localhost:" + PORT
);

});

