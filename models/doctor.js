
const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  specialty: { type: String, required: true },
  experience: { type: String },
  qualification: { type: String },
  availability: { type: String, required: true },
  availabilityByDate: {
    type: Map,
    of: new mongoose.Schema({ start: String, end: String }, { _id: false }),
    default: {}
  },
  education: { type: String },
  image: { type: String }
}, { timestamps: true });

doctorSchema.index({ firstName: 1, lastName: 1 }, { unique: true });

module.exports = mongoose.model('Doctor', doctorSchema);

