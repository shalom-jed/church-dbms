import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosClient';

export default function SmallGroups() {
  const navigate = useNavigate();
  const [groups, setGroups] = useState([]);
  const [search, setSearch] = useState('');
  const [formData, setFormData] = useState({ name: '', location: '', meetingDay: '', meetingTime: '' });
  const [showModal, setShowModal] = useState(false);

  const loadGroups = () => api.get('/groups', { params: { search } }).then(res => setGroups(res.data));

  useEffect(() => { loadGroups(); }, [search]);

  const handleCreate = async (e) => {
    e.preventDefault();
    await api.post('/groups', formData);
    setShowModal(false);
    setFormData({ name: '', location: '', meetingDay: '', meetingTime: '' });
    loadGroups();
  };

  return (
    <div className="space-y-4 text-xs text-slate-300">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-bold text-white">Small Groups</h1>
        <div className="flex gap-2">
            <input placeholder="Search groups..." className="bg-slate-800 p-2 rounded border border-slate-700" onChange={e => setSearch(e.target.value)}/>
            <button onClick={() => setShowModal(true)} className="bg-indigo-600 px-3 py-1.5 rounded text-white font-bold">+ Create Group</button>
        </div>
      </div>

      <div className="bg-slate-900 rounded border border-slate-800 overflow-hidden">
        <table className="w-full text-left">
            <thead className="bg-slate-950 text-slate-400 uppercase">
                <tr><th className="p-3">Group Name</th><th className="p-3">Location</th><th className="p-3">Meeting Time</th><th className="p-3">Members</th><th className="p-3 text-right">Action</th></tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
                {groups.map(g => (
                    <tr key={g._id} onClick={() => navigate(`/groups/${g._id}`)} className="hover:bg-slate-800 cursor-pointer">
                        <td className="p-3 font-bold text-indigo-400">{g.name}</td>
                        <td className="p-3">{g.location || '-'}</td>
                        <td className="p-3">{g.meetingDay} {g.meetingTime}</td>
                        <td className="p-3">{g.members?.length || 0} Members</td>
                        <td className="p-3 text-right text-slate-500">View Details →</td>
                    </tr>
                ))}
            </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50" onClick={(e) => e.stopPropagation()}>
           <form onSubmit={handleCreate} className="bg-slate-900 p-6 rounded border border-slate-700 w-96 space-y-3" onClick={e => e.stopPropagation()}>
              <h3 className="font-bold text-white text-lg">Create Group</h3>
              <input className="w-full bg-slate-800 p-2 rounded border border-slate-700" placeholder="Group Name" onChange={e => setFormData({...formData, name: e.target.value})} required />
              <input className="w-full bg-slate-800 p-2 rounded border border-slate-700" placeholder="Location" onChange={e => setFormData({...formData, location: e.target.value})} />
              <div className="grid grid-cols-2 gap-2">
                <input className="bg-slate-800 p-2 rounded border border-slate-700" placeholder="Day (e.g. Tue)" onChange={e => setFormData({...formData, meetingDay: e.target.value})} />
                <input type="time" className="bg-slate-800 p-2 rounded border border-slate-700" onChange={e => setFormData({...formData, meetingTime: e.target.value})} />
              </div>
              <button className="w-full bg-indigo-600 p-2 rounded text-white font-bold">Create</button>
              <button type="button" onClick={() => setShowModal(false)} className="w-full text-slate-400 mt-2">Cancel</button>
           </form>
        </div>
      )}
    </div>
  );
}