import { useEffect, useState } from 'react';
import api from '../api/axiosClient.js';

export default function SmallGroups() {
  const [groups, setGroups] = useState([]);
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(true);

  const loadGroups = async () => {
    setLoading(true);
    try {
      const res = await api.get('/groups');
      setGroups(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGroups();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/groups', { name });
      setName('');
      loadGroups();
    } catch (e) {
      console.error(e);
      alert('Failed to create group');
    }
  };

  return (
    <div className="space-y-4 text-xs">
      <h1 className="text-xl font-semibold">Small Groups</h1>

      <form onSubmit={handleCreate} className="flex gap-2 items-end">
        <div>
          <label className="block mb-1 text-slate-300">Group Name</label>
          <input
            className="px-2 py-1 rounded bg-slate-900 border border-slate-700"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <button
          type="submit"
          className="px-3 py-1 rounded bg-indigo-600 hover:bg-indigo-500 text-xs font-medium"
        >
          Add Group
        </button>
      </form>

      {loading ? (
        <div className="text-slate-400">Loading groups...</div>
      ) : (
        <div className="space-y-2">
          {groups.map((g) => (
            <div
              key={g._id}
              className="border border-slate-800 rounded p-3 bg-slate-900 flex justify-between"
            >
              <div>
                <div className="font-semibold">{g.name}</div>
                <div className="text-slate-400">
                  Leader: {g.leader?.fullName || '—'} · Members: {g.members?.length || 0}
                </div>
              </div>
            </div>
          ))}
          {!groups.length && (
            <div className="text-slate-400">No small groups yet.</div>
          )}
        </div>
      )}
    </div>
  );
}