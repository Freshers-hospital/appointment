const mongoose = require('mongoose');

const dateSchema = new mongoose.Schema({
  date: { type: String, required: true },
  time: { type: String, required: true }
});

module.exports = mongoose.model('Date', dateSchema);