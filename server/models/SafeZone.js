const mongoose = require('mongoose');

const safeZoneSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: [true, 'Please provide a name for the safe zone'],
    trim: true
  },
  location: {
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true }
  },
  radius: {
    type: Number,
    default: 500 // meters
  },
  enabled: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('SafeZone', safeZoneSchema);
