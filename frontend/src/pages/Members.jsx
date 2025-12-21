import { useEffect, useState } from 'react';
import api from '../api/axiosClient.js';
import Papa from 'papaparse'; // Import papaparse for CSV

export default function Members() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '', gender: 'male', phone: '', address: '', ministry: '', dateOfBirth: '', profilePhotoBase64: ''
  });

  const loadMembers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/members?limit=50');
      setMembers(res.data.items || []);
    } catch (e) { console.error(e); } 
    finally { setLoading(false); }
  };

  useEffect(() => { loadMembers(); }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Convert Image to Base64 for Backend
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, profilePhotoBase64: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/members', formData);
      setShowModal(false);
      setFormData({ fullName: '', gender: 'male', phone: '', address: '', ministry: '', dateOfBirth: '', profilePhotoBase64: '' });
      loadMembers();
    } catch (e) { alert('Failed to save member'); }
  };

  const handleCSVImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    Papa.parse(file, {
      header: true,
      complete: async (results) => {
        try {
          // Send parsed JSON rows to backend
          await api.post('/members/import', { rows: results.data });
          alert('Import successful!');
          loadMembers();
        } catch (err) { alert('Import failed'); }
      }
    });
  };

  return (
    <div className="space-y-4 text-xs">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-semibold">Members</h1>
        <div className="flex gap-2">
          {/* CSV Import Button */}
          <label className="cursor-pointer bg-emerald-600 hover:bg-emerald-500 px-3 py-1.5 rounded text-white">
            Import CSV
            <input type="file" accept=".csv" className="hidden" onChange={handleCSVImport} />
          </label>
          <button onClick={() => setShowModal(true)} className="bg-indigo-600 hover:bg-indigo-500 px-3 py-1.5 rounded text-white">
            + Add Member
          </button>
        </div>
      </div>

      {/* Modal Form */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-slate-900 border border-slate-700 p-6 rounded-lg w-full max-w-lg relative">
            <button onClick={() => setShowModal(false)} className="absolute top-2 right-2 text-slate-400 hover:text-white">✕</button>
            <h2 className="text-lg font-bold mb-4">Add New Member</h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-slate-400 mb-1">Full Name</label>
                <input name="fullName" value={formData.fullName} onChange={handleInputChange} className="w-full bg-slate-800 border border-slate-700 rounded p-2" required />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Gender</label>
                <select name="gender" value={formData.gender} onChange={handleInputChange} className="w-full bg-slate-800 border border-slate-700 rounded p-2">
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Date of Birth</label>
                <input type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleInputChange} className="w-full bg-slate-800 border border-slate-700 rounded p-2" />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Phone</label>
                <input name="phone" value={formData.phone} onChange={handleInputChange} className="w-full bg-slate-800 border border-slate-700 rounded p-2" />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Ministry</label>
                <input name="ministry" value={formData.ministry} onChange={handleInputChange} className="w-full bg-slate-800 border border-slate-700 rounded p-2" placeholder="e.g. Worship" />
              </div>
              <div className="col-span-2">
                <label className="block text-slate-400 mb-1">Address</label>
                <input name="address" value={formData.address} onChange={handleInputChange} className="w-full bg-slate-800 border border-slate-700 rounded p-2" />
              </div>
              <div className="col-span-2">
                <label className="block text-slate-400 mb-1">Profile Photo</label>
                <input type="file" onChange={handleFileChange} className="w-full text-slate-400" />
              </div>
              <button type="submit" className="col-span-2 bg-indigo-600 hover:bg-indigo-500 py-2 rounded font-bold mt-2">Save Member</button>
            </form>
          </div>
        </div>
      )}

      {/* Members Table */}
      {loading ? <div className="text-slate-400">Loading...</div> : (
        <div className="overflow-x-auto border border-slate-800 rounded">
          <table className="min-w-full text-left">
            <thead className="bg-slate-900">
              <tr>
                <th className="px-3 py-2 border-b border-slate-800">Photo</th>
                <th className="px-3 py-2 border-b border-slate-800">Name</th>
                <th className="px-3 py-2 border-b border-slate-800">Ministry</th>
                <th className="px-3 py-2 border-b border-slate-800">Phone</th>
                <th className="px-3 py-2 border-b border-slate-800">Actions</th>
              </tr>
            </thead>
            <tbody>
              {members.map((m) => (
                <tr key={m._id} className="odd:bg-slate-900/40 hover:bg-slate-800/50">
                  <td className="px-3 py-1.5 border-b border-slate-800">
                    <img src={m.profilePhotoUrl || 'https://via.placeholder.com/30'} alt="" className="w-8 h-8 rounded-full object-cover" />
                  </td>
                  <td className="px-3 py-1.5 border-b border-slate-800 font-medium">{m.fullName}</td>
                  <td className="px-3 py-1.5 border-b border-slate-800">{m.ministry || '-'}</td>
                  <td className="px-3 py-1.5 border-b border-slate-800">{m.phone || '-'}</td>
                  <td className="px-3 py-1.5 border-b border-slate-800">
                    <button className="text-sky-400 hover:underline">Edit</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}