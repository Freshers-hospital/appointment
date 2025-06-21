// npm i moment-timezone   ← if you don't have it yet
const moment       = require('moment-timezone');
const Appointment  = require('../models/appointment');
const Doctor       = require('../models/doctorModel');

exports.getTodayCounts = async (req, res) => {
  try {
    // Asia/Kolkata = UTC+5:30
    const tz = 'Asia/Kolkata';
    const start = moment.tz(tz).startOf('day').toDate(); // 00:00 IST
    const end   = moment.tz(tz).endOf('day').toDate();   // 23:59:59 IST

    const pipeline = [
      { $match: { dateTime: { $gte: start, $lte: end } } },
      { $group:  { _id: '$doctorId', todayAppointments: { $sum: 1 } } },
      // pull doctor name / specialty
      { $lookup: { from: 'doctors', localField: '_id', foreignField: '_id', as: 'doctor' } },
      { $unwind: '$doctor' },
      { $project: {
          doctorId: '$_id',
          name:     '$doctor.name',
          specialty:'$doctor.specialty',
          todayAppointments: 1,
          _id: 0
        }}
    ];

    const counts = await Appointment.aggregate(pipeline);
    res.status(200).json(counts);             // [{doctorId,name,specialty,todayAppointments}, …]
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
