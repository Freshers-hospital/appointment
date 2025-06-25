
const moment       = require('moment-timezone');
const Appointment  = require('../models/appointment');
const Doctor       = require('../models/doctor');

exports.getTodayCounts = async (req, res) => {
  try {
    
    const tz = 'Asia/Kolkata';
    const start = moment.tz(tz).startOf('day').toDate(); 
    const end   = moment.tz(tz).endOf('day').toDate();   

    const pipeline = [
      { $match: { dateTime: { $gte: start, $lte: end } } },
      { $group:  { _id: '$doctorId', todayAppointments: { $sum: 1 } } },
   
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
    res.status(200).json(counts);             
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
