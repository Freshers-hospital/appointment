const mongoose = require("mongoose");

const employeeSchema = new mongoose.Schema({
  salutation: { type: String, required: true, trim: true },
  firstName: { type: String, required: true, trim: true },
  lastName: { type: String, required: true, trim: true },
  employeeName: { type: String, trim: true }, // <-- new field
  dob: { type: Date, required: true },
  gender: { type: String, enum: ["Male", "Female", "Other"], required: true },
  contact: { type: String, match: /^[0-9]{10}$/, unique: true, sparse: true, trim: true },
  email: { type: String, match: /.+\@.+\..+/, unique: true, sparse: true, lowercase: true, trim: true },
  department: { type: String, enum: ["Emergency", "Surgery", "Pediatrics", "Pharmacy"], required: true },
  role: { type: String, trim: true },
  employeeType: { type: String, enum: ["Full-time", "Part-time", "Contract"], default: "Full-time" },
  joiningDate: { type: Date },
  address: { type: String, trim: true },
  isIncentiveApplicable: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

// Pre-save hook to automatically generate employeeName
employeeSchema.pre("save", function(next) {
  this.employeeName = `${this.firstName} ${this.lastName}`;
  next();
});

module.exports = mongoose.model("Employee", employeeSchema);
