const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: [true, 'Please provide a contact name'],
    trim: true
  },
  phone: {
    type: String,
    required: [true, 'Please provide a contact phone number']
  },
  email: {
    type: String,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
  },
  relationship: {
    type: String,
    required: [true, 'Please provide the relationship']
  },
  priority: {
    type: Number,
    default: 1
  },
  verified: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Contact', contactSchema);
