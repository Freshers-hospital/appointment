const express = require('express');
const router = express.Router();
const Confirmation = require('../models/confirmation');
const Patient = require('../models/patient');
const Doctor = require('../models/doctor');
const DateModel = require('../models/date');

// POST - Create a confirmation
router.post('/', async (req, res) => {
  try {
    const { patientData, doctorData, dateData } = req.body;

    // Step 1: Check if doctor with same name exists or create
    let doctor = await Doctor.findOne({ name: doctorData.name });
    if (!doctor) {
      doctor = new Doctor(doctorData);
      await doctor.save();
    }

  
    // Step 2: Check if a booking already exists with same doctor, date, and time
const existingConfirmations = await Confirmation.find({ doctor: doctor._id }).populate('date');

const slotTaken = existingConfirmations.some(conf =>
  conf.date.date === dateData.date && conf.date.time === dateData.time
);

if (slotTaken) {
  return res.status(400).json({
    error: 'This time slot is already booked for this doctor.'
  });
}

    // Step 3: Save patient
    const patient = new Patient(patientData);
    await patient.save();

    // Step 4: Create or reuse date
    let date = await DateModel.findOne({ date: dateData.date, time: dateData.time });
    if (!date) {
      date = new DateModel(dateData);
      await date.save();
    }

    // Step 5: Save confirmation
    const confirmation = new Confirmation({
      patient: patient._id,
      doctor: doctor._id,
      date: date._id
    });

    await confirmation.save();

    res.status(201).json(confirmation);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});


// GET - Retrieve all confirmations with populated references
router.get('/', async (req, res) => {
  try {
    const confirmations = await Confirmation.find()
      .populate('patient')
      .populate('doctor')
      .populate('date');

    res.status(200).json(confirmations);
  } catch (error) {
    console.error('Failed to fetch confirmations:', error);
    res.status(500).json({ error: 'Server error' });
  }
});
router.get('/booked-slots', async (req, res) => {
  const { doctorName, date } = req.query;

  try {
    const doctor = await Doctor.findOne({ name: doctorName });
    if (!doctor) return res.status(404).json({ error: 'Doctor not found' });

    const confirmations = await Confirmation.find({ doctor: doctor._id }).populate('date');

    const bookedTimes = confirmations
      .filter(c => c.date.date === date)
      .map(c => c.date.time);

    res.json({ bookedTimes });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
