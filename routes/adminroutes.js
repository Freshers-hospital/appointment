const express = require('express');
const jwt = require('jsonwebtoken');
const Admin = require('../models/admin');
const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

router.post('/registerAsSuperadmin', async (req, res) => {
  try {
    const { username, email, password, contact } = req.body;
    if (!username || !email || !password || !contact) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    const exists = await Admin.findOne({ email });
    if (exists) return res.status(400).json({ error: 'Email already registered' });
    const admin = new Admin({ username, email, password, role: 2, contact });
    await admin.save();
    res.status(201).json({ message: 'SuperAdmin registered successfully' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, contact } = req.body;
    if (!username || !email || !password || !contact) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    const exists = await Admin.findOne({ email });
    if (exists) return res.status(400).json({ error: 'Email already registered' });
    const admin = new Admin({ username, email, password, role: 1, contact });
    await admin.save();
    res.status(201).json({ message: 'Admin registered successfully' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});


router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    let admin;
    if (email.includes('@')) {
      admin = await Admin.findOne({ email });
    } else {
      admin = await Admin.findOne({ username: email });
    }
    if (!admin) return res.status(401).json({ error: 'Invalid credentials' });
    const isMatch = await admin.comparePassword(password);
    if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });
    const token = jwt.sign({ id: admin._id, username: admin.username, role: admin.role }, JWT_SECRET, { expiresIn: '1d' });
    res.json({ token, role: admin.role });
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
router.get('/getAllAdmins', async (req, res) => {
  try {
    const admins = await Admin.find({ role: 1, status: 'active' });
    res.json(admins);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
router.get('/getAdminById/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const admin = await Admin.findOne({ _id: id });
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }
    res.json(admin);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
router.put('/updateAdmin/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const admin = await Admin.findOneAndUpdate({ _id: id }, updateData, { new: true });
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }
    res.json(admin);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
module.exports = { router, authMiddleware }; 