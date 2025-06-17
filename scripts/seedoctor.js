
const mongoose = require('mongoose');
const Doctor   = require('../models/doctor');

const mongoURI = "mongodb+srv://vinodkumar07:vinod07@cluster0.fxhf4wc.mongodb.net/hp";


// const doctors = [
//   { name: "Dr. Sarah Johnson",  specialty: "Cardiology",         experience: "15 years" },
//   { name: "Dr. Michael Chen",   specialty: "Dermatology",        experience: "10 years" },
//   { name: "Dr. Emily Rodriguez",specialty: "Neurology",          experience: "12 years" },
//   { name: "Dr. James Wilson",   specialty: "Orthopedics",        experience: "20 years" },
//   { name: "Dr. Srivani",        specialty: "ENT",                experience: "12 years" },
//   { name: "Dr. Aswini",         specialty: "General Surgery",    experience: "6.9 years"},
//   { name: "Dr. Akhila",         specialty: "Gynecologist",       experience: "8 years" },
//   { name: "Dr. Vinod",          specialty: "Pediatrics",         experience: "10 years" },
//   { name: "Dr. Kiran",          specialty: "Radiology",          experience: "11 years" },
//   { name: "Dr. Keerthi",        specialty: "Oncologist",         experience: "12 years" },
//   { name: "Dr. Vedanshi",       specialty: "Gastroenterologist", experience: "10 years" },
//   { name: "Dr. Vivek",          specialty: "Dentist",            experience: "15 years" },
//   { name: "Dr. Om",             specialty: "Andrologist",        experience: "16 years" }
// ];

const doctors = [
  {
    name: "Dr. Sarah Johnson",
    specialty: "Cardiology",
    experience: "15 years",
    availability: "10:00 AM - 5:00 PM",
    todayAppointments: 8
  },
  {
    name: "Dr. Michael Chen",
    specialty: "Dermatology",
    experience: "10 years",
    availability: "9:00 AM - 4:00 PM",
    todayAppointments: 5
  },
  {
    name: "Dr. Emily Rodriguez",
    specialty: "Neurology",
    experience: "12 years",
    availability: "8:00 AM - 4:00 PM",
    todayAppointments: 3
  },
  {
    name: "Dr. James Wilson",
    specialty: "Orthopedics",
    experience: "20 years",
    availability: "9:00 AM - 5:00 PM",
    todayAppointments: 4
  },
  {
    name: "Dr. Srivani",
    specialty: "ENT",
    experience: "12 years",
    availability: "9:30 AM - 5:00 PM",
    todayAppointments: 6
  },
  {
    name: "Dr. Aswini",
    specialty: "General Surgery",
    experience: "6.9 years",
    availability: "8:00 AM - 3:30 PM",
    todayAppointments: 7
  },
  // continue the same for remaining doctors...
];




// (async () => {
//   try {
//     await mongoose.connect(mongoURI);
//     await Doctor.deleteMany({});
//     await Doctor.insertMany(doctors);
//     console.log('✅ Doctors seeded');
//   } catch (err) {
//     console.error(err);
//   } finally {
//     await mongoose.disconnect();
//   }
// })();


async function seedDoctors() {
  try {
    await mongoose.connect(mongoURI);
    console.log('Connected to MongoDB');

    
    await Doctor.deleteMany({});


    await Doctor.insertMany(doctors);
    console.log('Doctors seeded successfully');
  } catch (error) {
    console.error('Error seeding doctors:', error);
  } finally {
    await mongoose.disconnect();
    console.log('MongoDB disconnected');
  }
}

seedDoctors();