const express = require('express');
const router = express.Router();
const Doctor = require('../models/doctor');
const Confirmation = require('../models/confirmation');
const DateModel = require('../models/date');

router.post('/', async (req, res) => {
  try {
    console.log('Add Doctor POST body:', req.body); 
    const { name, specialty, availability, experience, qualification, education, image } = req.body;
    const doctor = new Doctor({ name, specialty, availability, experience, qualification, education, image });
    await doctor.save();
    res.status(201).json(doctor);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});


router.get('/', async (req, res) => {
  try {
    const doctors = await Doctor.find();
    res.json(doctors);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/doctors/:doctorId/availability?date=YYYY-MM-DD
router.get('/:doctorId/availability', async (req, res) => {
  const { doctorId } = req.params;
  const { date } = req.query;
  try {
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) return res.status(404).json({ error: 'Doctor not found' });

    // Check per-date availability first
    let start, end;
    if (doctor.availabilityByDate && doctor.availabilityByDate.get(date)) {
      start = doctor.availabilityByDate.get(date).start;
      end = doctor.availabilityByDate.get(date).end;
    } else {
      // Fallback to default availability
      [start, end] = (doctor.availability || "9:00 AM - 5:00 PM").split('-').map(s => s.trim());
    }

    // Find booked slots for this doctor on this date
    const confirmations = await Confirmation.find({ doctor: doctor._id }).populate("date");
    const booked = confirmations
      .filter(c => c.date && c.date.date === date && c.status !== 'canceled' && c.status !== 'cancelled')
      .map(c => c.date.time);

    res.json({ start, end, booked });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/doctors/:doctorId/availability
// Body: { date: 'YYYY-MM-DD', start: '10:00 AM', end: '2:00 PM' }
router.post('/:doctorId/availability', async (req, res) => {
  const { doctorId } = req.params;
  const { date, start, end } = req.body;
  if (!date || !start || !end) return res.status(400).json({ error: 'date, start, and end are required' });
  try {
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) return res.status(404).json({ error: 'Doctor not found' });
    doctor.availabilityByDate.set(date, { start, end });
    await doctor.save();
    res.json({ message: 'Availability updated', date, start, end });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;