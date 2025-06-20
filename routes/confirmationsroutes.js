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
    console.log('Received data:', { patientData, doctorData, dateData });

    // Step 1: Check if doctor with same name exists or create
    let doctor = await Doctor.findOne({ name: doctorData.name });
    if (!doctor) {
      console.log('Creating new doctor:', doctorData);
      doctor = new Doctor({
        name: doctorData.name,
        specialty: doctorData.specialty,
        experience: doctorData.experience || '',
        education: doctorData.education || '',
        image: doctorData.image || ''
      });
      await doctor.save();
      console.log('New doctor created:', doctor);
    } else {
      console.log('Found existing doctor:', doctor);
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
    console.log('Patient saved:', patient);

    // Step 4: Create or reuse date
    let date = await DateModel.findOne({ date: dateData.date, time: dateData.time });
    if (!date) {
      date = new DateModel(dateData);
      await date.save();
    }
    console.log('Date saved:', date);

   // Step 5: Save confirmation
const confirmation = new Confirmation({
    patient: patient._id,
    doctor: doctor._id,
    doctorName: doctor.name,  
    date: date._id,
    status: 'pending'
});


    await confirmation.save();
    console.log('Confirmation saved:', confirmation);

    // Step 6: Return populated confirmation
    const populatedConfirmation = await Confirmation.findById(confirmation._id)
      .populate('doctor')
      .populate('patient')
      .populate('date')
      .lean();

    res.status(201).json(populatedConfirmation);
  } catch (error) {
    console.error('Error creating confirmation:', error);
    res.status(400).json({ error: error.message });
  }
});


// GET - Get all confirmations
router.get('/', async (req, res) => {
  try {
    console.log('Fetching confirmations...');
    
    const confirmations = await Confirmation.find()
      .populate({
        path: 'doctor',
        select: 'name specialty experience education image'
      })
      .populate({
        path: 'patient',
        select: 'name age gender blood contact'
      })
      .populate({
        path: 'date',
        select: 'date time'
      })
      .lean();

    console.log('Number of confirmations found:', confirmations.length);
    
    // Debug log to see raw data
    if (confirmations.length > 0) {
      console.log('First confirmation raw data:', JSON.stringify(confirmations[0], null, 2));
    }

    const formattedConfirmations = confirmations.map(confirmation => {
      // Debug log for each confirmation
      console.log('Processing confirmation:', {
        id: confirmation._id,
        doctor: confirmation.doctor,
        doctorName: confirmation.doctorName,
        patient: confirmation.patient,
        date: confirmation.date
      });

      // Get doctor name from either populated doctor or doctorName field
      const doctorName = confirmation.doctor?.name || confirmation.doctorName;

      // Create the formatted confirmation object
      const formattedConfirmation = {
        _id: confirmation._id,
        doctorData: {
          name: doctorName,
          specialty: confirmation.doctor?.specialty || '',
          experience: confirmation.doctor?.experience || '',
          education: confirmation.doctor?.education || '',
          image: confirmation.doctor?.image || ''
        },
        patientData: confirmation.patient ? {
          name: confirmation.patient.name || '',
          age: confirmation.patient.age || '',
          gender: confirmation.patient.gender || '',
          blood: confirmation.patient.blood || '',
          contact: confirmation.patient.contact || ''
        } : null,
        dateData: confirmation.date ? {
          date: confirmation.date.date || '',
          time: confirmation.date.time || ''
        } : null,
        status: confirmation.status || 'pending'
      };

      // Debug log for formatted data
      console.log('Formatted confirmation:', formattedConfirmation);

      return formattedConfirmation;
    });

    console.log('\nSending response with', formattedConfirmations.length, 'confirmations');
    res.json(formattedConfirmations);
  } catch (error) {
    console.error('Error fetching confirmations:', error);
    res.status(500).json({ error: error.message });
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

// PUT - Update (reschedule or cancel) a confirmation by ID
router.put('/:id', async (req, res) => {
  try {
    const { date, time, status, action } = req.body;
    const confirmation = await Confirmation.findById(req.params.id).populate('date').populate('doctor');
    if (!confirmation) {
      return res.status(404).json({ error: 'Confirmation not found' });
    }
    
    // Reschedule: update date and/or time
    if (action === 'reschedule' && date && time) {
      // Check if the new time slot is already booked for this doctor
      const existingConfirmations = await Confirmation.find({ 
        doctor: confirmation.doctor._id,
        _id: { $ne: confirmation._id } // Exclude current appointment
      }).populate('date');
      
      const slotTaken = existingConfirmations.some(conf =>
        conf.date.date === date && conf.date.time === time
      );

      if (slotTaken) {
        return res.status(400).json({
          error: 'This time slot is already booked for this doctor.'
        });
      }

      // Create or find the new date/time slot
      let dateDoc = await DateModel.findOne({ date, time });
      if (!dateDoc) {
        dateDoc = new DateModel({ date, time });
        await dateDoc.save();
      }
      
      confirmation.date = dateDoc._id;
      await confirmation.save();
      return res.json({ message: 'Appointment rescheduled', confirmation });
    }
    
    // Cancel: update status
    if (action === 'cancel') {
      confirmation.status = 'canceled';
      await confirmation.save();
      return res.json({ message: 'Appointment canceled', confirmation });
    }
    
    res.status(400).json({ error: 'Invalid action or missing data' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
