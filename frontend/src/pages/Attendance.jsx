// frontend/src/pages/Attendance.jsx
import { useEffect, useState } from 'react';
import api from '../api/axiosClient.js';

export default function Attendance() {
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [groups, setGroups] = useState([]);
  const [selectedGroupId, setSelectedGroupId] = useState('');
  const [attendanceList, setAttendanceList] = useState([]); // [{ memberId, name, status }]
  const [loading, setLoading] = useState(false);

  // Load groups on mount
  useEffect(() => {
    api.get('/groups').then(res => setGroups(res.data)).catch(console.error);
  }, []);

  // Fetch members of selected group AND existing attendance for that date
  const loadAttendanceSheet = async () => {
    if (!selectedGroupId) return;
    setLoading(true);
    try {
      // 1. Get Group Members
      const groupRes = await api.get('/groups'); 
      const group = groupRes.data.find(g => g._id === selectedGroupId);
      
      // 2. Get Existing Attendance
      const attRes = await api.get('/attendance', { params: { date, smallGroup: selectedGroupId } });
      const existingMap = new Map(attRes.data.map(r => [r.member._id, r.status]));

      // 3. Merge
      const sheet = group.members.map(m => ({
        member: m._id,
        fullName: m.fullName,
        status: existingMap.get(m._id) || 'present' // Default to present
      }));
      setAttendanceList(sheet);
    } catch (e) { console.error(e); } 
    finally { setLoading(false); }
  };

  const toggleStatus = (index) => {
    const updated = [...attendanceList];
    updated[index].status = updated[index].status === 'present' ? 'absent' : 'present';
    setAttendanceList(updated);
  };

  const handleSave = async () => {
    try {
      const payload = {
        date,
        smallGroup: selectedGroupId,
        records: attendanceList.map(item => ({ member: item.member, status: item.status }))
      };
      await api.post('/attendance', payload);
      alert('Attendance Saved Successfully');
    } catch (e) { alert('Save failed'); }
  };

  return (
    <div className="space-y-6 text-xs">
      <h1 className="text-xl font-bold">Mark Attendance</h1>

      <div className="flex gap-4 items-end bg-slate-900 p-4 rounded border border-slate-800">
        <div>
          <label className="block text-slate-400 mb-1">Date</label>
          <input type="date" className="bg-slate-800 border border-slate-700 rounded px-3 py-1.5" 
            value={date} onChange={e => setDate(e.target.value)} />
        </div>
        <div className="flex-1">
          <label className="block text-slate-400 mb-1">Select Small Group</label>
          <select className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-1.5"
            value={selectedGroupId} onChange={e => setSelectedGroupId(e.target.value)}>
            <option value="">-- Choose Group --</option>
            {groups.map(g => <option key={g._id} value={g._id}>{g.name}</option>)}
          </select>
        </div>
        <button onClick={loadAttendanceSheet} disabled={!selectedGroupId}
          className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-1.5 rounded disabled:opacity-50">
          Load Sheet
        </button>
      </div>

      {loading ? <div>Loading...</div> : (
        attendanceList.length > 0 && (
          <div className="border border-slate-800 rounded overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-slate-900 text-slate-400">
                <tr>
                  <th className="p-3">Member Name</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 bg-slate-900/50">
                {attendanceList.map((item, idx) => (
                  <tr key={item.member}>
                    <td className="p-3 font-medium">{item.fullName}</td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded text-[10px] uppercase font-bold ${
                        item.status === 'present' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <button onClick={() => toggleStatus(idx)} 
                        className="text-slate-300 hover:text-white underline decoration-dotted">
                        Mark {item.status === 'present' ? 'Absent' : 'Present'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="p-4 bg-slate-900 border-t border-slate-800 flex justify-end">
              <button onClick={handleSave} className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2 rounded font-bold">
                Save Attendance
              </button>
            </div>
          </div>
        )
      )}
    </div>
  );
}