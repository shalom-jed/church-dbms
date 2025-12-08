import { useEffect, useState } from 'react';
import api from '../api/axiosClient.js';

export default function Events() {
  const [events, setEvents] = useState([]);
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');

  const load = async () => {
    try {
      const res = await api.get('/events');
      setEvents(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/events', { title, date });
      setTitle('');
      setDate('');
      load();
    } catch (e) {
      console.error(e);
      alert('Failed to create event');
    }
  };

  return (
    <div className="space-y-4 text-xs">
      <h1 className="text-xl font-semibold">Events</h1>

      <form onSubmit={handleCreate} className="flex flex-wrap gap-2 items-end">
        <div>
          <label className="block mb-1 text-slate-300">Title</label>
          <input
            className="px-2 py-1 rounded bg-slate-900 border border-slate-700"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block mb-1 text-slate-300">Date</label>
          <input
            type="date"
            className="px-2 py-1 rounded bg-slate-900 border border-slate-700"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </div>
        <button
          type="submit"
          className="px-3 py-1 rounded bg-indigo-600 hover:bg-indigo-500 text-xs font-medium"
        >
          Add Event
        </button>
      </form>

      <div className="space-y-2">
        {events.map((ev) => (
          <div
            key={ev._id}
            className="border border-slate-800 rounded p-3 bg-slate-900 flex justify-between"
          >
            <div>
              <div className="font-semibold">{ev.title}</div>
              <div className="text-slate-400">
                {new Date(ev.date).toLocaleDateString()} · {ev.location || 'TBD'}
              </div>
            </div>
          </div>
        ))}
        {!events.length && (
          <div className="text-slate-400">No events yet.</div>
        )}
      </div>
    </div>
  );
}