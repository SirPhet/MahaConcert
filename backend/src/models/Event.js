const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  date: { type: Date, required: true },
  venue: { type: String, required: true },
  zones: [
    {
      name: { type: String, required: true },
      price: { type: Number, required: true },
      capacity: { type: Number, required: true },
      availableSeats: { type: Number, required: true }
    }
  ]
}, { timestamps: true });

module.exports = mongoose.model('Event', eventSchema);
