// frontend/src/pages/SmallGroups.jsx
import { useEffect, useState } from 'react';
import api from '../api/axiosClient.js';

export default function SmallGroups() {
  const [groups, setGroups] = useState([]);
  const [members, setMembers] = useState([]); // For assignment dropdown
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({ name: '', location: '', meetingDay: '', meetingTime: '' });
  const [selectedGroup, setSelectedGroup] = useState(null); // For detail view
  const [assignMemberId, setAssignMemberId] = useState('');

  const loadGroups = async () => {
    try {
      const [gRes, mRes] = await Promise.all([api.get('/groups'), api.get('/members?limit=1000')]);
      setGroups(gRes.data);
      setMembers(mRes.data.items || []);
    } catch (e) { console.error(e); } 
    finally { setLoading(false); }
  };

  useEffect(() => { loadGroups(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/groups', formData);
      setFormData({ name: '', location: '', meetingDay: '', meetingTime: '' });
      loadGroups();
    } catch (e) { alert('Failed to create group'); }
  };

  const handleAssign = async (e) => {
    e.preventDefault();
    if (!selectedGroup || !assignMemberId) return;
    try {
      await api.post(`/groups/${selectedGroup._id}/assign`, { memberId: assignMemberId });
      alert('Member Assigned');
      loadGroups();
      setSelectedGroup(null); // Close modal
    } catch (e) { alert('Failed to assign member'); }
  };

  const handleDelete = async (id) => {
    if(!window.confirm("Delete this group?")) return;
    try { await api.delete(`/groups/${id}`); loadGroups(); } catch(e) { alert('Delete failed'); }
  };

  return (
    <div className="space-y-6 text-xs">
      <h1 className="text-xl font-bold">Small Groups Management</h1>

      {/* Create Group Form */}
      <form onSubmit={handleCreate} className="bg-slate-900 p-4 rounded border border-slate-800 grid grid-cols-2 md:grid-cols-5 gap-3 items-end">
        <div className="col-span-2 md:col-span-1">
           <label className="block text-slate-400 mb-1">Group Name</label>
           <input className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1" required 
             value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
        </div>
        <div>
           <label className="block text-slate-400 mb-1">Location</label>
           <input className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1" 
             value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} />
        </div>
        <div>
           <label className="block text-slate-400 mb-1">Day</label>
           <input className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1" placeholder="e.g. Tuesday"
             value={formData.meetingDay} onChange={e => setFormData({...formData, meetingDay: e.target.value})} />
        </div>
        <div>
           <label className="block text-slate-400 mb-1">Time</label>
           <input className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1" type="time"
             value={formData.meetingTime} onChange={e => setFormData({...formData, meetingTime: e.target.value})} />
        </div>
        <button type="submit" className="bg-indigo-600 hover:bg-indigo-500 text-white py-1 rounded font-medium">Create Group</button>
      </form>

      {/* Group List */}
      <div className="grid md:grid-cols-2 gap-4">
        {groups.map(g => (
          <div key={g._id} className="bg-slate-900 border border-slate-800 p-4 rounded flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start">
                <h3 className="font-bold text-base text-indigo-400">{g.name}</h3>
                <button onClick={() => handleDelete(g._id)} className="text-red-400 hover:text-red-300">🗑</button>
              </div>
              <p className="text-slate-400 mt-1">{g.location || 'No location'} • {g.meetingDay} {g.meetingTime}</p>
              <div className="mt-3 text-slate-300">
                <span className="font-semibold">Members ({g.members?.length || 0}):</span> 
                <p className="line-clamp-2 text-[10px] text-slate-500">{g.members?.map(m => m.fullName).join(', ')}</p>
              </div>
            </div>
            <button onClick={() => setSelectedGroup(g)} className="mt-3 w-full bg-slate-800 hover:bg-slate-700 py-1.5 rounded text-indigo-300">
              Manage / Assign Members
            </button>
          </div>
        ))}
      </div>

      {/* Modal for Assigning Members */}
      {selectedGroup && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-slate-900 border border-slate-700 p-6 rounded w-full max-w-md relative">
            <button onClick={() => setSelectedGroup(null)} className="absolute top-2 right-3 text-slate-400">✕</button>
            <h2 className="text-lg font-bold mb-4">Manage: {selectedGroup.name}</h2>
            
            <form onSubmit={handleAssign} className="space-y-4">
              <div>
                <label className="block text-slate-400 mb-1">Add Member to Group</label>
                <select className="w-full bg-slate-800 border border-slate-700 rounded p-2" 
                  value={assignMemberId} onChange={e => setAssignMemberId(e.target.value)}>
                  <option value="">Select a member...</option>
                  {members.map(m => (
                    <option key={m._id} value={m._id}>{m.fullName}</option>
                  ))}
                </select>
              </div>
              <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 py-2 rounded text-white font-bold">
                Assign Member
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}