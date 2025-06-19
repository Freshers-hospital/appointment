// npm i moment-timezone   ← if you don't have it yet
const moment = require("moment-timezone");
const Appointment = require("../models/appointment");
const Doctor = require("../models/doctor");

const getTodayCounts = async (req, res) => {
    try {
        const today = new Date();
        const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

        // Aggregate appointment counts per doctor for today
        const counts = await Confirmation.aggregate([
            {
                $match: {
                    date: { $gte: startOfDay, $lt: endOfDay },
                },
            },
            {
                $group: {
                    _id: "$doctorId",
                    count: { $sum: 1 },
                },
            },
        ]);

        // Get all doctors
        const doctors = await Doctor.find();

        // Create a map of doctorId to count
        const countMap = {};
        counts.forEach((c) => {
            countMap[c._id.toString()] = c.count;
        });

        // Add today's appointment count to each doctor
        const doctorsWithCounts = doctors.map((doctor) => ({
            _id: doctor._id,
            name: doctor.name,
            specialty: doctor.specialty,
            experience: doctor.experience,
            todaysAppointments: countMap[doctor._id.toString()] || 0,
        }));

        res.json(doctorsWithCounts);
    } catch (error) {
        console.error("Error fetching today's appointment counts:", error);
        res.status(500).json({ error: "Server error" });
    }
};

module.exports = { getTodayCounts };
