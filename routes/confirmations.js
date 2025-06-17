const express = require('express');
const router = express.Router();
const Confirmation = require('../models/confirmation');
const Patient = require('../models/patient');
const Doctor = require('../models/doctor');
const DateModel = require('../models/date');


router.post('/', async (req, res) => {
  try {
    const { patientData, doctorData, dateData } = req.body;

   
    let doctor = await Doctor.findOne({ name: doctorData.name });
    if (!doctor) {
      doctor = new Doctor(doctorData);
      await doctor.save();
    }

  
    
const existingConfirmations = await Confirmation.find({ doctor: doctor._id }).populate('date');

const slotTaken = existingConfirmations.some(conf =>
  conf.date.date === dateData.date && conf.date.time === dateData.time
);

if (slotTaken) {
  return res.status(400).json({
    error: 'This time slot is already booked for this doctor.'
  });
}

   
    const patient = new Patient(patientData);
    await patient.save();

    
    let date = await DateModel.findOne({ date: dateData.date, time: dateData.time });
    if (!date) {
      date = new DateModel(dateData);
      await date.save();
    }
  
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



 router.get('/', async (req, res) => {
  try {
    const { date, doctorName } = req.query;
    let query = {};

    // If date is provided, find the date document first
    if (date) {
      const dateDoc = await DateModel.findOne({ date });
      if (dateDoc) {
        query.date = dateDoc._id;
      } else {
        return res.json([]); // Return empty array if no date found
      }
    }

    // If doctor name is provided, find the doctor document first
    if (doctorName) {
      const doctor = await Doctor.findOne({ name: doctorName });
      if (doctor) {
        query.doctor = doctor._id;
      } else {
        return res.json([]); // Return empty array if no doctor found
      }
    }

    const confirmations = await Confirmation.find(query)
      .populate('patient')
      .populate('doctor')
      .populate('date');

    // Format the response
    const formattedConfirmations = confirmations.map(conf => ({
      patientData: {
        name: conf.patient.name,
        age: conf.patient.age,
        gender: conf.patient.gender,
        blood: conf.patient.blood,
        contact: conf.patient.contact
      },
      doctorData: {
        name: conf.doctor.name,
        specialty: conf.doctor.specialty
      },
      dateData: {
        date: conf.date.date,
        time: conf.date.time
      }
    }));

    res.status(200).json(formattedConfirmations);
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


router.get('/search', async (req, res) => {
  const { doctorName, date } = req.query;

  try {
    
    const doctor = await Doctor.findOne({ name: doctorName });
    if (!doctor) {
      return res.status(404).json({ error: 'Doctor not found' });
    }

    
    const confirmations = await Confirmation.find({ doctor: doctor._id })
      .populate('patient')
      .populate('doctor')
      .populate('date');

    
    const filtered = confirmations.filter(conf => conf.date.date === date);

    res.status(200).json(filtered);
  } catch (error) {
    console.error('Error filtering appointments:', error);
    res.status(500).json({ error: 'Server error' });
  }
});


module.exports = router;
