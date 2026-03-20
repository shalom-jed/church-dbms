import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { departmentService } from '../services/department.service';
import type { Department } from '../services/department.service';
import { memberService } from '../services/member.service';
import type { Member } from '../services/member.service';
import toast from 'react-hot-toast';
import { Users, Plus, Edit, Trash2, Building2, TrendingUp, Eye, Calendar } from 'lucide-react';

export default function Departments() {
  const navigate = useNavigate();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingDept, setEditingDept] = useState<Department | null>(null);
  const [formData, setFormData] = useState({
    departmentName: '',
    description: '',
    meetingSchedule: '',
    status: 'ACTIVE',
    headId: '',
  });

  useEffect(() => {
    loadDepartments();
    loadMembers();
  }, []);

  const loadDepartments = async () => {
    try {
      setLoading(true);
      const data = await departmentService.getAll();
      setDepartments(data);
    } catch (error) {
      toast.error('Failed to load departments');
    } finally {
      setLoading(false);
    }
  };

  const loadMembers = async () => {
    try {
      const data = await memberService.getAll();
      setMembers(data);
    } catch (error) {
      console.error('Failed to load members');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingDept) {
        await departmentService.update(editingDept.id, formData);
        toast.success('Department updated successfully');
      } else {
        await departmentService.create(formData);
        toast.success('Department created successfully');
      }
      setShowForm(false);
      resetForm();
      loadDepartments();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to save department');
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this department?')) return;

    try {
      await departmentService.delete(id);
      toast.success('Department deleted successfully');
      loadDepartments();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to delete department');
    }
  };

  const handleEdit = (dept: Department, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingDept(dept);
    setFormData({
      departmentName: dept.departmentName,
      description: dept.description || '',
      meetingSchedule: dept.meetingSchedule || '',
      status: dept.status,
      headId: dept.headId || '',
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      departmentName: '',
      description: '',
      meetingSchedule: '',
      status: 'ACTIVE',
      headId: '',
    });
    setEditingDept(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-secondary-900">Departments</h1>
          <p className="text-secondary-500 mt-1">{departments.length} departments</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary flex items-center space-x-2">
          <Plus className="w-5 h-5" />
          <span>Add Department</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">Total Departments</p>
              <p className="text-3xl font-bold text-blue-900 mt-1">{departments.length}</p>
            </div>
            <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
              <Building2 className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="card bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">Active Departments</p>
              <p className="text-3xl font-bold text-green-900 mt-1">
                {departments.filter(d => d.status === 'ACTIVE').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="card bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-600">Total Members</p>
              <p className="text-3xl font-bold text-purple-900 mt-1">
                {departments.reduce((sum, d) => sum + (d._count?.members || 0), 0)}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Departments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {departments.map((dept) => (
          <div
            key={dept.id}
            className="card hover-lift border-l-4 border-primary-500 cursor-pointer"
            onClick={() => navigate(`/departments/${dept.id}`)}
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-bold text-secondary-900 mb-2">{dept.departmentName}</h3>
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                    dept.status === 'ACTIVE'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {dept.status}
                </span>
              </div>
            </div>

            {dept.description && (
              <p className="text-sm text-secondary-600 mb-3 line-clamp-2">{dept.description}</p>
            )}

            <div className="space-y-3 mb-4">
              {dept.head && (
                <div className="flex items-center text-sm text-secondary-600 bg-gray-50 p-2 rounded-lg">
                  <Users className="w-4 h-4 mr-2 text-primary-500 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-secondary-500">Head</p>
                    <p className="font-medium text-secondary-900">
                      {dept.head.firstName} {dept.head.lastName}
                    </p>
                  </div>
                </div>
              )}

              {dept.meetingSchedule && (
                <div className="flex items-center text-sm text-secondary-600">
                  <Calendar className="w-4 h-4 mr-2 text-primary-500" />
                  <span>{dept.meetingSchedule}</span>
                </div>
              )}

              <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                <span className="text-sm text-secondary-600">Members</span>
                <span className="text-lg font-bold text-primary-600">{dept._count?.members || 0}</span>
              </div>
            </div>

            <div className="flex space-x-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/departments/${dept.id}`);
                }}
                className="flex-1 btn-primary text-sm flex items-center justify-center space-x-2"
              >
                <Eye className="w-4 h-4" />
                <span>View Details</span>
              </button>
              <button
                onClick={(e) => handleEdit(dept, e)}
                className="px-3 py-2 btn-secondary text-sm"
              >
                <Edit className="w-4 h-4" />
              </button>
              <button
                onClick={(e) => handleDelete(dept.id, e)}
                className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-xl transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {departments.length === 0 && (
        <div className="card text-center py-12">
          <Building2 className="w-16 h-16 mx-auto text-secondary-300 mb-4" />
          <p className="text-secondary-500">No departments found</p>
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-in">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-hard animate-scale-up">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-secondary-900">
                  {editingDept ? 'Edit Department' : 'Add New Department'}
                </h2>
                <button
                  onClick={() => {
                    setShowForm(false);
                    resetForm();
                  }}
                  className="text-secondary-400 hover:text-secondary-600 text-2xl"
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="label">Department Name *</label>
                  <input
                    type="text"
                    className="input"
                    value={formData.departmentName}
                    onChange={(e) =>
                      setFormData({ ...formData, departmentName: e.target.value })
                    }
                    required
                  />
                </div>

                <div>
                  <label className="label">Description</label>
                  <textarea
                    className="input"
                    rows={3}
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                  />
                </div>

                <div>
                  <label className="label">Department Head</label>
                  <select
                    className="input"
                    value={formData.headId}
                    onChange={(e) => setFormData({ ...formData, headId: e.target.value })}
                  >
                    <option value="">Select a head</option>
                    {members.map((member) => (
                      <option key={member.id} value={member.id}>
                        {member.firstName} {member.lastName}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="label">Meeting Schedule</label>
                  <input
                    type="text"
                    className="input"
                    placeholder="e.g., Every Sunday after service"
                    value={formData.meetingSchedule}
                    onChange={(e) =>
                      setFormData({ ...formData, meetingSchedule: e.target.value })
                    }
                  />
                </div>

                <div>
                  <label className="label">Status</label>
                  <select
                    className="input"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  >
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                  </select>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      resetForm();
                    }}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary">
                    Save Department
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}