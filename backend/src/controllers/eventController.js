const Event = require('../models/Event');
const Ticket = require('../models/Ticket');

exports.getEvents = async (req, res) => {
  try {
    const events = await Event.find();
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getEventSeats = async (req, res) => {
  try {
    let tickets = await Ticket.find({ eventId: req.params.id }).sort({ zone: 1, seatNumber: 1 });
    
    // Auto-Generation Logic: If no tickets found, create them based on event zones
    if (tickets.length === 0) {
      const event = await Event.findById(req.params.id);
      if (event && event.zones && Array.isArray(event.zones)) {
        console.log(`Auto-generating tickets for event: ${event.name}`);
        const ticketsToCreate = [];
        for (const zone of event.zones) {
          for (let i = 1; i <= zone.capacity; i++) {
            const prefix = zone.name.charAt(0).toUpperCase();
            ticketsToCreate.push({
              eventId: event._id,
              zone: zone.name,
              seatNumber: `${prefix}${i.toString().padStart(2, '0')}`,
              price: zone.price,
              status: 'available'
            });
          }
        }
        if (ticketsToCreate.length > 0) {
          await Ticket.insertMany(ticketsToCreate);
          tickets = await Ticket.find({ eventId: req.params.id }).sort({ zone: 1, seatNumber: 1 });
        }
      }
    }

    // Process logical status (Optimistic TTL)
    const processedTickets = tickets.map(ticket => {
      let currentStatus = ticket.status;
      if (currentStatus === 'pending') {
        const isExpired = new Date(ticket.lockedUntil) < new Date();
        if (isExpired) currentStatus = 'available';
      }
      return {
        _id: ticket._id,
        zone: ticket.zone,
        seatNumber: ticket.seatNumber,
        price: ticket.price,
        status: currentStatus
      };
    });

    res.json(processedTickets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createEvent = async (req, res) => {
  try {
    const { name, description, date, venue, zones } = req.body;
    
    // Create Event
    const event = new Event({
      name,
      description,
      date,
      venue,
      zones
    });
    const savedEvent = await event.save();

    // Generate Tickets based on zones
    const ticketsToCreate = [];
    if (zones && Array.isArray(zones)) {
      for (const zone of zones) {
        for (let i = 1; i <= zone.capacity; i++) {
          const prefix = zone.name.charAt(0).toUpperCase();
          ticketsToCreate.push({
            eventId: savedEvent._id,
            zone: zone.name,
            seatNumber: `${prefix}${i.toString().padStart(2, '0')}`,
            price: zone.price,
            status: 'available'
          });
        }
      }
      if (ticketsToCreate.length > 0) {
        await Ticket.insertMany(ticketsToCreate);
      }
    }

    res.status(201).json(savedEvent);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.updateEvent = async (req, res) => {
  try {
    const { name, description, date, venue } = req.body;
    const updatedEvent = await Event.findByIdAndUpdate(
      req.params.id,
      { name, description, date, venue },
      { new: true, runValidators: true }
    );
    if (!updatedEvent) return res.status(404).json({ message: 'Event not found' });
    res.json(updatedEvent);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deleteEvent = async (req, res) => {
  try {
    const eventId = req.params.id;
    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ message: 'Event not found' });
    
    await Event.findByIdAndDelete(eventId);
    // Delete associated tickets
    await Ticket.deleteMany({ eventId: eventId });
    
    res.json({ message: 'Event and associated tickets deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
