import { useEffect, useState } from 'react';
import api from '../api/axiosClient.js';

export default function Members() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fullName, setFullName] = useState('');
  const [gender, setGender] = useState('male');

  const loadMembers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/members?limit=50');
      setMembers(res.data.items || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMembers();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/members', { fullName, gender });
      setFullName('');
      setGender('male');
      loadMembers();
    } catch (e) {
      console.error(e);
      alert('Failed to create member');
    }
  };

  return (
    <div className="space-y-4 text-xs">
      <h1 className="text-xl font-semibold">Members</h1>

      <form onSubmit={handleCreate} className="flex flex-wrap gap-2 items-end">
        <div>
          <label className="block mb-1 text-slate-300">Full Name</label>
          <input
            className="px-2 py-1 rounded bg-slate-900 border border-slate-700"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block mb-1 text-slate-300">Gender</label>
          <select
            className="px-2 py-1 rounded bg-slate-900 border border-slate-700"
            value={gender}
            onChange={(e) => setGender(e.target.value)}
          >
            <option value="male">male</option>
            <option value="female">female</option>
            <option value="other">other</option>
          </select>
        </div>
        <button
          type="submit"
          className="px-3 py-1 rounded bg-indigo-600 hover:bg-indigo-500 text-xs font-medium"
        >
          Add Member
        </button>
      </form>

      {loading ? (
        <div className="text-slate-400">Loading members...</div>
      ) : (
        <div className="overflow-x-auto border border-slate-800 rounded">
          <table className="min-w-full text-left">
            <thead className="bg-slate-900">
              <tr>
                <th className="px-3 py-2 border-b border-slate-800">Name</th>
                <th className="px-3 py-2 border-b border-slate-800">Gender</th>
                <th className="px-3 py-2 border-b border-slate-800">Phone</th>
                <th className="px-3 py-2 border-b border-slate-800">Small Group</th>
              </tr>
            </thead>
            <tbody>
              {members.map((m) => (
                <tr key={m._id} className="odd:bg-slate-900/40">
                  <td className="px-3 py-1.5 border-b border-slate-800">{m.fullName}</td>
                  <td className="px-3 py-1.5 border-b border-slate-800">{m.gender}</td>
                  <td className="px-3 py-1.5 border-b border-slate-800">{m.phone || '-'}</td>
                  <td className="px-3 py-1.5 border-b border-slate-800">
                    {m.smallGroup?.name || '-'}
                  </td>
                </tr>
              ))}
              {!members.length && (
                <tr>
                  <td className="px-3 py-2 text-slate-400" colSpan={4}>
                    No members yet.
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