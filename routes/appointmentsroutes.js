const express = require('express');
const router  = express.Router();
const { getTodayCounts } = require('../controllers/appointments');

router.get('/today-count', getTodayCounts);



// Add this POST route below
router.post('/appointments', async (req, res) => {
  try {
    const { doctorId, patientId, date } = req.body;

    const appointment = new Confirmation({
      doctorId,
      patientId,
      date: new Date(date),
    });

    await appointment.save();

    res.status(201).json({ message: 'Appointment booked successfully' });
  } catch (error) {
    console.error('Error booking appointment:', error);
    res.status(500).json({ error: 'Server error while booking appointment' });
  }
});




module.exports = router;
