const mongoose = require("mongoose");

const labAppointmentSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: "Patient", required: true },
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor", required: true },
  prescribedTests: [{ type: mongoose.Schema.Types.ObjectId, ref: "LabTest" }],
  appointmentDate: { type: Date, required: true },
  time: { type: String, required: true },
  status: { 
    type: String, 
    enum: ["Scheduled", "Completed", "Cancelled", "Rescheduled"], 
    default: "Scheduled" 
  },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("LabAppointment", labAppointmentSchema);
