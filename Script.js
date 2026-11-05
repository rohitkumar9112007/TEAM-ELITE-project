// Sample doctor information
var doctors = [
    {
        id: 1,
        name: "Dr. Rahul Sharma",
        specialty: "General Physician",
        qualification: "MBBS, MD",
        fee: 500,
        hours: "9 AM - 1 PM"
    },
    {
        id: 2,
        name: "Dr. Priya Verma",
        specialty: "Pediatrician",
        qualification: "MBBS, DCH",
        fee: 600,
        hours: "10 AM - 2 PM"
    },
    {
        id: 3,
        name: "Dr. Aman Gupta",
        specialty: "Dermatologist",
        qualification: "MBBS, MD Dermatology",
        fee: 700,
        hours: "11 AM - 3 PM"
    },
    {
        id: 4,
        name: "Dr. Neha Singh",
        specialty: "Dentist",
        qualification: "BDS, MDS",
        fee: 400,
        hours: "9 AM - 12 PM"
    }
];

// Sample consultation timings
var slots = [
    "09:00 AM",
    "10:00 AM",
    "11:00 AM",
    "12:00 PM",
    "01:00 PM",
    "02:00 PM"
];

// Load saved demo appointments
var appointments =
    JSON.parse(localStorage.getItem("clinicAppointments")) || [];

var selectedSlot = "";

// Get HTML elements
var doctorList = document.getElementById("doctor-list");
var doctorSelect = document.getElementById("doctor");
var dateInput = document.getElementById("appointment-date");
var slotList = document.getElementById("slot-list");
var form = document.getElementById("appointment-form");

// Get today's date
function getToday() {
    var today = new Date();
    var year = today.getFullYear();
    var month = String(today.getMonth() + 1).padStart(2, "0");
    var day = String(today.getDate()).padStart(2, "0");

    return year + "-" + month + "-" + day;
}

// Save appointments in browser storage
function saveAppointments() {
    localStorage.setItem(
        "clinicAppointments",
        JSON.stringify(appointments)
    );
}

// Make user-entered text safe for HTML display
function safeText(text) {
    return String(text)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

// Display doctor cards
function showDoctors() {
    var specialty = document.getElementById("specialty").value;

    doctorList.innerHTML = "";
    doctorSelect.innerHTML =
        '<option value="">Choose a doctor</option>';

    for (var i = 0; i < doctors.length; i++) {
        var doctor = doctors[i];

        if (specialty === "All" ||
            doctor.specialty === specialty) {

            doctorList.innerHTML += `
                <div class="doctor-card">
                    <h3>${safeText(doctor.name)}</h3>
                    <p><strong>Specialty:</strong> ${safeText(doctor.specialty)}</p>
                    <p><strong>Qualification:</strong> ${safeText(doctor.qualification)}</p>
                    <p><strong>Consultation Fee:</strong> Rs. ${doctor.fee}</p>
                    <p><strong>Available Hours:</strong> ${safeText(doctor.hours)}</p>
                    <button class="book-button"
                        onclick="selectDoctor(${doctor.id})">
                        Book Appointment
                    </button>
                </div>
            `;
        }

        // Add every doctor to the booking dropdown
        doctorSelect.innerHTML += `
            <option value="${doctor.id}">
                ${safeText(doctor.name)} - ${safeText(doctor.specialty)}
            </option>
        `;
    }
}

// Select doctor from doctor card
function selectDoctor(id) {
    doctorSelect.value = id;
    showSlots();

    document.getElementById("booking").scrollIntoView();
}

// Check whether a slot is already booked
function isBooked(doctorId, date, time) {
    for (var i = 0; i < appointments.length; i++) {
        if (appointments[i].doctorId == doctorId &&
            appointments[i].date === date &&
            appointments[i].time === time) {
            return true;
        }
    }

    return false;
}

// Display available and booked slots
function showSlots() {
    var doctorId = doctorSelect.value;
    var date = dateInput.value;

    selectedSlot = "";
    document.getElementById("selected-slot").value = "";

    slotList.innerHTML = "";

    if (doctorId === "" || date === "") {
        slotList.textContent =
            "Please select a doctor and date first.";
        return;
    }

    if (date < getToday()) {
        slotList.textContent = "Please select a future date.";
        return;
    }

    for (var i = 0; i < slots.length; i++) {
        var time = slots[i];
        var booked = isBooked(doctorId, date, time);

        var button = document.createElement("button");
        button.textContent = time;

        if (booked) {
            button.className = "slot booked";
            button.disabled = true;
            button.textContent = time + " - Booked";
        } else {
            button.className = "slot";

            button.onclick = function (event) {
                event.preventDefault();

                var allSlots =
                    document.querySelectorAll(".slot");

                for (var j = 0; j < allSlots.length; j++) {
                    allSlots[j].classList.remove("selected");
                }

                this.classList.add("selected");
                selectedSlot = this.textContent;
                document.getElementById("selected-slot").value =
                    selectedSlot;
            };
        }

        slotList.appendChild(button);
    }
}

// Book an appointment
form.addEventListener("submit", function (event) {
    event.preventDefault();

    var doctorId = doctorSelect.value;
    var date = dateInput.value;
    var patientName =
        document.getElementById("patient-name").value.trim();
    var age = Number(document.getElementById("age").value);
    var phone = document.getElementById("phone").value;
    var symptoms =
        document.getElementById("symptoms").value.trim();

    var message = document.getElementById("message");

    if (doctorId === "" || date === "") {
        message.textContent = "Please select a doctor and date.";
        return;
    }

    if (selectedSlot === "") {
        message.textContent = "Please select an available time slot.";
        return;
    }

    if (patientName === "" || symptoms === "") {
        message.textContent = "Please fill all required fields.";
        return;
    }

    if (age < 1 || age > 120) {
        message.textContent = "Please enter a valid age.";
        return;
    }

    if (!/^[0-9]{10}$/.test(phone)) {
        message.textContent = "Enter a valid 10-digit phone number.";
        return;
    }

    if (date < getToday()) {
        message.textContent = "Please select a future date.";
        return;
    }

    if (isBooked(doctorId, date, selectedSlot)) {
        message.textContent = "This slot is already booked.";
        showSlots();
        return;
    }

    var doctorName = "";

    for (var i = 0; i < doctors.length; i++) {
        if (doctors[i].id == doctorId) {
            doctorName = doctors[i].name;
        }
    }

    // Count existing appointments for this doctor and date
    var token = 1;

    for (var i = 0; i < appointments.length; i++) {
        if (appointments[i].doctorId == doctorId &&
            appointments[i].date === date) {
            token++;
        }
    }

    var appointment = {
        id: Date.now(),
        doctorId: doctorId,
        doctorName: doctorName,
        patientName: patientName,
        age: age,
        phone: phone,
        symptoms: symptoms,
        date: date,
        time: selectedSlot,
        token: token
    };

    appointments.push(appointment);

    saveAppointments();

    message.textContent =
        "Appointment booked! Your demo token number is " + token;

    form.reset();
    selectedSlot = "";

    showSlots();
    showAppointments();
});

// Display booked appointments
function showAppointments() {
    var list = document.getElementById("appointment-list");

    list.innerHTML = "";

    if (appointments.length === 0) {
        list.textContent = "No appointments booked yet.";
        return;
    }

    for (var i = 0; i < appointments.length; i++) {
        var appointment = appointments[i];

        list.innerHTML += `
            <div class="appointment-card">
                <h3>${safeText(appointment.patientName)}</h3>
                <p>Doctor: ${safeText(appointment.doctorName)}</p>
                <p>Date: ${safeText(appointment.date)}</p>
                <p>Time: ${safeText(appointment.time)}</p>
                <p>Token Number: ${appointment.token}</p>
                <button class="cancel-button"
                    onclick="cancelAppointment(${appointment.id})">
                    Cancel Appointment
                </button>
            </div>
        `;
    }
}

// Cancel an appointment
function cancelAppointment(id) {
    if (confirm("Do you want to cancel this appointment?")) {
        var newAppointments = [];

        for (var i = 0; i < appointments.length; i++) {
            if (appointments[i].id !== id) {
                newAppointments.push(appointments[i]);
            }
        }

        appointments = newAppointments;

        saveAppointments();
        showAppointments();
        showSlots();
    }
}

// Change doctors when specialty filter changes
document.getElementById("specialty")
    .addEventListener("change", showDoctors);

// Update slots when doctor or date changes
doctorSelect.addEventListener("change", showSlots);
dateInput.addEventListener("change", showSlots);

// Set today's date as the earliest selectable date
dateInput.min = getToday();

// Display doctors and saved appointments when page opens
showDoctors();
showAppointments();
