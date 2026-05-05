require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./src/config/db');
const Event = require('./src/models/Event');
const Ticket = require('./src/models/Ticket');
const Order = require('./src/models/Order');
const User = require('./src/models/User');

const seedData = async () => {
  try {
    await connectDB();
    
    // Clear existing
    await Event.deleteMany();
    await Ticket.deleteMany();
    await Order.deleteMany();
    await User.deleteMany();

    const event = await Event.create({
      name: "MahaConcert 2026",
      description: "The biggest concert of the year!",
      date: new Date('2026-12-31T20:00:00'),
      venue: "Grand Stadium",
      zones: [
        { name: "VIP", price: 5000, capacity: 50, availableSeats: 50 },
        { name: "Normal", price: 2000, capacity: 50, availableSeats: 50 }
      ]
    });

    const ticketsToCreate = [];
    
    // Create 50 VIP seats
    for (let i = 1; i <= 50; i++) {
      ticketsToCreate.push({
        eventId: event._id,
        zone: "VIP",
        seatNumber: `V${i.toString().padStart(2, '0')}`,
        price: 5000,
        status: 'available'
      });
    }

    // Create 50 Normal seats
    for (let i = 1; i <= 50; i++) {
      ticketsToCreate.push({
        eventId: event._id,
        zone: "Normal",
        seatNumber: `N${i.toString().padStart(2, '0')}`,
        price: 2000,
        status: 'available'
      });
    }

    await Ticket.insertMany(ticketsToCreate);

    // Create default users
    await User.create([
      { username: 'user', password: 'user123', role: 'user' },
      { username: 'admin', password: 'admin123', role: 'admin' }
    ]);

    console.log("Mock data created successfully!");
    process.exit();
  } catch (error) {
    console.error("Error creating mock data:", error);
    process.exit(1);
  }
};

seedData();
