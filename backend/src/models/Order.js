const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  userId: { type: String, required: true }, // Using String for simplicity in mock
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  tickets: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Ticket' }],
  totalAmount: { type: Number, required: true },
  status: { 
    type: String, 
    enum: ['pending', 'paid', 'cancelled'], 
    default: 'pending' 
  },
  paymentTimestamp: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
