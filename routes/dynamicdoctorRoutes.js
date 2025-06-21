// const express = require("express");
// const router = express.Router();
// const Doctor = require("../models/doctorModel");

// const initialDoctors =  [/* your same array here */];
     

// // // GET  /api/dynamic-doctors  → fixed list
// // router.get("/", (req, res) => res.json(initialDoctors));


// router.post("/seed", async (req, res) => {
//   try {
//     const count = await Doctor.countDocuments();
//     if (count === 0) {
//       await Doctor.insertMany(initialDoctors);
//       return res.status(201).json({ message: "Doctors seeded successfully" });
//     } else {
//       return res.status(200).json({ message: "Doctors already exist" });
//     }
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Failed to seed doctors" });
//   }
// });

// module.exports = router;




const express = require("express");
const router  = express.Router();
const Doctor  = require("../models/doctorModel");

// GET /api/dynamic-doctors → fetch docs from DB
router.get("/", async (_req, res) => {
  try {
    const doctors = await Doctor.find().sort({ name: 1 });  // alphabetical
    res.json(doctors);                       // [{ _id, name, specialty, … }, …]
  } catch (err) {
    console.error("Fetch doctors error:", err);
    res.status(500).json({ error: "Failed to fetch doctors" });
  }
});


router.post("/", async (req, res) => {
  const { name, specialty, experience } = req.body;

  // basic validation
  if (!name || !specialty || !experience) {
    return res.status(400).json({ error: "Name, specialty & experience are required" });
  }

  try {
    const doctor = new Doctor({ name, specialty, experience });
    await doctor.save();
    res.status(201).json(doctor); // full saved doc with _id
  } catch (err) {
    console.error("Create doctor error:", err);
    res.status(500).json({ error: "Failed to create doctor" });
  }
});



module.exports = router;
