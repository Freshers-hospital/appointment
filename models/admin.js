const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const adminSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  encryptedPassword: { type: String },
  role: { type: Number, required: true, default: 1, enum: [1, 0] }, // 1-admin, 0-superadmin
  contact: { type: String, required: true },

  status: { type: String, required: true, default: 'inactive', enum:['active','inactive']},
  isDeleted:{type:Boolean,default:false },
  lastSeen: { type: Date, default: Date.now }

}, { timestamps: true });

adminSchema.pre('save', async function (next) { 
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

adminSchema.methods.comparePassword = function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('Admin', adminSchema);