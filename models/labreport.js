const mongoose = require("mongoose");

const labReportSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: "Patient", required: true },
  testName: { type: String, required: true },
  result: { type: String, required: true },
  unit: String,
  normalRange: String,
  reportDate: { type: Date, default: Date.now },
 
});

module.exports = mongoose.model("LabReport", labReportSchema);
