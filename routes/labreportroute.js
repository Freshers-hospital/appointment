const express = require("express");
const router = express.Router();
const LabReport = require("../models/labreport");

router.post("/labreports", async (req, res) => {
  try {
    const report = new LabReport(req.body);
    await report.save();
    res.status(201).json(report);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


router.get("/labreports", async (req, res) => {
  try {
    const reports = await LabReport.find()
      .populate("patientId") 
      .sort({ reportDate: -1 });

    res.json(reports);
  } catch (err) {
    console.error(" Error fetching lab reports:", err);
    res.status(500).json({ error: err.message });
  }
});


router.get("/patients/:id/lab-reports", async (req, res) => {
  try {
    const reports = await LabReport.find({ patientId: req.params.id }).sort({ reportDate: -1 });
    res.json(reports);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/labreports/:id", async (req, res) => {
  try {
    const report = await LabReport.findById(req.params.id).populate("patientId");
    res.json(report);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;