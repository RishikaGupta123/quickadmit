let hospitals = [];

let selectedHospital = "";
let selectedType = "";
let appointmentHospital = "";
let ambulanceBooked = false;

/* =========================
   LOAD HOSPITALS
========================= */

async function loadHospitals() {

    try {

        const response =
            await fetch("/api/hospitals");

        hospitals =
            await response.json();

        displayHospitals(hospitals);

    }

    catch (err) {

        console.log(err);
    }
}

/* =========================
   BED STATUS
========================= */

function bedStatus(count) {

    if (count <= 0) {

        return `
        <span style="
        background:red;
        color:white;
        padding:5px 10px;
        border-radius:8px;
        font-size:12px;
        ">
        FULL
        </span>
        `;
    }

    else if (count <= 3) {

        return `
        <span style="
        background:orange;
        color:white;
        padding:5px 10px;
        border-radius:8px;
        font-size:12px;
        ">
        Few Beds Left
        </span>
        `;
    }

    else {

        return `
        <span style="
        background:green;
        color:white;
        padding:5px 10px;
        border-radius:8px;
        font-size:12px;
        ">
        Available
        </span>
        `;
    }
}

/* =========================
   DISPLAY HOSPITALS
========================= */
function displayHospitals(data){

const div=
document.getElementById(
"hospitalList"
);

if(!div) return;

div.innerHTML="";

const images=[

"https://images.unsplash.com/photo-1586773860418-d37222d8fce3?q=80&w=1200&auto=format&fit=crop",

"https://images.unsplash.com/photo-1516549655169-df83a0774514?q=80&w=1200&auto=format&fit=crop",

"https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=1200&auto=format&fit=crop"

];

data.forEach((h,index)=>{

const image=
images[index % images.length];

div.innerHTML+=`

<div class="card">

<img src="${image}">

<div class="content">

<h2>
${h.name}
</h2>

<p>
🏥 
<b style="
color:${h.category==="government"?"green":"#2563eb"};
font-size:16px;
">
${h.category.toUpperCase()} HOSPITAL
</b>
</p>

<p>
📍 ${h.city}
</p>

<p>
⭐ ${h.rating}
</p>

<p>
📞 
<a 
href="tel:${h.phone}"
style="
color:#2563eb;
font-weight:bold;
text-decoration:none;
">
${h.phone}
</a>
</p>

<hr><br>

<div class="bed-box">

<p>

<b>
Private Beds:
${h.privateBeds}
</b>

${bedStatus(h.privateBeds)}

</p>

<br>

<button
${h.privateBeds<=0 ? "disabled" : ""}
onclick="openBooking('${h.name}','private',${h.privateBeds})">

Book Private

</button>

</div>

<div class="bed-box">

<p>

<b>
Shared Beds:
${h.sharedBeds}
</b>

${bedStatus(h.sharedBeds)}

</p>

<br>

<button
${h.sharedBeds<=0 ? "disabled" : ""}
onclick="openBooking('${h.name}','shared',${h.sharedBeds})">

Book Shared

</button>

</div>

<div class="bed-box">

<p>

<b>
ICU Beds:
${h.icuBeds}
</b>

${bedStatus(h.icuBeds)}

</p>

<br>

<button
${h.icuBeds<=0 ? "disabled" : ""}
onclick="openBooking('${h.name}','icu',${h.icuBeds})">

Book ICU

</button>

</div>

<br>

<h3>
👨‍⚕ Doctors Available
</h3>

<p>
${h.doctors.join(", ")}
</p>

<br>

<button
class="green"
onclick="openAppointment('${h.name}')">

Book Appointment

</button>

</div>

</div>

`;

});
}
/* =========================
   SEARCH
========================= */

function searchHospital() {

    const city =
        document
            .getElementById("citySearch")
            .value
            .toLowerCase();

    const category =
        document
            .getElementById("hospitalCategory")
            .value;

    const filtered =
        hospitals.filter(h => {

            const cityMatch =

                city === "" ||

                h.city
                    .toLowerCase()
                    .includes(city);

            const categoryMatch =

                category === "all" ||

                h.category === category;

            return cityMatch &&
                categoryMatch;
        });

    displayHospitals(filtered);
}

/* =========================
   BOOKING
========================= */

function openBooking(hospital, type, beds) {

    if (beds <= 0) {

        alert("No Beds Available");
        return;
    }

    selectedHospital = hospital;
    selectedType = type;

    document
        .getElementById("bookingModal")
        .style.display = "flex";
}

function closeBookingModal() {

    document
        .getElementById("bookingModal")
        .style.display = "none";
}

/* =========================
   CONFIRM BOOKING
========================= */

async function confirmBooking() {

    const patientName =
        document
            .getElementById("patientName")
            .value;

    const patientAge =
        document
            .getElementById("patientAge")
            .value;

    const paymentMode =
        document
            .getElementById("paymentMode")
            .value;

    if (
        !patientName ||
        !patientAge ||
        !paymentMode
    ) {

        alert("Fill all fields");
        return;
    }

    const response =
        await fetch("/api/book", {

            method: "POST",

            headers: {
                "Content-Type":
                    "application/json"
            },

            body: JSON.stringify({

                hospitalName: selectedHospital,
                patientName,
                patientAge,
                type: selectedType,
                paymentMode

            })

        });

    const data =
        await response.json();

    if (!data.success) {

        alert(data.message);
        return;
    }

    closeBookingModal();

    const today =
        new Date()
            .toLocaleString();

    alert(

        "✅ BED BOOKED SUCCESSFULLY\n\n" +
        "🏥 Hospital: " + selectedHospital +
        "\n👤 Patient: " + patientName +
        "\n🎂 Age: " + patientAge +
        "\n🛏 Bed Type: " + selectedType.toUpperCase() +
        "\n💳 Payment: " + paymentMode +
        "\n🧾 Receipt: " + data.receipt +
        "\n📅 Date: " + today

    );

    loadHospitals();
}

/* =========================
   BOOKINGS
========================= */

async function openBookings() {

    document
        .getElementById("bookingsModal")
        .style.display = "flex";

    const response =
        await fetch("/api/bookings");

    const bookings =
        await response.json();

    const div =
        document.getElementById(
            "bookingCards"
        );

    div.innerHTML = "";

    if (bookings.length === 0) {

        div.innerHTML = `

        <div class="booking-card">

        <h3>
        No Bookings Yet
        </h3>

        </div>

        `;

        return;
    }

    bookings.forEach(b => {

        div.innerHTML += `

        <div class="booking-card">

            <h3>
            👤 ${b.patientName}
            </h3>

            <p>
            🏥 ${b.hospitalName}
            </p>

            <p>
            🛏 ${b.type.toUpperCase()}
            </p>

            <p>
            🎂 ${b.patientAge}
            </p>

            <p>
            💳 ${b.paymentMode}
            </p>

            <p>
            🧾 ${b.receipt}
            </p>

            <p>
            📅 ${b.date}
            </p>

            <br>

            <button
            class="red"
            onclick="cancelBooking('${b.receipt}')">

            Cancel Booking

            </button>

        </div>

        `;
    });
}

function closeBookings() {

    document
        .getElementById("bookingsModal")
        .style.display = "none";
}

/* =========================
   CANCEL BOOKING
========================= */

async function cancelBooking(receipt) {

    const ok =
        confirm("Cancel Booking?");

    if (!ok) return;

    const response =
        await fetch("/api/cancel-booking", {

            method: "POST",

            headers: {
                "Content-Type":
                    "application/json"
            },

            body: JSON.stringify({
                receipt
            })

        });

    const data =
        await response.json();

    alert(data.message);

    openBookings();

    loadHospitals();
}

/* =========================
   APPOINTMENTS
========================= */

function openAppointment(hospital) {

    appointmentHospital = hospital;

    document
        .getElementById("appointmentModal")
        .style.display = "flex";
}

function closeAppointment() {

    document
        .getElementById("appointmentModal")
        .style.display = "none";
}

async function confirmAppointment() {

    const doctor =
        document
            .getElementById("doctorName")
            .value;

    const patientName =
        document
            .getElementById("appointPatient")
            .value;

    const patientAge =
        document
            .getElementById("appointAge")
            .value;

    const appointmentDate =
        document
            .getElementById("appointDate")
            .value;

    if (
        !doctor ||
        !patientName ||
        !patientAge ||
        !appointmentDate
    ) {

        alert("Fill all fields");
        return;
    }

    const response =
        await fetch("/api/appointment", {

            method: "POST",

            headers: {
                "Content-Type":
                    "application/json"
            },

            body: JSON.stringify({

                hospitalName:
                    appointmentHospital,

                doctor,
                patientName,
                patientAge,
                appointmentDate

            })

        });

    const data =
        await response.json();

    if (data.success) {

        const appointments =

            JSON.parse(
                localStorage.getItem(
                    "appointments"
                ) || "[]"
            );

        appointments.push({

            hospital:
                appointmentHospital,

            doctor,
            patientName,
            patientAge,
            appointmentDate,

            appointmentNumber:
                data.appointmentNumber

        });

        localStorage.setItem(

            "appointments",

            JSON.stringify(appointments)

        );

        alert(

            "✅ Appointment Confirmed\n\n" +
            "🆔 Appointment ID: " +
            data.appointmentNumber +
            "\n🏥 Hospital: " +
            appointmentHospital +
            "\n👨‍⚕ Doctor: " +
            doctor +
            "\n📅 Date: " +
            appointmentDate

        );

        closeAppointment();
    }
}

/* =========================
   MY APPOINTMENTS
========================= */

function openAppointments() {

    document
        .getElementById("bookingsModal")
        .style.display = "flex";

    const div =
        document.getElementById(
            "bookingCards"
        );

    div.innerHTML = "";

    const appointments =

        JSON.parse(
            localStorage.getItem(
                "appointments"
            ) || "[]"
        );

    if (appointments.length === 0) {

        div.innerHTML = `

        <div class="booking-card">

        <h3>
        No Appointments Yet
        </h3>

        </div>

        `;

        return;
    }

    appointments.forEach(a => {

        div.innerHTML += `

        <div class="booking-card">

            <h3>
            👤 ${a.patientName}
            </h3>

            <p>
            🏥 ${a.hospital}
            </p>

            <p>
            👨‍⚕ ${a.doctor}
            </p>

            <p>
            📅 ${a.appointmentDate}
            </p>

            <p>
            🆔 ${a.appointmentNumber}
            </p>

        </div>

        `;
    });
}

/* =========================
   AMBULANCE
========================= */

function openAmbulance() {

    document
        .getElementById("ambulanceModal")
        .style.display = "flex";
}

function closeAmbulance() {

    document
        .getElementById("ambulanceModal")
        .style.display = "none";
}

async function confirmAmbulance() {

    if (ambulanceBooked) {

        alert(
            "Ambulance Already Booked"
        );

        return;
    }

    const response =
        await fetch("/api/ambulance", {

            method: "POST"

        });

    const data =
        await response.json();

    ambulanceBooked = true;

    document
        .getElementById("ambulanceResult")
        .innerHTML = `

        <div class="booking-card">

            <h3>
            🚑 Ambulance Confirmed
            </h3>

            <p>
            👨 Driver:
            ${data.driver}
            </p>

            <p>
            📞 ${data.driverPhone}
            </p>

            <p>
            🚑 ${data.ambulanceNumber}
            </p>

            <p>
            ⏱ Arrival:
            ${data.arrival} mins
            </p>

        </div>

        `;
}

/* =========================
   CHATBOT
========================= */

function toggleChatbot() {

    const bot =
        document.getElementById(
            "chatbot"
        );

    if (bot.style.display === "block") {

        bot.style.display = "none";
    }

    else {

        bot.style.display = "block";
    }
}

async function sendMessage() {

    const input =
        document
            .getElementById("chatInput");

    const msg = input.value;

    if (!msg) return;

    const chat =
        document
            .getElementById("chatMessages");

    chat.innerHTML += `

    <p>
    <b>You:</b>
    ${msg}
    </p>

    `;

    input.value = "";

    const response =
        await fetch("/api/chatbot", {

            method: "POST",

            headers: {
                "Content-Type":
                    "application/json"
            },

            body: JSON.stringify({
                message: msg
            })

        });

    const data =
        await response.json();

    chat.innerHTML += `

    <p>
    <b>Bot:</b>
    ${data.reply}
    </p>

    `;

    chat.scrollTop =
        chat.scrollHeight;
}

/* =========================
   DARK MODE
========================= */

function toggleDarkMode(){

document.body.classList.toggle("dark");

localStorage.setItem(
"darkMode",
document.body.classList.contains("dark")
);

}

/* =========================
   LOGOUT
========================= */

function logout() {

    window.location.href =
        "/login.html";
}

/* =========================
   WINDOW LOAD
========================= */

window.onload=function(){

loadHospitals();

/* LOAD DARK MODE */

const darkMode =
localStorage.getItem("darkMode");

if(darkMode==="true"){

document.body.classList.add("dark");

}

};