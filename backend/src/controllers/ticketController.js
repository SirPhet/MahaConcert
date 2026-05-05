const ticketService = require('../services/ticketService');

exports.reserveTickets = async (req, res) => {
  try {
    const { eventId, seatIds, userId } = req.body;
    if (!eventId || !seatIds || !userId) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    
    const result = await ticketService.reserveTickets(eventId, seatIds, userId);
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.confirmPayment = async (req, res) => {
  try {
    const { orderId } = req.body;
    const result = await ticketService.confirmPayment(orderId);
    res.status(200).json({ success: true, order: result });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
