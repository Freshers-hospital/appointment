const mongoose = require('mongoose');

const confirmationSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
  date: { type: mongoose.Schema.Types.ObjectId, ref: 'Date', required: true }
}, { timestamps: true });

module.exports = mongoose.model('Confirmation', confirmationSchema);