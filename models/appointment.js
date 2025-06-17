
const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor' },
  date: String, // Format: "YYYY-MM-DD"
  patientName: String,
});


module.exports = mongoose.model('Appointment', appointmentSchema);


