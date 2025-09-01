const Doctor = require("../models/doctor");

const deleteDoctor = async (req, res) => {
  try {
    const doctorId = req.params.id;

    await Doctor.findByIdAndUpdate(doctorId, {
      isDeleted: true,
      updatedAt: new Date()
    });

    res.status(200).json({ message: "Doctor will be removed after 7 days" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find({ isDeleted: false });
    res.status(200).json(doctors);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { deleteDoctor, getDoctors };
