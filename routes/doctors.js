const express = require('express');
const router = express.Router();
const Doctor = require('../models/doctor');
const Confirmation = require('../models/confirmation');

// GET /api/doctors/with-count
router.get('/with-count', async (req, res) => {
  try {
    const today = new Date();
    const todayStr = `${today.getMonth() + 1}/${today.getDate()}/${today.getFullYear()}`;

    const counts = await Confirmation.aggregate([
      {
        $lookup: {
          from: 'dates',
          localField: 'date',
          foreignField: '_id',
          as: 'dateDoc'
        }
      },
      { $unwind: '$dateDoc' },
      { $match: { 'dateDoc.date': todayStr, status: { $ne: 'canceled' } } },
      {
        $group: {
          _id: '$doctor',
          count: { $sum: 1 }
        }
      }
    ]);

    const countMap = new Map(counts.map(c => [String(c._id), c.count]));

    const doctors = await Doctor.find().lean();
    const result = doctors.map(doc => ({
      _id: doc._id,
      name: doc.name,
      specialty: doc.specialty,
      availability: doc.availability || '',
      appointmentsToday: countMap.get(String(doc._id)) || 0
    }));

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch doctors' });
  }
});

module.exports = router;
