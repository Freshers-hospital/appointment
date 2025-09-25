const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema({
  patientTest: { type: mongoose.Schema.Types.ObjectId, ref: "PatientTest", required: true },
  reportFile: { type: String }, // PDF path or Cloud URL
  generatedDate: { type: Date, default: Date.now },
  remarks: { type: String },
});

module.exports = mongoose.model("Report", reportSchema);
