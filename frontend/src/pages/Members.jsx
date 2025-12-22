import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosClient.js';
import Papa from 'papaparse';

export default function Members() {
  const navigate = useNavigate();
  const [members, setMembers] = useState([]);
  const [groups, setGroups] = useState([]); // For filter dropdown
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  // Search & Filter State
  const [filters, setFilters] = useState({
    search: '',
    gender: '',
    ministry: '',
    smallGroup: ''
  });

  // Form State
  const [formData, setFormData] = useState({
    fullName: '', gender: 'male', phone: '', address: '', ministry: '', dateOfBirth: '', profilePhotoBase64: ''
  });

  // Load Members with Filters
  const loadData = async () => {
    setLoading(true);
    try {
      // Clean filters (remove empty strings)
      const params = Object.fromEntries(Object.entries(filters).filter(([_, v]) => v !== ''));
      params.limit = 100;

      const [memRes, groupRes] = await Promise.all([
        api.get('/members', { params }),
        api.get('/groups')
      ]);
      
      setMembers(memRes.data.items || []);
      setGroups(groupRes.data || []);
    } catch (e) { console.error(e); } 
    finally { setLoading(false); }
  };

  useEffect(() => { loadData(); }, [filters]); // Reload when filters change

  // Handle Input Changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle Image Upload (Convert to Base64)
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setFormData(prev => ({ ...prev, profilePhotoBase64: reader.result }));
      reader.readAsDataURL(file);
    }
  };

  // Open Modal for Edit
  const handleEdit = (e, member) => {
    e.stopPropagation();
    setEditingId(member._id);
    setFormData({
      fullName: member.fullName,
      gender: member.gender,
      phone: member.phone || '',
      address: member.address || '',
      ministry: member.ministry || '',
      dateOfBirth: member.dateOfBirth ? member.dateOfBirth.split('T')[0] : '',
      profilePhotoBase64: '' // Keep empty to avoid re-uploading if unchanged
    });
    setShowModal(true);
  };

  // Delete Member
  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this member?")) return;
    try { await api.delete(`/members/${id}`); loadData(); } catch (e) { alert('Delete failed - check your permissions'); }
  };

  // Submit Form (Create or Update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/members/${editingId}`, formData);
      } else {
        await api.post('/members', formData);
      }
      setShowModal(false);
      setEditingId(null);
      setFormData({ fullName: '', gender: 'male', phone: '', address: '', ministry: '', dateOfBirth: '', profilePhotoBase64: '' });
      loadData();
    } catch (e) { 
        console.error(e);
        alert(e.response?.data?.message || 'Failed to save member. You may not have permission.'); 
    }
  };

  // CSV Import
  const handleCSVImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    Papa.parse(file, {
      header: true,
      complete: async (results) => {
        try {
          await api.post('/members/import', { rows: results.data });
          alert('Import successful!');
          loadData();
        } catch (err) { alert('Import failed'); }
      }
    });
  };

  return (
    <div className="space-y-4 text-xs text-slate-300">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-xl font-bold text-white">Members</h1>
        <div className="flex gap-2">
           <a href={`${import.meta.env.VITE_API_URL}/members/export?token=${localStorage.getItem('token')}`} target="_blank" rel="noreferrer" 
              className="bg-slate-700 hover:bg-slate-600 px-3 py-1.5 rounded text-white font-medium">Export CSV</a>
           <label className="cursor-pointer bg-emerald-600 hover:bg-emerald-500 px-3 py-1.5 rounded text-white font-medium">
              Import CSV
              <input type="file" accept=".csv" className="hidden" onChange={handleCSVImport} />
           </label>
           <button onClick={() => { setEditingId(null); setShowModal(true); }} className="bg-indigo-600 hover:bg-indigo-500 px-3 py-1.5 rounded text-white font-bold">+ Add Member</button>
        </div>
      </div>

      {/* Advanced Filters */}
      <div className="bg-slate-900 p-3 rounded border border-slate-800 grid grid-cols-1 md:grid-cols-4 gap-3">
        <input 
          placeholder="Search Name or Phone..." 
          className="bg-slate-800 border border-slate-700 rounded px-2 py-1.5"
          value={filters.search} onChange={e => setFilters({...filters, search: e.target.value})} 
        />
        <select className="bg-slate-800 border border-slate-700 rounded px-2 py-1.5"
          value={filters.gender} onChange={e => setFilters({...filters, gender: e.target.value})}>
          <option value="">All Genders</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
        </select>
        <select className="bg-slate-800 border border-slate-700 rounded px-2 py-1.5"
          value={filters.smallGroup} onChange={e => setFilters({...filters, smallGroup: e.target.value})}>
          <option value="">All Small Groups</option>
          {groups.map(g => <option key={g._id} value={g._id}>{g.name}</option>)}
        </select>
        <input 
          placeholder="Filter Ministry..." 
          className="bg-slate-800 border border-slate-700 rounded px-2 py-1.5"
          value={filters.ministry} onChange={e => setFilters({...filters, ministry: e.target.value})} 
        />
      </div>

      {/* Table */}
      {loading ? <div className="text-slate-400">Loading...</div> : (
        <div className="bg-slate-900 rounded border border-slate-800 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-slate-950 text-slate-400">
              <tr>
                <th className="p-3">Photo</th>
                <th className="p-3">Name</th>
                <th className="p-3">Age/DOB</th>
                <th className="p-3">Ministry</th>
                <th className="p-3">Group</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {members.map((m) => (
                <tr key={m._id} className="hover:bg-slate-800/50 cursor-pointer" onClick={() => navigate(`/members/${m._id}`)}>
                  <td className="p-3">
                    <img src={m.profilePhotoUrl || 'https://via.placeholder.com/30'} className="w-8 h-8 rounded-full object-cover bg-slate-800" />
                  </td>
                  <td className="p-3 font-medium text-indigo-300">{m.fullName}</td>
                  <td className="p-3">
                    {m.dateOfBirth ? new Date(m.dateOfBirth).toLocaleDateString() : '-'}
                  </td>
                  <td className="p-3">{m.ministry || '-'}</td>
                  <td className="p-3">{m.smallGroup?.name || '-'}</td>
                  <td className="p-3 text-right gap-2">
                    <button onClick={(e) => handleEdit(e, m)} className="text-sky-400 hover:text-white mr-3">Edit</button>
                    <button onClick={(e) => handleDelete(e, m._id)} className="text-red-400 hover:text-white">Delete</button>
                  </td>
                </tr>
              ))}
              {!members.length && <tr><td colSpan="6" className="p-4 text-center text-slate-500">No members found</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50" onClick={(e) => e.stopPropagation()}>
          <div className="bg-slate-900 border border-slate-700 p-6 rounded-lg w-full max-w-lg relative max-h-[90vh] overflow-y-auto">
            <button onClick={() => setShowModal(false)} className="absolute top-2 right-3 text-slate-400 hover:text-white">✕</button>
            <h2 className="text-lg font-bold mb-4 text-white">{editingId ? 'Edit Member' : 'Add New Member'}</h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
              <div className="col-span-2"><label className="block text-slate-400 mb-1">Full Name</label><input name="fullName" value={formData.fullName} onChange={handleInputChange} className="w-full bg-slate-800 border border-slate-700 rounded p-2" required /></div>
              <div><label className="block text-slate-400 mb-1">Gender</label><select name="gender" value={formData.gender} onChange={handleInputChange} className="w-full bg-slate-800 border border-slate-700 rounded p-2"><option value="male">Male</option><option value="female">Female</option><option value="other">Other</option></select></div>
              <div><label className="block text-slate-400 mb-1">Date of Birth</label><input type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleInputChange} className="w-full bg-slate-800 border border-slate-700 rounded p-2" /></div>
              <div><label className="block text-slate-400 mb-1">Phone</label><input name="phone" value={formData.phone} onChange={handleInputChange} className="w-full bg-slate-800 border border-slate-700 rounded p-2" /></div>
              <div><label className="block text-slate-400 mb-1">Ministry</label><input name="ministry" value={formData.ministry} onChange={handleInputChange} className="w-full bg-slate-800 border border-slate-700 rounded p-2" placeholder="e.g. Worship" /></div>
              <div className="col-span-2"><label className="block text-slate-400 mb-1">Address</label><input name="address" value={formData.address} onChange={handleInputChange} className="w-full bg-slate-800 border border-slate-700 rounded p-2" /></div>
              <div className="col-span-2"><label className="block text-slate-400 mb-1">Profile Photo</label><input type="file" onChange={handleFileChange} className="w-full text-slate-400" /></div>
              <button type="submit" className="col-span-2 bg-indigo-600 hover:bg-indigo-500 py-2 rounded font-bold text-white mt-2">{editingId ? 'Update Member' : 'Save Member'}</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}