
// const mongoose = require('mongoose');

// const appointmentSchema = new mongoose.Schema({
//   doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor' },
//   date: String, // Format: "YYYY-MM-DD"
//   patientName: String,
// });


// module.exports = mongoose.model('Appointment', appointmentSchema);



const mongoose = require('mongoose');

const AppointmentSchema = new mongoose.Schema({
  doctorId:  { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
  dateTime:  { type: Date, required: true },          // slot start‑time
  status:    { type: String, enum: ['BOOKED', 'DONE', 'CANCELLED'], default: 'BOOKED' },
});

AppointmentSchema.index({ doctorId: 1, dateTime: 1 }); // makes the aggregate super‑fast
module.exports = mongoose.model('Appointment', AppointmentSchema);
