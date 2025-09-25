const express = require("express");
const router = express.Router();
const Report = require("../models/reportModel");

//  Create report
router.post("/", async (req, res) => {
  try {
    const report = new Report(req.body);
    await report.save();
    res.status(201).json(report);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

//  Get all reports
router.get("/", async (req, res) => {
  try {
    const reports = await Report.find().populate("patientTest");
    res.json(reports);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

//  Get report by ID
router.get("/:id", async (req, res) => {
  try {
    const report = await Report.findById(req.params.id).populate("patientTest");
    if (!report) return res.status(404).json({ error: "Not found" });
    res.json(report);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

//  Delete report
router.delete("/:id", async (req, res) => {
  try {
    await Report.findByIdAndDelete(req.params.id);
    res.json({ message: "Report deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
