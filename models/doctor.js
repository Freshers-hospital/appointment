const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  specialty: String,
}, { timestamps: true });

module.exports = mongoose.model('Doctor', doctorSchema);