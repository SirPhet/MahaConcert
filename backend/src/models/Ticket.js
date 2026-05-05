const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  zone: { type: String, required: true },
  seatNumber: { type: String, required: true },
  price: { type: Number, required: true },
  status: { 
    type: String, 
    enum: ['available', 'pending', 'sold'], 
    default: 'available' 
  },
  lockedUntil: { type: Date },
  lockedBy: { type: String }, // Can be userId or session ID
  metadata: { type: mongoose.Schema.Types.Mixed }
}, { timestamps: true });

// Compound Index to prevent duplicate seats
ticketSchema.index({ eventId: 1, zone: 1, seatNumber: 1 }, { unique: true });

module.exports = mongoose.model('Ticket', ticketSchema);
