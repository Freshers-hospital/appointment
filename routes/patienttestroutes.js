const express = require("express");
const router = express.Router();
const PatientTest = require("../models/patientTestModel");

//  Create patient test
router.post("/", async (req, res) => {
  try {
    const test = new PatientTest(req.body);
    await test.save();
    res.status(201).json(test);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

//  Get all patient tests
router.get("/", async (req, res) => {
  try {
    const tests = await PatientTest.find()
      .populate("patient")
      .populate("prescribedTests");
    res.json(tests);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

//  Get single test
router.get("/:id", async (req, res) => {
  try {
    const test = await PatientTest.findById(req.params.id)
      .populate("patient")
      .populate("prescribedTests");
    if (!test) return res.status(404).json({ error: "Not found" });
    res.json(test);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

//  Update test status
router.put("/:id", async (req, res) => {
  try {
    const test = await PatientTest.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(test);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

//  Delete
router.delete("/:id", async (req, res) => {
  try {
    await PatientTest.findByIdAndDelete(req.params.id);
    res.json({ message: "Patient test deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
