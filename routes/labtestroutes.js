const express = require("express");
const LabTest = require("../models/LabTest");
const router = express.Router();

// Create a new lab test
router.post("/", async (req, res) => {
  try {
    const { testName, description, cost } = req.body;

    if (!testName || !cost) {
      return res.status(400).json({ error: "testName and cost are required" });
    }

    const newTest = new LabTest({ testName, description, cost });
    await newTest.save();
    res.status(201).json(newTest);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all lab tests
router.get("/", async (req, res) => {
  try {
    const tests = await LabTest.find();
    res.json(tests);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get single lab test by ID
router.get("/:id", async (req, res) => {
  try {
    const test = await LabTest.findById(req.params.id);
    if (!test) return res.status(404).json({ error: "Lab Test not found" });
    res.json(test);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update lab test
router.put("/:id", async (req, res) => {
  try {
    const updatedTest = await LabTest.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updatedTest) return res.status(404).json({ error: "Lab Test not found" });
    res.json(updatedTest);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete lab test
router.delete("/:id", async (req, res) => {
  try {
    const deletedTest = await LabTest.findByIdAndDelete(req.params.id);
    if (!deletedTest) return res.status(404).json({ error: "Lab Test not found" });
    res.json({ message: "Lab Test deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
