import { useEffect, useState } from 'react';
import api from '../api/axiosClient.js';

export default function Events() {
  const [events, setEvents] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ title: '', description: '', date: '', time: '', location: '' });

  const load = async () => {
    try { const res = await api.get('/events?upcoming=false'); setEvents(res.data); } 
    catch (e) { console.error(e); }
  };

  useEffect(() => { load(); }, []);

  const handleEdit = (event) => {
    setEditingId(event._id);
    setFormData({
      title: event.title,
      description: event.description || '',
      date: event.date.split('T')[0],
      time: event.time || '',
      location: event.location || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this event?')) return;
    try { await api.delete(`/events/${id}`); load(); } catch (e) { alert('Delete failed'); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) await api.put(`/events/${editingId}`, formData);
      else await api.post('/events', formData);
      
      setShowModal(false);
      setEditingId(null);
      setFormData({ title: '', description: '', date: '', time: '', location: '' });
      load();
    } catch (e) { alert('Operation failed'); }
  };

  return (
    <div className="space-y-4 text-xs">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-bold">Events</h1>
        <button onClick={() => { setEditingId(null); setFormData({ title: '', description: '', date: '', time: '', location: '' }); setShowModal(true); }} 
          className="bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded font-medium">
          + Add Event
        </button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {events.map((ev) => (
          <div key={ev._id} className="bg-slate-900 border border-slate-800 p-4 rounded flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start">
                <h3 className="font-bold text-base text-purple-300">{ev.title}</h3>
                <div className="flex gap-2">
                   <button onClick={() => handleEdit(ev)} className="text-slate-400 hover:text-white">✎</button>
                   <button onClick={() => handleDelete(ev._id)} className="text-red-400 hover:text-red-300">✕</button>
                </div>
              </div>
              <p className="text-slate-400 mt-1 text-[11px]">{new Date(ev.date).toLocaleDateString()} @ {ev.time || 'TBD'}</p>
              <p className="text-slate-500 mb-2">{ev.location}</p>
              <p className="text-slate-300 line-clamp-3">{ev.description}</p>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-slate-900 border border-slate-700 p-6 rounded w-full max-w-md relative">
            <button onClick={() => setShowModal(false)} className="absolute top-2 right-3 text-slate-400">✕</button>
            <h2 className="text-lg font-bold mb-4">{editingId ? 'Edit Event' : 'New Event'}</h2>
            <form onSubmit={handleSubmit} className="space-y-3">
              <input className="w-full bg-slate-800 border border-slate-700 rounded p-2" placeholder="Event Title" required 
                value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
              <div className="grid grid-cols-2 gap-2">
                <input type="date" className="bg-slate-800 border border-slate-700 rounded p-2" required 
                  value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
                <input type="time" className="bg-slate-800 border border-slate-700 rounded p-2" 
                  value={formData.time} onChange={e => setFormData({...formData, time: e.target.value})} />
              </div>
              <input className="w-full bg-slate-800 border border-slate-700 rounded p-2" placeholder="Location" 
                value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} />
              <textarea className="w-full bg-slate-800 border border-slate-700 rounded p-2 h-24" placeholder="Description" 
                value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
              <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 py-2 rounded text-white font-bold">
                {editingId ? 'Update Event' : 'Create Event'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}