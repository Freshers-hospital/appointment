const express = require("express");
const router = express.Router();
const Confirmation = require("../models/confirmation");
const Patient = require("../models/patient");
const Doctor = require("../models/doctor");
const DateModel = require("../models/date");

router.post("/", async (req, res) => {
    try {
        const { patientData, doctorData, dateData } = req.body;
        console.log("Received data:", { patientData, doctorData, dateData });

        let doctor = await Doctor.findOne({ name: doctorData.name });
        if (!doctor) {
            return res.status(400).json({ error: "Selected doctor does not exist. Please select an existing doctor." });
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
            status: "confirmed",
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
        const { status } = req.query;
        let filter = {};
        if (status && status !== "all") {
            if (status === "cancelled") {
                filter.status = { $in: ["cancelled", "canceled"] };
            } else {
                filter.status = status;
            }
        }

        const confirmations = await Confirmation.find(filter)
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
                    qualification: confirmation.doctor?.qualification || "",
                    experience: confirmation.doctor?.experience || "",
                    availability: confirmation.doctor?.availability || "",
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



router.put("/:id", async (req, res) => {
  try {
    const { action, date, time, patientData, doctorName } = req.body;

    const confirmation = await Confirmation.findById(req.params.id).populate("date").populate("doctor");

    if (!confirmation) {
      return res.status(404).json({ error: "Confirmation not found" });
    }


    if (action === "reschedule") {
      if (!date || !time) {
        return res.status(400).json({ error: "Date and time are required for rescheduling." });
      }

      const existingConfirmations = await Confirmation.find({
        doctor: confirmation.doctor._id,
        _id: { $ne: confirmation._id },
      }).populate("date");

      const slotTaken = existingConfirmations.some((conf) => conf.date?.date === date && conf.date?.time === time);

      if (slotTaken) {
        return res.status(400).json({ error: "This time slot is already booked for this doctor." });
      }

      let dateDoc = await DateModel.findOne({ date, time });
      if (!dateDoc) {
        dateDoc = new DateModel({ date, time });
        await dateDoc.save();
      }

      confirmation.date = dateDoc._id;
      confirmation.status = "rescheduled";
      await confirmation.save();

      return res.json({ message: "Appointment rescheduled", confirmation });
    }

    if (action === "cancel") {
      confirmation.status = "canceled";
      await confirmation.save();
      return res.json({ message: "Appointment canceled", confirmation });
    }

  
    if (action === "edit") {
      if (patientData) {
        const patient = await Patient.findById(confirmation.patient);
        if (patient) {
          Object.assign(patient, patientData);
          await patient.save();
        }
      }

      if (doctorName) {
        const doctor = await Doctor.findOne({ name: doctorName });
        if (!doctor) {
          return res.status(400).json({ error: "Doctor not found" });
        }
        confirmation.doctor = doctor._id;
        confirmation.doctorName = doctor.name;
      }

      if (date && time) {
        let dateDoc = await DateModel.findOne({ date, time });
        if (!dateDoc) {
          dateDoc = new DateModel({ date, time });
          await dateDoc.save();
        }
        confirmation.date = dateDoc._id;
      }

      await confirmation.save();
      return res.json({ message: "Appointment updated", confirmation });
    }

   
    res.status(400).json({ error: "Invalid action or missing data" });
  } catch (error) {
    console.error("ERROR in PUT /api/confirmations/:id:", error.message);
    res.status(500).json({ error: error.message });
  }
});


module.exports = router;
