// routes/leaves.js
const express = require('express');
const router = express.Router();
const Leave = require('../models/leaveModel');

router.post('/add', async (req, res) => {
  const { doctorName, leaveDate, reason } = req.body;

  if (!doctorName || !leaveDate) {
    return res.status(400).json({ message: "Doctor name and leave date are required." });
  }

  try {
    const leave = new Leave({ doctorName, leaveDate, reason });
    await leave.save();
    res.status(201).json({ message: 'Leave added successfully', leave });
  } catch (err) {
    res.status(500).json({ message: 'Error saving leave', error: err.message });
  }
});


router.get('/:doctorName', async (req, res) => {
  try {
    const leaves = await Leave.find({ doctorName: req.params.doctorName });
    res.json(leaves);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching leaves', error: err.message });
  }
});


router.get('/', async (req, res) => {
  try {
    const allLeaves = await Leave.find();
    res.json(allLeaves);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching all leaves', error: err.message });
  }
});

module.exports = router;