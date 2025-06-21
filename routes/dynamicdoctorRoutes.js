const express = require("express");
const router = express.Router();

const initialDoctors = [
    { name: "Dr. Sarah Johnson", specialty: "Cardiology", experience: "15 years" },
    { name: "Dr. Michael Chen", specialty: "Dermatology", experience: "10 years" },
    { name: "Dr. Emily Rodriguez", specialty: "Neurology", experience: "12 years" },
    { name: "Dr. James Wilson", specialty: "Orthopedics", experience: "20 years" },
    { name: "Dr. Srivani", specialty: "ENT", experience: "12 years" },
    { name: "Dr. Aswini", specialty: "General Surgery", experience: "6.9 years" },
    { name: "Dr. Akhila", specialty: "Gynecologist", experience: "8 years" },
    { name: "Dr. Vinod", specialty: "Pediatrics", experience: "10 years" },
    { name: "Dr. Kiran", specialty: "Radiology", experience: "11 years" },
    { name: "Dr. Keerthi", specialty: "Oncologist", experience: "12 years" },
    { name: "Dr. Vedanshi", specialty: "Gastroenterologist", experience: "10 years" },
    { name: "Dr. Vivek", specialty: "Dentist", experience: "15 years" },
    { name: "Dr. Om", specialty: "Andrologist", experience: "16 years" },
    { name: "Dr. Ganesh", specialty: "General Medicine", experience: "17 years" },
    { name: "Dr. Ayesha Khan", specialty: "Endocrinologist", experience: "9 years" },
    { name: "Dr. Rohit Sharma", specialty: "Nephrologist", experience: "14 years" },
    { name: "Dr. Meera Iyer", specialty: "Psychiatrist", experience: "11 years" },
    { name: "Dr. Arjun Patel", specialty: "Pulmonologist", experience: "13 years" },
    { name: "Dr. Sneha Reddy", specialty: "Ophthalmologist", experience: "7 years" },
    { name: "Dr. Prakash Verma", specialty: "Rheumatologist", experience: "16 years" },
    { name: "Dr. Nidhi Saxena", specialty: "Hematologist", experience: "8 years" },
    { name: "Dr. Manish Desai", specialty: "Urologist", experience: "12 years" },
    { name: "Dr. Priya Nair", specialty: "Pathologist", experience: "10 years" },
];

// GET  /api/dynamic-doctors  → fixed list
router.get("/", (req, res) => res.json(initialDoctors));




module.exports = router;
