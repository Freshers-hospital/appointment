const mongoose = require('mongoose');

const leaveSchema = new mongoose.Schema({
  doctorName: {
    type: String,
    required: true,
  },
  leaveDate: {
    type: Date,
    required: true,
  },
  reason: {
    type: String,
    default: "Not specified"
  }
}, { timestamps: true });

module.exports = mongoose.model('Leave', leaveSchema);
