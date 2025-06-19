const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const Login = require('../models/loginModel');


router.post('/register', async (req, res) => {
  const { username, password } = req.body;

  try {
    const existing = await Login.findOne({ username });
    if (existing) {
      return res.status(409).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newLogin = new Login({ username, password: hashedPassword });
    await newLogin.save();

    res.status(201).json({ message: 'Admin registered successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});


router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const login = await Login.findOne({ username });
    if (!login) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, login.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    res.json({ message: 'Login successful' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
