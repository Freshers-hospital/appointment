const express = require("express");
const CORS = require("cors");
const mongoose = require("mongoose");
const path = require("path");
const app = express();
const dotenv = require("dotenv");
const nodemailer = require('nodemailer');
dotenv.config();
const mongoURI = process.env.DATABASE_URL;
const port = process.env.PORT;
const cron = require('node-cron');

const removeDeletedAdminsFromDb = require("./cron/deletedadmins");
const removeDeletedDoctors = require("./cron/deleteddoctor");

// Existing Routes
const confirmationRoutes = require("./routes/confirmationsroutes");
const doctorsRoutes = require("./routes/doctorsroutes");
const { router: adminRoutes } = require('./routes/adminroutes');
const { router: superadminRoutes } = require('./routes/superadminroutes');

// Lab Routes
const labAppointmentsRoutes = require("./routes/labappointmentsroutes");
const patientTestRoutes = require("./routes/patienttestroutes");
const reportRoutes = require("./routes/reportroutes");
const labTestRoutes = require("./routes/labtestroutes");

// ✅ Employee Routes
const employeeRoutes = require("./routes/employeeRoutes");


const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

app.use(CORS());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Route Middlewares
app.use("/api/confirmations", confirmationRoutes);
app.use("/api/doctors", doctorsRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/superadmin", superadminRoutes);
app.use("/api/employees", employeeRoutes);   // <-- ✅ new

// Lab API Routes
app.use("/api/labAppointments", labAppointmentsRoutes);
app.use("/api/patientTests", patientTestRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/labtests", labTestRoutes);

//  Test Upload
app.post('/test-upload', upload.single('photo'), (req, res) => {
  console.log('Test upload file:', req.file);      
  if (req.file) {
    res.send('File uploaded: ' + req.file.path);
  } else {
    res.status(400).send('No file uploaded');
  }
});

//  Default Routes
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "login.html"));
});

app.get("/superadmin", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "superadmin.html"));
});

//  MongoDB + Server Start
mongoose.connect(mongoURI).then(() => {
  app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
  });
}).catch((err) => {
  console.error("MongoDB connection error:", err);
  process.exit(1);
});

//  Cron Jobs
cron.schedule('0 * * * *', () => {
  console.log('cron');
  removeDeletedAdminsFromDb();  
});

cron.schedule('0 * * * *', () => {
  console.log('cron');
  removeDeletedDoctors();
});

//  Organizations API
const organizations = require("./organizations.json");
app.get("/api/organization/:id", (req, res) => {
  const org = organizations.find(o => o.id === req.params.id);
  if (org) {
    res.json(org);
  } else {
    res.status(404).json({ message: "Organization not found" });
  }
});
