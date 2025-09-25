const mongoose = require("mongoose");

const labTestSchema = new mongoose.Schema({
  testName: { type: String, required: true },
  description: { type: String },
  cost: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("LabTest", labTestSchema);
