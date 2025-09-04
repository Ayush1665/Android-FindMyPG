const mongoose = require('mongoose');

const pgSchema = new mongoose.Schema({
  id: {
    type: Number,
    required: true,
    unique: true,
    index: true // ✅ faster lookups by id
  },
  name: {
    type: String,
    required: true,
    trim: true,
    index: true // ✅ search by name faster
  },
  rent: {
    type: String,
    required: true
  },
  // ✅ keep rent as number for sorting/filtering
  rentNumeric: {
    type: Number,
    required: true,
    index: true
  },
  services: [{
    type: String
  }],
  location: {
    type: String,
    required: true,
    index: true // ✅ location-based queries faster
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
    default: true,
    index: true // ✅ filter quickly by availability
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

pgSchema.index({ location: 1, isAvailable: 1, rentNumeric: 1 });

module.exports = mongoose.model('PG', pgSchema);
