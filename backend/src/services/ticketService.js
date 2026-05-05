const Ticket = require('../models/Ticket');
const Order = require('../models/Order');

exports.reserveTickets = async (eventId, seatIds, userId) => {
  const LOCK_DURATION_MINUTES = 15;
  const lockedUntilTime = new Date(Date.now() + LOCK_DURATION_MINUTES * 60000);
  const successfullyLocked = [];
  let totalAmount = 0;

  try {
    for (const ticketId of seatIds) {
      const ticket = await Ticket.findOneAndUpdate(
        {
          _id: ticketId,
          eventId: eventId,
          $or: [
            { status: 'available' },
            { status: 'pending', lockedUntil: { $lt: new Date() } }
          ]
        },
        {
          $set: {
            status: 'pending',
            lockedUntil: lockedUntilTime,
            lockedBy: userId
          }
        },
        { new: true }
      );

      if (ticket) {
        successfullyLocked.push(ticket);
        totalAmount += ticket.price;
      } else {
        throw new Error(`Seat ${ticketId} is no longer available.`);
      }
    }

    if (successfullyLocked.length === 0) {
      throw new Error("No seats were selected.");
    }

    const order = await Order.create({
      userId,
      eventId,
      tickets: successfullyLocked.map(t => t._id),
      totalAmount
    });

    return { success: true, order, lockedSeats: successfullyLocked };

  } catch (error) {
    if (successfullyLocked.length > 0) {
      await Ticket.updateMany(
        { _id: { $in: successfullyLocked.map(t => t._id) } },
        { $set: { status: 'available', lockedBy: null, lockedUntil: null } }
      );
    }
    throw error;
  }
};

exports.confirmPayment = async (orderId) => {
  const order = await Order.findById(orderId);
  if (!order || order.status !== 'pending') {
    throw new Error('Invalid order or order is not pending.');
  }

  // Update order status
  order.status = 'paid';
  order.paymentTimestamp = new Date();
  await order.save();

  // Update tickets status to sold
  await Ticket.updateMany(
    { _id: { $in: order.tickets } },
    { $set: { status: 'sold', lockedUntil: null } }
  );

  return order;
};
