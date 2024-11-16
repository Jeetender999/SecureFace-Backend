const mongoose = require('mongoose');

// Define the schema for registered users
const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  age: { type: Number },
  gender: { type: String },
  registeredAt: { type: Date, default: Date.now },
  faceId: { type: String, unique: true, required: true }, // Unique identifier from Face++
});

// Export the model
module.exports = mongoose.model('User', UserSchema);

