const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const app = express();
const dotenv = require("dotenv");
dotenv.config();
const mongoURI = process.env.DATABASE_URL;
console.log(mongoURI);
console.log(typeof mongoURI);
const port = process.env.PORT;

const confirmationRoutes = require("./routes/confirmationsroutes");

const loginRoutes = require("./routes/loginsroute");

const doctorsRouter = require('./routes/doctors'); 

const leaveRoutes = require("./routes/leavesRoute");

const dynamicdoctor = require('./routes/dynamicdoctorRoutes');




app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

// MongoDB connection

// API Routes
app.use("/api/confirmations", confirmationRoutes);

app.use("/api/logins", loginRoutes);

app.use('/api/doctors', doctorsRouter);  



app.use("/api/leaves", leaveRoutes);
app.use('/api/dynamic-doctors', dynamicdoctor);



// Serve main HTML
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "login.html"));
});

// Start server

mongoose
    .connect(mongoURI)
    .then(() => {
        app.listen(port, () => {
            console.log(`Server running at http://localhost:${port}`);
        });
    })
    .catch((err) => {
        console.error("MongoDB connection error:", err);
        process.exit(1);
    });