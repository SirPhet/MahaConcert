const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/', eventController.getEvents);
router.get('/:id/seats', eventController.getEventSeats);

// Protected Admin Routes
router.post('/', protect, admin, eventController.createEvent);
router.put('/:id', protect, admin, eventController.updateEvent);
router.delete('/:id', protect, admin, eventController.deleteEvent);

module.exports = router;
