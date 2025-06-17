// node scripts/seedDoctors.js
const mongoose = require("mongoose");
const Doctor = require("../models/doctor");

const mongoURI = "mongodb+srv://vinodkumar07:vinod07@cluster0.fxhf4wc.mongodb.net/hp";

const doctors = [
    {
        name: "Dr. Sarah Johnson",
        specialty: "Cardiology",
        experience: "15 years",
        availability: "10:00 AM - 5:00 PM",
        todayAppointments: 8,
    },
    {
        name: "Dr. Michael Chen",
        specialty: "Dermatology",
        experience: "10 years",
        availability: "9:00 AM - 4:00 PM",
        todayAppointments: 5,
    },
    {
        name: "Dr. Emily Rodriguez",
        specialty: "Neurology",
        experience: "12 years",
        availability: "8:00 AM - 4:00 PM",
        todayAppointments: 3,
    },
    {
        name: "Dr. James Wilson",
        specialty: "Orthopedics",
        experience: "20 years",
        availability: "9:00 AM - 5:00 PM",
        todayAppointments: 4,
    },
    {
        name: "Dr. Srivani",
        specialty: "ENT",
        experience: "12 years",
        availability: "9:30 AM - 5:00 PM",
        todayAppointments: 6,
    },
    {
        name: "Dr. Aswini",
        specialty: "General Surgery",
        experience: "6.9 years",
        availability: "8:00 AM - 3:30 PM",
        todayAppointments: 7,
    },
    // continue the same for remaining doctors...
];

async function seedDoctors() {
    try {
        await mongoose.connect(mongoURI);
        console.log("Connected to MongoDB");

        // This line clears the existing doctor records
        await Doctor.deleteMany({});

        //  Insert new doctors
        await Doctor.insertMany(doctors);
        console.log("Doctors seeded successfully");
    } catch (error) {
        console.error("Error seeding doctors:", error);
    } finally {
        await mongoose.disconnect();
        console.log("MongoDB disconnected");
    }
}

seedDoctors();
