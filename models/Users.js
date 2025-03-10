const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  password: { type: String, required: true }, 
  contactInfo: { type: String }, 
  companyName: { type: String },
  secretKey: { type: String, unique: true }, 
  role: { type: String, enum: ['super', 'sub'], default: 'sub' },
}, { timestamps: true });

module.exports = mongoose.model("Users", userSchema);
