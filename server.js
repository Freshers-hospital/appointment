const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const app = express();
const port = 3022;

// Routes
const confirmationRoutes = require('./routes/confirmations');
const doctorRoutes = require("./routes/doctors");

// const patientRoutes = require('./routes/patients');
// const confirmationRoutes = require('./routes/confirmations');
// const dateRoutes = require('./routes/dates');
// const doctorRoutes = require('./routes/doctors');
// const leaveRoutes = require('./routes/leaves');

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public'))); 

// MongoDB connection
const mongoURI = 'mongodb+srv://vinodkumar07:vinod07@cluster0.fxhf4wc.mongodb.net/hp';
mongoose.connect(mongoURI);
mongoose.connection.once('open', () => console.log('MongoDB connected'));
mongoose.connection.on('error', (err) => console.error('MongoDB connection error:', err));

// API Routes for purpose
app.use('/api/confirmations', confirmationRoutes);
app.use("/api/doctors", doctorRoutes);

// app.use('/api/patients', patientRoutes);
// app.use('/api/confirmations', confirmationRoutes);
// app.use('/api/dates', dateRoutes);
// app.use('/api/doctors', doctorRoutes);
// app.use('/api/leaves', leaveRoutes);

// Serve main HTML
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// Start server for backend  
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});