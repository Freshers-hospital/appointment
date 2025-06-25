
const mongoose = require('mongoose');

const restrictionSchema = new mongoose.Schema({
  lunchStart: { type: String, default: '13:00' },
  lunchEnd:   { type: String, default: '14:00' },
});

const doctorSchema = new mongoose.Schema({
  name:         { type: String, required: true },
  specialty:    { type: String, required: true },
  
  timeSlots:    [String],            
 
  unavailable:  [String],
  restrictions: restrictionSchema,
});

module.exports = mongoose.model('Doctor', doctorSchema);

