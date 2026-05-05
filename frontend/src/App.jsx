import React, { useState, useEffect } from 'react';
import SeatMap from './components/SeatMap';
import AdminPanel from './components/AdminPanel';
import AuthScreen from './components/AuthScreen';

function App() {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('userInfo');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [view, setView] = useState('booking'); // 'booking' or 'admin'

  const loadEvents = () => {
    fetch('/api/events')
      .then(res => res.json())
      .then(data => {
        setEvents(data);
        if (data.length > 0 && !selectedEventId) {
          setSelectedEventId(data[0]._id);
        } else if (data.length === 0) {
          setSelectedEventId(null);
        }
      })
      .catch(err => console.error("Error fetching events:", err));
  };

  useEffect(() => {
    if (user) loadEvents();
  }, [view, user]);

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 text-gray-800">
        <AuthScreen onLogin={setUser} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8 text-gray-800">
      <div className="max-w-5xl mx-auto">
        <header className="mb-10 mt-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="text-center md:text-left">
              <h1 className="text-4xl font-extrabold text-indigo-700 tracking-tight mb-1">
                MahaConcert {view === 'admin' ? 'Admin' : 'Booking'}
              </h1>
              <p className="text-gray-500 text-sm font-medium">Fast, secure, and atomic ticket reservation system</p>
            </div>
            
            <div className="flex flex-wrap justify-center gap-3">
              {user.role === 'admin' && (
                <button 
                  onClick={() => setView(view === 'booking' ? 'admin' : 'booking')}
                  className="bg-indigo-600 text-white hover:bg-indigo-700 px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-md hover:shadow-lg active:scale-95 border border-indigo-700"
                >
                  {view === 'booking' ? '⚙️ Admin Panel' : '🎫 Booking View'}
                </button>
              )}
              <button 
                onClick={() => {
                  localStorage.removeItem('userInfo');
                  setUser(null);
                  setView('booking');
                }}
                className="bg-white text-red-600 hover:bg-red-50 px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-sm border border-red-200 active:scale-95"
              >
                Logout ({user.username})
              </button>
            </div>
          </div>
        </header>

        {view === 'admin' ? (
          <AdminPanel />
        ) : events.length === 0 ? (
          <div className="text-center p-10 bg-white rounded-xl shadow-md border border-gray-200">
            <div className="animate-pulse flex flex-col items-center">
              <div className="h-12 w-12 bg-gray-200 rounded-full mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
              <p className="text-gray-400 mt-4 text-sm">Loading events or no events found. Please run the seed script!</p>
            </div>
          </div>
        ) : (
          <div className="bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-100">
            <div className="p-6 bg-gradient-to-r from-indigo-50 to-blue-50 border-b border-gray-100">
              <label htmlFor="event-select" className="block text-sm font-semibold text-gray-700 mb-2">Select Event:</label>
              <select 
                id="event-select"
                className="w-full sm:w-1/2 rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 bg-white py-2 px-3 text-gray-700"
                value={selectedEventId || ''} 
                onChange={(e) => setSelectedEventId(e.target.value)}
              >
                {events.map(event => (
                  <option key={event._id} value={event._id}>{event.name} - {new Date(event.date).toLocaleDateString()}</option>
                ))}
              </select>
            </div>
            
            <div className="p-8">
              {selectedEventId && <SeatMap eventId={selectedEventId} user={user} />}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
