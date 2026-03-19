import { useState, useEffect } from 'react';
import { smallGroupService } from '../services/smallGroup.service';
import type { SmallGroup } from '../services/smallGroup.service';
import { memberService } from '../services/member.service';
import type { Member } from '../services/member.service';
import toast from 'react-hot-toast';

interface SmallGroupFormProps {
  group: SmallGroup | null;
  onClose: () => void;
}

export default function SmallGroupForm({ group, onClose }: SmallGroupFormProps) {
  const [formData, setFormData] = useState({
    groupName: '',
    meetingDay: '',
    meetingTime: '',
    meetingLocation: '',
    status: 'ACTIVE',
    leaderId: '',
  });
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadMembers();
    if (group) {
      setFormData({
        groupName: group.groupName,
        meetingDay: group.meetingDay || '',
        meetingTime: group.meetingTime || '',
        meetingLocation: group.meetingLocation || '',
        status: group.status,
        leaderId: group.leaderId || '',
      });
    }
  }, [group]);

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
    setLoading(true);

    try {
      if (group) {
        await smallGroupService.update(group.id, formData);
        toast.success('Group updated successfully');
      } else {
        await smallGroupService.create(formData);
        toast.success('Group created successfully');
      }
      onClose();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to save group');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">
              {group ? 'Edit Small Group' : 'Add New Small Group'}
            </h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Group Name *</label>
              <input
                type="text"
                name="groupName"
                className="input"
                value={formData.groupName}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label className="label">Leader</label>
              <select
                name="leaderId"
                className="input"
                value={formData.leaderId}
                onChange={handleChange}
              >
                <option value="">Select a leader</option>
                {members.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.firstName} {member.lastName}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Meeting Day</label>
                <input
                  type="text"
                  name="meetingDay"
                  className="input"
                  value={formData.meetingDay}
                  onChange={handleChange}
                  placeholder="e.g., Wednesday"
                />
              </div>

              <div>
                <label className="label">Meeting Time</label>
                <input
                  type="time"
                  name="meetingTime"
                  className="input"
                  value={formData.meetingTime}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div>
              <label className="label">Meeting Location</label>
              <input
                type="text"
                name="meetingLocation"
                className="input"
                value={formData.meetingLocation}
                onChange={handleChange}
                placeholder="e.g., 123 Main St"
              />
            </div>

            <div>
              <label className="label">Status</label>
              <select
                name="status"
                className="input"
                value={formData.status}
                onChange={handleChange}
              >
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="btn-secondary"
                disabled={loading}
              >
                Cancel
              </button>
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? 'Saving...' : 'Save Group'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}