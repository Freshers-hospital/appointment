const express = require('express');
const router = express.Router();
const Confirmation = require('../models/confirmationModel');
const Doctor = require('../models/doctorModel');

// GET /api/doctors/with-count
router.get('/with-count', async (req, res) => {
  try {
    const today = new Date();
    const todayStr = `${today.getMonth() + 1}/${today.getDate()}/${today.getFullYear()}`;

    // Aggregate confirmations matching today's date and not canceled,
    // group by doctor and sum counts correctly
    const counts = await Confirmation.aggregate([
      {
        $lookup: {
          from: 'dates',           // joining with dates collection
          localField: 'date',      // Confirmation.date is ObjectId
          foreignField: '_id',     // Dates._id
          as: 'dateDoc'
        }
      },
      { $unwind: '$dateDoc' },
      { $match: { 'dateDoc.date': todayStr, status: { $ne: 'canceled' } } },
      {
        $group: {
          _id: '$doctor',
          count: { $sum: 1 }        // sum 1 per matching appointment (corrected from $sum:3)
        }
      }
    ]);

    // Convert counts array to Map for quick lookup
    const countMap = new Map(counts.map(c => [String(c._id), c.count]));

    // Fetch all doctors and merge appointment counts
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
    console.error('Error fetching doctors with counts:', err);
    res.status(500).json({ error: 'Failed to fetch doctors with appointment counts' });
  }
});

module.exports = router;