const express = require('express');
const router = express.Router();
const Doctor = require('../models/doctor');

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

module.exports = router;