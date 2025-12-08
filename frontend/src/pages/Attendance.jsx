import { useEffect, useState } from 'react';
import api from '../api/axiosClient.js';

export default function Attendance() {
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    if (!date) return;
    setLoading(true);
    try {
      const res = await api.get('/attendance', { params: { date } });
      setRecords(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []); // load once

  const handleSubmit = (e) => {
    e.preventDefault();
    load();
  };

  return (
    <div className="space-y-4 text-xs">
      <h1 className="text-xl font-semibold">Attendance</h1>

      <form onSubmit={handleSubmit} className="flex flex-wrap gap-2 items-end">
        <div>
          <label className="block mb-1 text-slate-300">Date</label>
          <input
            type="date"
            className="px-2 py-1 rounded bg-slate-900 border border-slate-700"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>
        <button
          type="submit"
          className="px-3 py-1 rounded bg-indigo-600 hover:bg-indigo-500 text-xs font-medium"
        >
          Load
        </button>
      </form>

      {loading ? (
        <div className="text-slate-400">Loading...</div>
      ) : (
        <div className="overflow-x-auto border border-slate-800 rounded">
          <table className="min-w-full text-left">
            <thead className="bg-slate-900">
              <tr>
                <th className="px-3 py-2 border-b border-slate-800">Member</th>
                <th className="px-3 py-2 border-b border-slate-800">Group</th>
                <th className="px-3 py-2 border-b border-slate-800">Status</th>
              </tr>
            </thead>
            <tbody>
              {records.map((r) => (
                <tr key={r._id} className="odd:bg-slate-900/40">
                  <td className="px-3 py-1.5 border-b border-slate-800">
                    {r.member?.fullName || '-'}
                  </td>
                  <td className="px-3 py-1.5 border-b border-slate-800">
                    {r.smallGroup?.name || '-'}
                  </td>
                  <td className="px-3 py-1.5 border-b border-slate-800">
                    {r.status || 'present'}
                  </td>
                </tr>
              ))}
              {!records.length && (
                <tr>
                  <td className="px-3 py-2 text-slate-400" colSpan={3}>
                    No records for this date.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}