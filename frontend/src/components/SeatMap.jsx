import React, { useState, useEffect } from 'react';
import Seat from './Seat';

const SeatMap = ({ eventId, user }) => {
  const [seats, setSeats] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [isReserving, setIsReserving] = useState(false);
  const [isPaying, setIsPaying] = useState(false);
  const [currentOrder, setCurrentOrder] = useState(null);
  const [message, setMessage] = useState({ text: '', type: '' });

  const fetchSeats = async () => {
    try {
      const response = await fetch(`/api/events/${eventId}/seats`);
      const data = await response.json();
      setSeats(data);
      
      // Auto-remove selected seats that are no longer available
      setSelectedSeats(prev => {
        return prev.filter(seatId => {
          const seat = data.find(s => s._id === seatId);
          return seat && seat.status === 'available';
        });
      });
    } catch (err) {
      console.error("Error fetching seats", err);
    }
  };

  useEffect(() => {
    fetchSeats();
    // Poll every 3 seconds for real-time updates
    const interval = setInterval(fetchSeats, 3000);
    return () => clearInterval(interval);
  }, [eventId]);

  const toggleSeatSelection = (seatId) => {
    // If order is active, prevent changing seats
    if (currentOrder) return;

    setSelectedSeats(prev => {
      if (prev.includes(seatId)) {
        return prev.filter(id => id !== seatId);
      } else {
        if (prev.length >= 4) {
          setMessage({ text: 'You can select up to 4 seats maximum.', type: 'error' });
          setTimeout(() => setMessage({ text: '', type: '' }), 3000);
          return prev;
        }
        return [...prev, seatId];
      }
    });
  };

  const handleReserve = async () => {
    if (selectedSeats.length === 0) return;
    
    setIsReserving(true);
    setMessage({ text: '', type: '' });
    
    try {
      const response = await fetch('/api/tickets/reserve', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({
          eventId,
          seatIds: selectedSeats,
          userId: user._id
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setCurrentOrder(data.order);
        setMessage({ text: `Success! Order #${data.order._id.substring(0, 8)} created. Please complete payment within 15 minutes.`, type: 'success' });
        fetchSeats(); // Refresh immediately
      } else {
        setMessage({ text: data.message || 'Reservation failed.', type: 'error' });
        fetchSeats(); // Refresh immediately as status might have changed
      }
    } catch (err) {
      setMessage({ text: 'Network error occurred.', type: 'error' });
    } finally {
      setIsReserving(false);
    }
  };

  const handlePayment = async () => {
    if (!currentOrder) return;

    setIsPaying(true);
    setMessage({ text: '', type: '' });

    try {
      const response = await fetch('/api/tickets/confirm-payment', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({ orderId: currentOrder._id })
      });
      const data = await response.json();

      if (data.success) {
        setMessage({ text: 'Payment successful! Enjoy the concert.', type: 'success' });
        setCurrentOrder(null);
        setSelectedSeats([]);
        fetchSeats();
      } else {
        setMessage({ text: data.message || 'Payment failed.', type: 'error' });
      }
    } catch (err) {
      setMessage({ text: 'Network error occurred during payment.', type: 'error' });
    } finally {
      setIsPaying(false);
    }
  };

  const cancelReservation = () => {
    // Ideally call API to cancel, but TTL will handle it automatically.
    // For UX, just reset state.
    setCurrentOrder(null);
    setSelectedSeats([]);
    setMessage({ text: 'Reservation cancelled locally.', type: 'error' });
  };

  // Group seats by Zone for rendering
  const zones = {};
  seats.forEach(seat => {
    if (!zones[seat.zone]) zones[seat.zone] = [];
    zones[seat.zone].push(seat);
  });

  return (
    <div className="flex flex-col items-center">
      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-4 mb-8 p-4 bg-gray-50 rounded-xl w-full">
        <div className="flex items-center"><div className="w-4 h-4 rounded-sm bg-gray-200 mr-2"></div><span className="text-sm text-gray-600">Available</span></div>
        <div className="flex items-center"><div className="w-4 h-4 rounded-sm bg-green-500 mr-2"></div><span className="text-sm text-gray-600">Selected</span></div>
        <div className="flex items-center"><div className="w-4 h-4 rounded-sm bg-yellow-400 mr-2"></div><span className="text-sm text-gray-600">Pending/Locked</span></div>
        <div className="flex items-center"><div className="w-4 h-4 rounded-sm bg-red-500 mr-2"></div><span className="text-sm text-gray-600">Sold</span></div>
      </div>

      {/* Stage */}
      <div className="w-full max-w-2xl h-16 bg-gradient-to-b from-gray-800 to-gray-700 text-white flex items-center justify-center font-bold tracking-widest rounded-t-3xl rounded-b-xl mb-12 shadow-lg relative overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPgo8cmVjdCB3aWR0aD0iOCIgaGVpZ2h0PSI4IiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9IjAuMSIvPgo8L3N2Zz4=')]"></div>
        <span className="relative z-10 drop-shadow-md">STAGE</span>
      </div>

      {/* Seats */}
      <div className={`w-full flex flex-col items-center gap-8 ${currentOrder ? 'opacity-50 pointer-events-none' : ''}`}>
        {Object.keys(zones).sort((a,b) => a === 'VIP' ? -1 : 1).map(zoneName => (
          <div key={zoneName} className="flex flex-col items-center w-full bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <h3 className="text-lg font-bold text-gray-700 mb-4 px-4 py-1 bg-gray-100 rounded-full">{zoneName} Zone</h3>
            <div className="flex flex-wrap justify-center max-w-xl gap-1">
              {zones[zoneName].map(seat => (
                <Seat 
                  key={seat._id} 
                  data={seat}
                  status={seat.status}
                  isSelected={selectedSeats.includes(seat._id)}
                  onClick={() => toggleSeatSelection(seat._id)}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Booking / Payment Bar */}
      <div className="mt-10 w-full max-w-2xl bg-white rounded-2xl shadow-2xl border-t-4 border-indigo-500 p-6 flex flex-col sm:flex-row items-center justify-between sticky bottom-6 z-50">
        
        {/* State: Reserving (Selecting Seats) */}
        {!currentOrder && (
          <>
            <div className="mb-4 sm:mb-0 text-center sm:text-left">
              <p className="text-gray-500 text-sm font-medium">Selected Seats</p>
              <p className="text-2xl font-bold text-indigo-700">{selectedSeats.length} <span className="text-base font-normal text-gray-400">/ 4 max</span></p>
            </div>
            
            <div className="flex-1 px-0 sm:px-6 w-full my-2 sm:my-0">
              {message.text && (
                <div className={`p-3 rounded-lg text-sm font-medium text-center ${message.type === 'error' ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'}`}>
                  {message.text}
                </div>
              )}
            </div>

            <button 
              onClick={handleReserve}
              disabled={selectedSeats.length === 0 || isReserving}
              className={`w-full sm:w-auto px-8 py-3 rounded-xl font-bold text-white shadow-md transition-all duration-200 ${
                selectedSeats.length === 0 
                  ? 'bg-gray-300 cursor-not-allowed shadow-none' 
                  : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-lg hover:-translate-y-1'
              }`}
            >
              {isReserving ? 'Locking...' : 'Reserve Now'}
            </button>
          </>
        )}

        {/* State: Paying (Order Created) */}
        {currentOrder && (
          <div className="w-full flex flex-col sm:flex-row items-center justify-between">
            <div className="mb-4 sm:mb-0 text-center sm:text-left">
              <p className="text-gray-500 text-sm font-medium">Total Amount</p>
              <p className="text-3xl font-extrabold text-green-600">฿{currentOrder.totalAmount.toLocaleString()}</p>
              <p className="text-xs text-gray-400 mt-1">Order #{currentOrder._id.substring(0, 8)}</p>
            </div>

            <div className="flex-1 px-0 sm:px-6 w-full my-2 sm:my-0">
              {message.text && (
                <div className={`p-3 rounded-lg text-sm font-medium text-center ${message.type === 'error' ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'}`}>
                  {message.text}
                </div>
              )}
            </div>

            <div className="flex gap-2 w-full sm:w-auto">
              <button 
                onClick={cancelReservation}
                disabled={isPaying}
                className="flex-1 sm:flex-none px-4 py-3 rounded-xl font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-all duration-200"
              >
                Cancel
              </button>
              <button 
                onClick={handlePayment}
                disabled={isPaying}
                className="flex-1 sm:flex-none px-8 py-3 rounded-xl font-bold text-white bg-green-500 hover:bg-green-600 shadow-md hover:shadow-lg transition-all duration-200"
              >
                {isPaying ? 'Processing...' : 'Pay Now'}
              </button>
            </div>
          </div>
        )}
        
      </div>
    </div>
  );
};

export default SeatMap;
