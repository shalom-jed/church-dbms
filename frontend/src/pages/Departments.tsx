import { useState, useEffect } from 'react';
import { departmentService } from '../services/department.service';
import type { Department } from '../services/department.service';
import { memberService } from '../services/member.service';
import type { Member } from '../services/member.service';
import toast from 'react-hot-toast';

export default function Departments() {
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

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this department?')) return;

    try {
      await departmentService.delete(id);
      toast.success('Department deleted successfully');
      loadDepartments();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to delete department');
    }
  };

  const handleEdit = (dept: Department) => {
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
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Departments</h1>
        <button onClick={() => setShowForm(true)} className="btn-primary">
          + Add Department
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {departments.map((dept) => (
          <div key={dept.id} className="card">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-semibold">{dept.departmentName}</h3>
              <span
                className={`px-2 py-1 text-xs rounded ${
                  dept.status === 'ACTIVE'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                {dept.status}
              </span>
            </div>

            {dept.description && (
              <p className="text-sm text-gray-600 mb-4">{dept.description}</p>
            )}

            <div className="space-y-2 text-sm text-gray-600 mb-4">
              {dept.head && (
                <p>
                  <strong>Head:</strong> {dept.head.firstName} {dept.head.lastName}
                </p>
              )}
              {dept.meetingSchedule && (
                <p>
                  <strong>Meetings:</strong> {dept.meetingSchedule}
                </p>
              )}
              <p>
                <strong>Members:</strong> {dept._count?.members || 0}
              </p>
            </div>

            <div className="flex space-x-2">
              <button onClick={() => handleEdit(dept)} className="btn-secondary text-sm flex-1">
                Edit
              </button>
              <button
                onClick={() => handleDelete(dept.id)}
                className="text-red-600 hover:text-red-900 text-sm"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {departments.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No departments found</p>
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">
                  {editingDept ? 'Edit Department' : 'Add New Department'}
                </h2>
                <button
                  onClick={() => {
                    setShowForm(false);
                    resetForm();
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
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