import React, { useState, useEffect } from 'react';

const AdminPanel = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '', description: '', date: '', venue: '',
    vipPrice: 5000, vipCapacity: 50,
    normalPrice: 2000, normalCapacity: 50
  });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    const res = await fetch('/api/events');
    const data = await res.json();
    setEvents(data);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const eventPayload = {
      name: formData.name,
      description: formData.description,
      date: formData.date,
      venue: formData.venue,
      zones: [
        { name: 'VIP', price: Number(formData.vipPrice), capacity: Number(formData.vipCapacity), availableSeats: Number(formData.vipCapacity) },
        { name: 'Normal', price: Number(formData.normalPrice), capacity: Number(formData.normalCapacity), availableSeats: Number(formData.normalCapacity) }
      ]
    };

    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      const headers = { 
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userInfo?.token}`
      };

      if (editingId) {
        // Update
        const updatePayload = { name: formData.name, description: formData.description, date: formData.date, venue: formData.venue };
        await fetch(`/api/events/${editingId}`, {
          method: 'PUT',
          headers,
          body: JSON.stringify(updatePayload)
        });
      } else {
        // Create
        await fetch('/api/events', {
          method: 'POST',
          headers,
          body: JSON.stringify(eventPayload)
        });
      }
      setFormData({ name: '', description: '', date: '', venue: '', vipPrice: 5000, vipCapacity: 50, normalPrice: 2000, normalCapacity: 50 });
      setEditingId(null);
      await fetchEvents();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (event) => {
    setEditingId(event._id);
    const dateFormatted = new Date(event.date).toISOString().split('T')[0];
    setFormData({
      name: event.name,
      description: event.description || '',
      date: dateFormatted,
      venue: event.venue,
      vipPrice: 5000, vipCapacity: 50, normalPrice: 2000, normalCapacity: 50 // Simplified for edit mode
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this event? This will also delete all associated tickets.')) return;
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      await fetch(`/api/events/${id}`, { 
        method: 'DELETE',
        headers: { Authorization: `Bearer ${userInfo?.token}` }
      });
      await fetchEvents();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-100 p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">{editingId ? 'Edit Event' : 'Create New Event'}</h2>
      <form onSubmit={handleSubmit} className="mb-10 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Event Name</label>
          <input required type="text" name="name" value={formData.name} onChange={handleChange} className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-2 px-3 border" />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Date</label>
          <input required type="date" name="date" value={formData.date} onChange={handleChange} className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-2 px-3 border" />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Venue</label>
          <input required type="text" name="venue" value={formData.venue} onChange={handleChange} className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-2 px-3 border" />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Description</label>
          <input type="text" name="description" value={formData.description} onChange={handleChange} className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-2 px-3 border" />
        </div>
        
        {!editingId && (
          <>
            <div className="col-span-1 md:col-span-2 mt-4"><h3 className="font-semibold text-gray-800 border-b pb-2">Ticket Zones (Creation Only)</h3></div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">VIP Zone (Capacity & Price)</label>
              <div className="flex gap-2">
                <input required type="number" name="vipCapacity" placeholder="Capacity" value={formData.vipCapacity} onChange={handleChange} className="w-1/2 rounded-lg border-gray-300 shadow-sm py-2 px-3 border focus:border-indigo-500 focus:ring-indigo-500" />
                <input required type="number" name="vipPrice" placeholder="Price (THB)" value={formData.vipPrice} onChange={handleChange} className="w-1/2 rounded-lg border-gray-300 shadow-sm py-2 px-3 border focus:border-indigo-500 focus:ring-indigo-500" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Normal Zone (Capacity & Price)</label>
              <div className="flex gap-2">
                <input required type="number" name="normalCapacity" placeholder="Capacity" value={formData.normalCapacity} onChange={handleChange} className="w-1/2 rounded-lg border-gray-300 shadow-sm py-2 px-3 border focus:border-indigo-500 focus:ring-indigo-500" />
                <input required type="number" name="normalPrice" placeholder="Price (THB)" value={formData.normalPrice} onChange={handleChange} className="w-1/2 rounded-lg border-gray-300 shadow-sm py-2 px-3 border focus:border-indigo-500 focus:ring-indigo-500" />
              </div>
            </div>
          </>
        )}

        <div className="col-span-1 md:col-span-2 mt-4">
          <button disabled={loading} type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-lg transition duration-150 ease-in-out shadow-md">
            {loading ? 'Saving...' : (editingId ? 'Update Event Details' : 'Create Event & Generate Tickets')}
          </button>
          {editingId && (
            <button type="button" onClick={() => {setEditingId(null); setFormData({name: '', description: '', date: '', venue: '', vipPrice: 5000, vipCapacity: 50, normalPrice: 2000, normalCapacity: 50})}} className="w-full mt-3 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded-lg transition duration-150 ease-in-out">
              Cancel Edit
            </button>
          )}
        </div>
      </form>

      <h2 className="text-2xl font-bold text-gray-800 mb-6 border-t pt-8">Existing Events Directory</h2>
      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="min-w-full text-left text-sm whitespace-nowrap">
          <thead className="uppercase tracking-wider border-b border-gray-200 bg-gray-50 text-gray-600 font-semibold">
            <tr>
              <th scope="col" className="px-6 py-4">Event Name</th>
              <th scope="col" className="px-6 py-4">Date</th>
              <th scope="col" className="px-6 py-4">Venue</th>
              <th scope="col" className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {events.map((event) => (
              <tr key={event._id} className="hover:bg-gray-50 transition">
                <td className="px-6 py-4 font-medium text-gray-800">{event.name}</td>
                <td className="px-6 py-4 text-gray-600">{new Date(event.date).toLocaleDateString()}</td>
                <td className="px-6 py-4 text-gray-600">{event.venue}</td>
                <td className="px-6 py-4 text-right">
                  <button onClick={() => handleEdit(event)} className="text-indigo-600 hover:text-indigo-900 font-medium mr-4 px-2 py-1 rounded bg-indigo-50">Edit</button>
                  <button onClick={() => handleDelete(event._id)} className="text-red-600 hover:text-red-900 font-medium px-2 py-1 rounded bg-red-50">Delete</button>
                </td>
              </tr>
            ))}
            {events.length === 0 && (
              <tr>
                <td colSpan="4" className="px-6 py-8 text-center text-gray-500 italic">No events found in the database.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminPanel;
