const mongoose = require('mongoose');

const locationUpdateSchema = new mongoose.Schema({
  sosId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SOSEvent',
    required: true
  },
  location: {
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    accuracy: Number
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('LocationUpdate', locationUpdateSchema);
