const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const app = express();
const dotenv = require("dotenv");
dotenv.config();
const mongoURI = process.env.DATABASE_URL;
const port = process.env.PORT;

const confirmationRoutes = require("./routes/confirmations");

const loginRoutes = require("./routes/logins");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

// MongoDB connection

mongoose.connect(mongoURI);
mongoose.connection.once("open", () => console.log("MongoDB connected"));
mongoose.connection.on("error", (err) => console.error("MongoDB connection error:", err));

// API Routes
app.use("/api/confirmations", confirmationRoutes);

app.use("/api/logins", loginRoutes);

// Serve main HTML
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "login.html"));
});

// Start server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
