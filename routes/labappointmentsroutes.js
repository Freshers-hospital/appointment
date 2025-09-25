const express = require("express");
const router = express.Router();
const LabAppointment = require("../models/labAppointmentModel");

//  Create new appointment
router.post("/", async (req, res) => {
  try {
    const appointment = new LabAppointment(req.body);
    await appointment.save();
    res.status(201).json(appointment);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get all appointments
router.get("/", async (req, res) => {
  try {
    const appointments = await LabAppointment.find()
      .populate("patient")
      .populate("doctor")
      .populate("prescribedTests");
    res.json(appointments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

//  Get appointment by ID
router.get("/:id", async (req, res) => {
  try {
    const appointment = await LabAppointment.findById(req.params.id)
      .populate("patient")
      .populate("doctor")
      .populate("prescribedTests");
    if (!appointment) return res.status(404).json({ error: "Not found" });
    res.json(appointment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update (edit/reschedule)
router.put("/:id", async (req, res) => {
  try {
    const appointment = await LabAppointment.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(appointment);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

//  Delete
router.delete("/:id", async (req, res) => {
  try {
    await LabAppointment.findByIdAndDelete(req.params.id);
    res.json({ message: "Appointment deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
