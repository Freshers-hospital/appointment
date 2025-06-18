const express = require('express');
const router  = express.Router();
const { getTodayCounts } = require('../controllers/appointments');

router.get('/today-count', getTodayCounts);

module.exports = router;
