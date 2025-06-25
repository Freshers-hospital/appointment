const express = require("express");
const router = express.Router();
const Confirmation = require('../models/confirmationModel');
const Patient = require('../models/patientModel');
const Doctor = require('../models/doctorModel');
const DateModel = require('../models/dateModel');

router.post("/", async (req, res) => {
    try {
        const { patientData, doctorData, dateData } = req.body;
        console.log("Received data:", { patientData, doctorData, dateData });

        let doctor = await Doctor.findOne({ name: doctorData.name });
        if (!doctor) {
            console.log("Creating new doctor:", doctorData);
            doctor = new Doctor({
                name: doctorData.name,
                specialty: doctorData.specialty,
                experience: doctorData.experience || "",
                education: doctorData.education || "",
                image: doctorData.image || "",
            });
            await doctor.save();
            console.log("New doctor created:", doctor);
        } else {
            console.log("Found existing doctor:", doctor);
        }

       
        const existingConfirmations = await Confirmation.find({ doctor: doctor._id }).populate("date");
        const slotTaken = existingConfirmations.some((conf) => conf.date.date === dateData.date && conf.date.time === dateData.time);

        if (slotTaken) {
            return res.status(400).json({
                error: "This time slot is already booked for this doctor.",
            });
        }

        const patient = new Patient(patientData);
        await patient.save();
        console.log("Patient saved:", patient);

        let date = await DateModel.findOne({ date: dateData.date, time: dateData.time });
        if (!date) {
            date = new DateModel(dateData);
            await date.save();
        }
        console.log("Date saved:", date);

        const confirmation = new Confirmation({
            patient: patient._id,
            doctor: doctor._id,
            doctorName: doctor.name,
            date: date._id,
            status: "pending",
        });

        await confirmation.save();
        console.log("Confirmation saved:", confirmation);

        const populatedConfirmation = await Confirmation.findById(confirmation._id).populate("doctor").populate("patient").populate("date").lean();

        res.status(201).json(populatedConfirmation);
    } catch (error) {
        console.error("Error creating confirmation:", error);
        res.status(400).json({ error: error.message });
    }
});


router.get("/", async (req, res) => {
    try {
        console.log("Fetching confirmations...");

        const confirmations = await Confirmation.find()
            .populate({
                path: "doctor",
                select: "name specialty experience education image",
            })
            .populate({
                path: "patient",
                select: "name age gender blood contact",
            })
            .populate({
                path: "date",
                select: "date time",
            })
            .lean();

        console.log("Number of confirmations found:", confirmations.length);

      
        if (confirmations.length > 0) {
            console.log("First confirmation raw data:", JSON.stringify(confirmations[0], null, 2));
        }

        const formattedConfirmations = confirmations.map((confirmation) => {
           
            console.log("Processing confirmation:", {
                id: confirmation._id,
                doctor: confirmation.doctor,
                doctorName: confirmation.doctorName,
                patient: confirmation.patient,
                date: confirmation.date,
            });

            const doctorName = confirmation.doctor?.name || confirmation.doctorName;

            const formattedConfirmation = {
                _id: confirmation._id,
                doctorData: {
                    name: doctorName,
                    specialty: confirmation.doctor?.specialty || "",
                    experience: confirmation.doctor?.experience || "",
                    education: confirmation.doctor?.education || "",
                    image: confirmation.doctor?.image || "",
                },
                patientData: confirmation.patient
                    ? {
                          name: confirmation.patient.name || "",
                          age: confirmation.patient.age || "",
                          gender: confirmation.patient.gender || "",
                          blood: confirmation.patient.blood || "",
                          contact: confirmation.patient.contact || "",
                      }
                    : null,
                dateData: confirmation.date
                    ? {
                          date: confirmation.date.date || "",
                          time: confirmation.date.time || "",
                      }
                    : null,
                status: confirmation.status || "pending",
            };

            console.log("Formatted confirmation:", formattedConfirmation);

            return formattedConfirmation;
        });

        console.log("\nSending response with", formattedConfirmations.length, "confirmations");
        res.json(formattedConfirmations);
    } catch (error) {
        console.error("Error fetching confirmations:", error);
        res.status(500).json({ error: error.message });
    }
});
router.get("/booked-slots", async (req, res) => {
    const { doctorName, date } = req.query;

    try {
        const doctor = await Doctor.findOne({ name: doctorName });
        if (!doctor) return res.status(404).json({ error: "Doctor not found" });

        const confirmations = await Confirmation.find({ doctor: doctor._id }).populate("date");

        const bookedTimes = confirmations.filter((c) => c.date.date === date).map((c) => c.date.time);

        res.json({ bookedTimes });
    } catch (error) {
        res.status(500).json({ error: "Server error" });
    }
});

router.put('/:id', async (req, res) => {
  try {
    const { date, time, status, action } = req.body;
    const confirmation = await Confirmation.findById(req.params.id).populate('date').populate('doctor');
    if (!confirmation) {
      return res.status(404).json({ error: 'Confirmation not found' });
    }
    if (!confirmation.doctor || !confirmation.doctor._id) {
      return res.status(400).json({ error: 'Doctor information is missing or invalid.' });
    }
    if (!confirmation.date || !confirmation.date._id) {
      return res.status(400).json({ error: 'Date information is missing or invalid.' });
    }

    if (action === 'reschedule' && (!date || !time)) {
      return res.status(400).json({ error: 'Date and time are required for rescheduling.' });
    }

    if (action === 'reschedule' && date && time) {
     
      const existingConfirmations = await Confirmation.find({ 
        doctor: confirmation.doctor._id,
        _id: { $ne: confirmation._id }
      }).populate('date');
      
      const slotTaken = existingConfirmations.some(conf =>
        conf.date && conf.date.date === date && conf.date.time === time
      );

      if (slotTaken) {
        return res.status(400).json({
          error: 'This time slot is already booked for this doctor.'
        });
      }

      
      let dateDoc = await DateModel.findOne({ date, time });
      if (!dateDoc) {
        dateDoc = new DateModel({ date, time });
        await dateDoc.save();
      }
      
      confirmation.date = dateDoc._id;
      await confirmation.save();
      return res.json({ message: 'Appointment rescheduled', confirmation });
    }
    
    if (action === 'cancel') {
      confirmation.status = 'canceled';
      await confirmation.save();
      return res.json({ message: 'Appointment canceled', confirmation });
    }
    
    res.status(400).json({ error: 'Invalid action or missing data' });
  } catch (error) {
    console.error('Error in PUT /api/confirmations/:id:', error, req.body);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;