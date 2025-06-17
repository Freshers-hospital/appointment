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

    const query = {};

    // Step 1: Resolve date filter
    if (date) {
      const dateDoc = await DateModel.findOne({ date });
      if (!dateDoc) return res.json([]);
      query.date = dateDoc._id;
    }

    // Step 2: Resolve doctor filter
    if (doctorName) {
      const doctor = await Doctor.findOne({ name: doctorName });
      if (!doctor) return res.json([]);
      query.doctor = doctor._id;
    }

    // Step 3: Fetch confirmations and populate all references
    const confirmations = await Confirmation.find(query)
      .populate('patient', 'name age gender blood contact')
      .populate('doctor', 'name specialty')
      .populate('date', 'date time');

    // Step 4: Filter out null references BEFORE mapping
    const safeConfirmations = confirmations.filter(conf =>
      conf.patient && conf.doctor && conf.date
    );

    // Step 5: Format output
    const formatted = safeConfirmations.map(conf => ({

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


    res.json(formatted);
  } catch (err) {
    console.error('Failed to fetch confirmations:', err);
    res.status(500).json({ error: 'Server error fetching confirmations' });

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
