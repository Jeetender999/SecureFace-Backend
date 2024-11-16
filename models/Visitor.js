const mongoose = require('mongoose');

// Define the schema for visitors
const VisitorSchema = new mongoose.Schema({
  name: { type: String, default: 'Stranger' }, // Default name for unregistered visitors
  age: { type: Number },
  gender: { type: String },
  emotion: { type: Object }, // Stores emotion details from Face++
  detectedAt: { type: Date, default: Date.now },
});

// Export the model
module.exports = mongoose.model('Visitor', VisitorSchema);
