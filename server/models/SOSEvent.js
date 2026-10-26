const mongoose = require('mongoose');

const sosEventSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  location: {
    latitude: Number,
    longitude: Number,
    accuracy: Number
  },
  status: {
    type: String,
    enum: ['ACTIVE', 'RESPONDED', 'CLOSED', 'CANCELLED'],
    default: 'ACTIVE'
  },
  activationMethod: {
    type: String,
    default: 'SOS Button'
  },
  activatedAt: {
    type: Date,
    default: Date.now
  },
  respondedAt: Date,
  closedAt: Date
}, {
  timestamps: true
});

module.exports = mongoose.model('SOSEvent', sosEventSchema);
