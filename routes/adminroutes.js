const express = require('express');
const jwt = require('jsonwebtoken');
const Admin = require('../models/admin');
const router = express.Router();
const bcrypt = require('bcrypt');

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

router.post('/registerAsSuperadmin', async (req, res) => {
  try {
    const { username, email, password, contact } = req.body;
    if (!username || !email || !password || !contact) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    const exists = await Admin.findOne({ email });
    if (exists) return res.status(400).json({ error: 'Email already registered' });
    const admin = new Admin({ username, email, password, role: 0, contact });
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

router.post('/register', async (req, res) => {
  try {
    const { username, email, password, contact } = req.body;
    if (!username || !email || !password || !contact) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const exists = await Admin.findOne({ email });
    if (exists) return res.status(400).json({ error: 'Email already registered' });

    // 🔐 AES Encrypt the password for display
    const encryptedPassword = encrypt(password);

    // 🔒 Let bcrypt hash the password in schema pre-save
    const admin = new Admin({
      username,
      email,
      password,             // Will be hashed in schema
      encryptedPassword,    // Will be decrypted only for frontend display
      role: 1,
      contact
    });

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
    }
    if (!admin) return res.status(401).json({ error: 'Invalid credentials' });
    if (admin.isDeleted) return res.status(401).json({ error: 'Account has been deleted' });
    const isMatch = await admin.comparePassword(password);
    if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });
    await Admin.findByIdAndUpdate(admin._id, { status: 'active' });
    const token = jwt.sign({ id: admin._id, username: admin.username, role: admin.role }, JWT_SECRET, { expiresIn: '1d' });
    res.json({ token, role: admin.role, name: admin.username });
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
    await Admin.findByIdAndUpdate(id, { status: 'inactive' });
    res.json({ message: `${username} logged out successfully` });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});



router.post('/resetPassword', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const encryptedPassword = encrypt(password);

    const updated = await Admin.findOneAndUpdate(
      { email },
      { password: hashedPassword, encryptedPassword },
      { new: true }
    );

    if (!updated) return res.status(404).json({ error: 'Email does not exist' });

    res.status(201).json({ message: 'Password reset successfully' });
  } catch (err) {
    res.status(400).json({ error: err.message });
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
// router.get('/getAllAdmins', async (req, res) => {
//   try {
//     const admins = await Admin.find({ role: 1 }).sort({ isDeleted: 1, updatedAt: -1 });
//     res.json(admins);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });



const { decrypt } = require('../utils/encryption');

router.get('/getAllAdmins', async (req, res) => {
  try {
    const admins = await Admin.find({ role: 1 }).sort({ isDeleted: 1, updatedAt: -1 });

    const adminsWithPasswords = admins.map(admin => {
      const decryptedPassword = admin.encryptedPassword
        ? decrypt(admin.encryptedPassword)
        : '********';

      return {
        ...admin.toObject(),
        decryptedPassword // used in frontend input field
      };
    });

    res.json(adminsWithPasswords);
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
// router.put('/updateAdmin/:id', async (req, res) => {
//   try {
//     const { id } = req.params;
//     const updateData = req.body;
//     const admin = await Admin.findOneAndUpdate({ _id: id }, updateData, { new: true });
//     if (!admin) {
//       return res.status(404).json({ message: 'Admin not found' });
//     }
//     res.json(admin);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });




const { encrypt } = require('../utils/encryption'); // Make sure this is imported

router.put('/updateAdmin/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    if (updateData.password && updateData.password.trim() !== '') {
      const hashed = await bcrypt.hash(updateData.password, 10);
      updateData.password = hashed;
      updateData.encryptedPassword = encrypt(req.body.password); // for frontend display
    } else {
      delete updateData.password;
    }

    const admin = await Admin.findOneAndUpdate({ _id: id }, updateData, { new: true });
    if (!admin) return res.status(404).json({ message: 'Admin not found' });

    res.json({ message: 'Admin updated successfully', admin });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});











router.put('/deleteAdmin/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const admin = await Admin.findByIdAndUpdate(id, { isDeleted: true, status: 'deleted' }, { new: true });

    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }
    res.json({ message: 'Admin deleted successfully', admin });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/updateMobile', authMiddleware, async (req, res) => {
  try {
    const { id, contact } = req.body;
    console.log('UpdateMobile called with:', { id, contact });
    if (!id || !contact) {
      console.log('Missing id or contact');
      return res.status(400).json({ error: 'Missing id or contact' });
    }
    const admin = await Admin.findById(id);
    console.log('Admin found:', admin);
    if (!admin) {
      console.log('Admin not found');
      return res.status(404).json({ error: 'Admin not found' });
    }
    admin.contact = contact;
    await admin.save();
    console.log('Contact updated successfully');
    res.json({ success: true, contact });
  } catch (err) {
    console.log('Server error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.put('/updateProfile', authMiddleware, async (req, res) => {
  try {
    const { id, username, email, contact } = req.body;
    if (!id || !username || !email || !contact) return res.status(400).json({ error: 'Missing id, username, email, or contact' });

  
    const existing = await Admin.findOne({ email, _id: { $ne: id } });
    if (existing) return res.status(400).json({ error: 'Email already registered' });

    const admin = await Admin.findById(id);
    if (!admin) return res.status(404).json({ error: 'Admin not found' });
    admin.username = username;
    admin.email = email;
    admin.contact = contact;
    await admin.save();
    res.json({ success: true, username, email, contact });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = { router, authMiddleware }; 