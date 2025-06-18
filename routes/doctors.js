const express = require('express');
const router  = express.Router();
const Doctor  = require('../models/doctor');
const Confirmation = require('../models/confirmation');
const DateModel     = require('../models/date');

router.get('/', async (req, res) => {
  try {
    /** STEP 1: today’s date in *MM/D/YYYY* */
    const todayDate = new Date().toLocaleDateString('en-US', {
      month: 'numeric',
      day:   'numeric',
      year:  'numeric'
    });                                  // → "6/30/2025"

    /** STEP 2: find the DateModel doc that matches */
    const todayDateDoc = await DateModel.findOne({ date: todayDate });

    /** If no Date document, everyone has 0 today */
    if (!todayDateDoc) {
      const doctors = await Doctor.find({});
      return res.json(
        doctors.map(d => ({
          _id: d._id,
          name: d.name,
          specialty: d.specialty,
          todaysAppointments: 0
        }))
      );
    }

    /** STEP 3: aggregate confirmations per doctor for today */
    const docsWithCounts = await Doctor.aggregate([
      {
        $lookup: {
          from: 'confirmations',           // actual collection name
          let: { doctorId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ['$doctor', '$$doctorId'] },
                date:  todayDateDoc._id    // compare ObjectIds
              }
            }
          ],
          as: 'todaysConfirmations'
        }
      },
      {
        $addFields: {
          todaysAppointments: { $size: '$todaysConfirmations' }
        }
      },
      {
        $project: {
          name: 1,
          specialty: 1,
          todaysAppointments: 1
        }
      }
    ]);

    res.json(docsWithCounts);
  } catch (err) {
    console.error('Error fetching doctors:', err);
    res.status(500).json({ error: 'Server error fetching doctors' });
  }
});

module.exports = router;
