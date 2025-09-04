const mongoose = require('mongoose');

const pgSchema = new mongoose.Schema({
  id: {
    type: Number,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  rent: {
    type: String,
    required: true
  },
  services: [{
    type: String
  }],
  location: {
    type: String,
    required: true
  },
  longitude: {
    type: String,
    default: ''
  },
  latitude: {
    type: String,
    default: ''
  },
  image: {
    uri: {
      type: String,
      required: true
    }
  },
  noAdvance: {
    type: Boolean,
    default: false
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  description: {
    type: String,
    required: true
  },
  rules: [{
    type: String
  }],
  contact: {
    manager: {
      type: String,
      required: true
    },
    phone: {
      type: String,
      required: true
    },
    email: {
      type: String,
      default: ''
    }
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('PG', pgSchema);