const express = require("express");
const router = express.Router();
const Employee = require("../models/Employee");

// ✅ Add new employee
router.post("/", async (req, res) => {
  try {
    // Create a new employee instance
    const employee = new Employee(req.body);

    // Save to database
    await employee.save();

    // Respond with saved employee
    res.status(201).json(employee);
  } catch (err) {
    console.error("Error adding employee:", err.message);

    // Handle duplicate key errors
    if (err.code === 11000) {
      const field = Object.keys(err.keyPattern)[0];
      return res.status(400).json({ error: `${field} already exists.` });
    }

    // Validation errors
    if (err.name === "ValidationError") {
      const messages = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ error: messages.join(", ") });
    }

    res.status(500).json({ error: err.message });
  }
});

// ✅ Get all employees
router.get("/", async (req, res) => {
  try {
    const employees = await Employee.find().sort({ createdAt: -1 });
    res.json(employees);
  } catch (err) {
    console.error("Error fetching employees:", err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
