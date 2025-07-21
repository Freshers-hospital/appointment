const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const app = express();
const dotenv = require("dotenv");
dotenv.config();
const mongoURI = process.env.DATABASE_URL;
console.log( mongoURI);
console.log(typeof(mongoURI));
const port = process.env.PORT;

const confirmationRoutes = require("./routes/confirmationsroutes");

const doctorsRoutes = require("./routes/doctorsroutes");
const { router: adminRoutes } = require('./routes/adminroutes');

const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


app.use("/api/confirmations", confirmationRoutes);

app.use("/api/doctors", doctorsRoutes);
app.use("/api/admin", adminRoutes);

app.post('/test-upload', upload.single('photo'), (req, res) => {
  console.log('Test upload file:', req.file);
  if (req.file) {
    res.send('File uploaded: ' + req.file.path);
  } else {
    res.status(400).send('No file uploaded');
  }
});


app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "login.html"));
});


app.get("/superadmin", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "superadmin.html"));
});


mongoose.connect(mongoURI).then(() => {
    app.listen(port, () => {
        console.log(`Server running at http://localhost:${port}`);
    });
}).catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
}); 
