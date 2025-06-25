const express = require('express');
const router = express.Router();
const Doctor = require('../models/doctorModel');


router.post('/', async (req, res) => {
  try {
    const { name, specialty, availability } = req.body;
    const doctor = new Doctor({ name, specialty, availability });
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
