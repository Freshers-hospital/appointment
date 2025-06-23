// const mongoose = require('mongoose');

// const doctorSchema = new mongoose.Schema({
//   name: { type: String, required: true },
//   specialty: { type: String, required: true },
//   experience: { type: String },
//     timeSlots:  { type: [String], required: true },
//   education: { type: String },
//   image: { type: String }
// }, { timestamps: true });

// module.exports = mongoose.model('Doctor', doctorSchema);






// models/doctorModel.js
const mongoose = require('mongoose');

const restrictionSchema = new mongoose.Schema({
  lunchStart: { type: String, default: '13:00' }, // 24-h “HH:mm”
  lunchEnd:   { type: String, default: '14:00' },
});

const doctorSchema = new mongoose.Schema({
  name:         { type: String, required: true },
  specialty:    { type: String, required: true },
  // optional hard overrides; leave empty to use default generator (9 → 17 each 30 min)
  timeSlots:    [String],              // ["09:00","09:30", …]
  // one-off dates a doc is not working (ISO yyyy-mm-dd, no time zone headaches)
  unavailable:  [String],
  restrictions: restrictionSchema,
});

module.exports = mongoose.model('Doctor', doctorSchema);

