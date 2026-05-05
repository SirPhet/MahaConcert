const express = require('express');
const router = express.Router();
const ticketController = require('../controllers/ticketController');
const { protect } = require('../middleware/authMiddleware');

router.post('/reserve', protect, ticketController.reserveTickets);
router.post('/confirm-payment', protect, ticketController.confirmPayment);

module.exports = router;
