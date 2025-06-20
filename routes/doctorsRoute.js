const express = require('express');
const router = express.Router();
const Confirmation = require('../models/confirmationModel');
const Doctor = require('../models/doctorModel');

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
    console.error('Error fetching doctors with counts:', err);
    res.status(500).json({ error: 'Failed to fetch doctors with appointment counts' });
  }
});

module.exports = router;
