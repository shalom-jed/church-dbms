import { useEffect, useState } from 'react';
import api from '../api/axiosClient.js';

export default function SmallGroups() {
  const [groups, setGroups] = useState([]);
  const [members, setMembers] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({ name: '', location: '', meetingDay: '', meetingTime: '' });
  const [selectedGroup, setSelectedGroup] = useState(null); // Active group for modal
  const [assignMemberId, setAssignMemberId] = useState('');

  const loadData = async () => {
    try {
      const [gRes, mRes] = await Promise.all([api.get('/groups'), api.get('/members?limit=1000')]);
      setGroups(gRes.data);
      setMembers(mRes.data.items || []);
    } catch (e) { console.error(e); } 
    finally { setLoading(false); }
  };

  useEffect(() => { loadData(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/groups', formData);
      setFormData({ name: '', location: '', meetingDay: '', meetingTime: '' });
      loadData();
    } catch (e) { alert('Failed to create group'); }
  };

  const handleDelete = async (id) => {
    if(!window.confirm("Delete this group?")) return;
    try { await api.delete(`/groups/${id}`); loadData(); } catch(e) { alert('Delete failed'); }
  };

  const handleUpdateGroup = async () => {
    try {
      await api.put(`/groups/${selectedGroup._id}`, { ...selectedGroup }); 
      alert('Group Updated');
      loadData();
    } catch(e) { alert('Update failed'); }
  };

  const handleAssign = async (e) => {
    e.preventDefault();
    if (!selectedGroup || !assignMemberId) return;
    try {
      const res = await api.post(`/groups/${selectedGroup._id}/assign`, { memberId: assignMemberId });
      setSelectedGroup(res.data); // Update modal with new data
      setAssignMemberId('');
      loadData(); // Update background list
    } catch (e) { alert('Failed to assign member'); }
  };

  const handleRemoveMember = async (memberId) => {
    if(!window.confirm("Remove member from group?")) return;
    try {
      const res = await api.post(`/groups/${selectedGroup._id}/remove`, { memberId });
      setSelectedGroup(res.data);
      loadData();
    } catch(e) { alert('Remove failed'); }
  };

  return (
    <div className="space-y-6 text-xs">
      <h1 className="text-xl font-bold">Small Groups Management</h1>

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
              Manage Details & Members
            </button>
          </div>
        ))}
      </div>

      {selectedGroup && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-slate-900 border border-slate-700 p-6 rounded w-full max-w-lg relative max-h-[90vh] overflow-y-auto">
            <button onClick={() => setSelectedGroup(null)} className="absolute top-2 right-3 text-slate-400">✕</button>
            <h2 className="text-lg font-bold mb-4">Manage: {selectedGroup.name}</h2>
            
            {/* Edit Details Section */}
            <div className="mb-6 border-b border-slate-700 pb-4">
                <h3 className="font-bold text-slate-300 mb-2">Edit Details</h3>
                <div className="grid grid-cols-2 gap-2 mb-2">
                    <input value={selectedGroup.name} onChange={e => setSelectedGroup({...selectedGroup, name: e.target.value})} className="bg-slate-800 border border-slate-700 rounded px-2 py-1" />
                    <input value={selectedGroup.location} onChange={e => setSelectedGroup({...selectedGroup, location: e.target.value})} className="bg-slate-800 border border-slate-700 rounded px-2 py-1" />
                    <input value={selectedGroup.meetingDay} onChange={e => setSelectedGroup({...selectedGroup, meetingDay: e.target.value})} className="bg-slate-800 border border-slate-700 rounded px-2 py-1" />
                    <input type="time" value={selectedGroup.meetingTime} onChange={e => setSelectedGroup({...selectedGroup, meetingTime: e.target.value})} className="bg-slate-800 border border-slate-700 rounded px-2 py-1" />
                </div>
                <button onClick={handleUpdateGroup} className="w-full bg-blue-600 hover:bg-blue-500 py-1 rounded text-white text-xs">Save Changes</button>
            </div>

            {/* Members Section */}
            <h3 className="font-bold text-slate-300 mb-2">Group Members</h3>
            <ul className="space-y-1 mb-4 max-h-40 overflow-y-auto border border-slate-800 rounded p-2">
                {selectedGroup.members?.map(m => (
                    <li key={m._id} className="flex justify-between items-center bg-slate-800/50 px-2 py-1 rounded">
                        <span>{m.fullName}</span>
                        <button onClick={() => handleRemoveMember(m._id)} className="text-red-400 hover:text-white px-2">×</button>
                    </li>
                ))}
                {!selectedGroup.members?.length && <li className="text-slate-500 italic">No members assigned</li>}
            </ul>

            <form onSubmit={handleAssign} className="flex gap-2">
              <select className="flex-1 bg-slate-800 border border-slate-700 rounded p-2" 
                value={assignMemberId} onChange={e => setAssignMemberId(e.target.value)}>
                <option value="">Select a member to add...</option>
                {members.map(m => (
                  <option key={m._id} value={m._id}>{m.fullName}</option>
                ))}
              </select>
              <button type="submit" className="bg-emerald-600 hover:bg-emerald-500 px-4 rounded text-white font-bold">Add</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}