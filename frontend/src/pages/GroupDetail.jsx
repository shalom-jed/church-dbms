import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axiosClient';

export default function GroupDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [group, setGroup] = useState(null);
  const [allMembers, setAllMembers] = useState([]);
  const [assignId, setAssignId] = useState('');
  const [showEdit, setShowEdit] = useState(false);
  const [formData, setFormData] = useState({});

  const loadData = async () => {
    try {
      const [gRes, mRes] = await Promise.all([
        api.get(`/groups/${id}`),
        api.get('/members?limit=1000') // Fetch all for dropdown
      ]);
      setGroup(gRes.data);
      setAllMembers(mRes.data.items);
      setFormData({
        name: gRes.data.name,
        location: gRes.data.location,
        meetingDay: gRes.data.meetingDay,
        meetingTime: gRes.data.meetingTime,
        notes: gRes.data.notes
      });
    } catch (e) { console.error(e); }
  };

  useEffect(() => { loadData(); }, [id]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    await api.put(`/groups/${id}`, formData);
    setShowEdit(false);
    loadData();
  };

  const handleDelete = async () => {
    if (confirm('Delete this group? This will unassign all members.')) {
      await api.delete(`/groups/${id}`);
      navigate('/groups');
    }
  };

  const handleAssign = async () => {
    if(!assignId) return;
    try {
        await api.post(`/groups/${id}/assign`, { memberId: assignId });
        setAssignId('');
        loadData();
    } catch(e) { alert('Failed to assign member'); }
  };

  const handleRemove = async (memberId) => {
    if(confirm('Remove member from this group?')) {
        await api.post(`/groups/${id}/remove`, { memberId });
        loadData();
    }
  };

  if (!group) return <div>Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6 text-slate-300 text-xs">
      {/* Header Actions */}
      <div className="flex justify-between items-center">
         <button onClick={() => navigate('/groups')} className="text-indigo-400 hover:text-indigo-300">← Back to Groups</button>
         <div className="flex gap-2">
            <button onClick={() => setShowEdit(true)} className="bg-indigo-600 hover:bg-indigo-500 px-3 py-1.5 rounded text-white font-bold">Edit Details</button>
            <button onClick={handleDelete} className="bg-red-900/20 text-red-400 border border-red-900/50 px-3 py-1.5 rounded font-bold">Delete Group</button>
         </div>
      </div>

      {/* Main Info Card */}
      <div className="bg-slate-900 p-6 rounded border border-slate-800 flex flex-col md:flex-row gap-6">
         <div className="flex-1 space-y-4">
            <div>
                <h1 className="text-2xl font-bold text-white">{group.name}</h1>
                <p className="text-slate-500 flex items-center gap-2 mt-1">
                    📍 {group.location || 'No Location'} 
                    <span className="text-slate-700">|</span> 
                    🕒 {group.meetingDay} {group.meetingTime}
                </p>
            </div>
            
            <div className="grid grid-cols-2 gap-4 bg-slate-950 p-4 rounded border border-slate-800">
                <div>
                    <label className="block text-slate-500 mb-1">Leader</label>
                    <p className="text-white font-medium">{group.leader?.fullName || 'No Leader Assigned'}</p>
                </div>
                <div>
                    <label className="block text-slate-500 mb-1">Total Members</label>
                    <p className="text-white font-medium">{group.members.length} People</p>
                </div>
                <div className="col-span-2">
                    <label className="block text-slate-500 mb-1">Notes</label>
                    <p className="text-slate-300">{group.notes || 'No notes available.'}</p>
                </div>
            </div>
         </div>
      </div>

      {/* Members List Section */}
      <div className="grid md:grid-cols-3 gap-6">
          {/* List */}
          <div className="md:col-span-2 bg-slate-900 p-4 rounded border border-slate-800">
             <h3 className="font-bold text-white mb-4 border-b border-slate-800 pb-2">Group Members</h3>
             <div className="space-y-2">
                {group.members.map(m => (
                    <div key={m._id} className="flex justify-between items-center bg-slate-800 p-2 rounded hover:bg-slate-700 transition">
                        <div className="flex items-center gap-3">
                            <img src={m.profilePhotoUrl || 'https://via.placeholder.com/30'} className="w-8 h-8 rounded-full object-cover" />
                            <div>
                                <p className="text-white font-medium">{m.fullName}</p>
                                <p className="text-[10px] text-slate-500">{m.phone || 'No phone'}</p>
                            </div>
                        </div>
                        <button onClick={() => handleRemove(m._id)} className="text-red-400 hover:text-white px-2">Remove</button>
                    </div>
                ))}
                {group.members.length === 0 && <p className="text-slate-500 italic">No members in this group yet.</p>}
             </div>
          </div>

          {/* Add Member Sidebar */}
          <div className="bg-slate-900 p-4 rounded border border-slate-800 h-fit">
              <h3 className="font-bold text-white mb-4">Add Member</h3>
              <div className="flex flex-col gap-2">
                  <select 
                    className="bg-slate-800 border border-slate-700 rounded p-2 text-white" 
                    value={assignId} 
                    onChange={e => setAssignId(e.target.value)}
                  >
                      <option value="">Select a member...</option>
                      {allMembers.map(m => (
                          <option key={m._id} value={m._id}>{m.fullName}</option>
                      ))}
                  </select>
                  <button onClick={handleAssign} disabled={!assignId} className="bg-emerald-600 hover:bg-emerald-500 py-2 rounded text-white font-bold disabled:opacity-50">
                      Assign to Group
                  </button>
              </div>
          </div>
      </div>

      {/* Edit Modal */}
      {showEdit && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
            <div className="bg-slate-900 border border-slate-700 p-6 rounded w-full max-w-md">
                <h3 className="font-bold text-white text-lg mb-4">Edit Group Details</h3>
                <form onSubmit={handleUpdate} className="space-y-3">
                    <div>
                        <label className="block text-slate-500 mb-1">Group Name</label>
                        <input className="w-full bg-slate-800 border border-slate-700 rounded p-2" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                    </div>
                    <div>
                        <label className="block text-slate-500 mb-1">Location</label>
                        <input className="w-full bg-slate-800 border border-slate-700 rounded p-2" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        <div>
                            <label className="block text-slate-500 mb-1">Day</label>
                            <input className="w-full bg-slate-800 border border-slate-700 rounded p-2" value={formData.meetingDay} onChange={e => setFormData({...formData, meetingDay: e.target.value})} />
                        </div>
                        <div>
                            <label className="block text-slate-500 mb-1">Time</label>
                            <input type="time" className="w-full bg-slate-800 border border-slate-700 rounded p-2" value={formData.meetingTime} onChange={e => setFormData({...formData, meetingTime: e.target.value})} />
                        </div>
                    </div>
                    <div>
                        <label className="block text-slate-500 mb-1">Notes</label>
                        <textarea className="w-full bg-slate-800 border border-slate-700 rounded p-2" rows="3" value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})}></textarea>
                    </div>
                    <button className="w-full bg-indigo-600 hover:bg-indigo-500 py-2 rounded text-white font-bold mt-2">Save Changes</button>
                    <button type="button" onClick={() => setShowEdit(false)} className="w-full text-slate-400 mt-2">Cancel</button>
                </form>
            </div>
        </div>
      )}
    </div>
  );
}