const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  specialty: { type: String, required: true },
  experience: { type: String },
  education: { type: String },
  image: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Doctor', doctorSchema);
