const express = require("express");
const jwt = require("jsonwebtoken");
const SuperAdmin = require("../models/superadmin");
const router = express.Router();
const bcrypt = require("bcrypt");

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret";

router.post('/registerAsSuperadmin', async (req, res) => {
    try {
        const { username, email, password, contact } = req.body;
        if (!username || !email || !password || !contact) {
            return res.status(400).json({ error: 'All fields are required' });
        }
        const exists = await SuperAdmin.findOne({ email });
        if (exists) return res.status(400).json({ error: 'Email already registered' });
        const superadmin = new SuperAdmin({ username, email, password, role: 0, contact });
        await superadmin.save();
        res.status(201).json({ message: 'SuperAdmin registered successfully' });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        let superAdmin;
        if (email.includes('@')) {
             superAdmin = await SuperAdmin.findOne({ email });
           } else {
             superAdmin = await SuperAdmin.findOne({ username: email });
           }
        if (!superAdmin) return res.status(401).json({ error: 'Invalid credentials' });
        if (superAdmin.isDeleted) return res.status(401).json({ error: 'Account has been deleted' });
        const isMatch = await superAdmin.comparePassword(password);
        if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });
        await SuperAdmin.findByIdAndUpdate(superAdmin._id, { status: 'active' });
        const token = jwt.sign({ id: superAdmin._id, username: superAdmin.username, role: superAdmin.role }, JWT_SECRET, { expiresIn: '1d' });
        res.json({ token, role: superAdmin.role, name: superAdmin.username });
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

router.post('/logout', async (req, res) => {
    try {
        const { token } = req.body;
        if (!token) return res.status(400).json({ error: 'Token not provided' });
        const decryptToken = jwt.verify(token, JWT_SECRET);
        const { id, username, role } = decryptToken;
        await SuperAdmin.findByIdAndUpdate(id, { status: 'inactive' });
        res.json({ message: `${username} logged out successfully` });
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});
function authMiddleware(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: 'No token provided' });
    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.admin = decoded;
        next();
    } catch {
        res.status(401).json({ error: 'Invalid token' });
    }
}
module.exports = { router, authMiddleware };
