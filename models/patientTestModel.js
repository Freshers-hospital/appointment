const mongoose = require("mongoose");

const patientTestSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: "Patient", required: true },
  prescribedTests: [{ type: mongoose.Schema.Types.ObjectId, ref: "LabTest" }],
  status: {
    type: String,
    enum: ["Pending", "Sample Collected", "Completed"],
    default: "Pending"
  },
  reportGenerated: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("PatientTest", patientTestSchema);
