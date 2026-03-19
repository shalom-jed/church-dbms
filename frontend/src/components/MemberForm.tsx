import { useState, useEffect } from 'react';
import { memberService } from '../services/member.service';
import type { Member } from '../services/member.service';
import toast from 'react-hot-toast';

interface MemberFormProps {
  member: Member | null;
  onClose: () => void;
}

export default function MemberForm({ member, onClose }: MemberFormProps) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phonePrimary: '',
    gender: 'MALE',
    dateOfBirth: '',
    address: '',
    maritalStatus: 'SINGLE',
    membershipStatus: 'VISITOR',
    baptismStatus: 'NOT_BAPTIZED',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (member) {
      setFormData({
        firstName: member.firstName,
        lastName: member.lastName,
        email: member.email || '',
        phonePrimary: member.phonePrimary || '',
        gender: member.gender,
        dateOfBirth: member.dateOfBirth || '',
        address: member.address || '',
        maritalStatus: member.maritalStatus || 'SINGLE',
        membershipStatus: member.membershipStatus,
        baptismStatus: member.baptismStatus || 'NOT_BAPTIZED',
      });
    }
  }, [member]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (member) {
        await memberService.update(member.id, formData);
        toast.success('Member updated successfully');
      } else {
        await memberService.create(formData);
        toast.success('Member created successfully');
      }
      onClose();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to save member');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">
              {member ? 'Edit Member' : 'Add New Member'}
            </h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">First Name *</label>
                <input
                  type="text"
                  name="firstName"
                  className="input"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <label className="label">Last Name *</label>
                <input
                  type="text"
                  name="lastName"
                  className="input"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Email</label>
                <input
                  type="email"
                  name="email"
                  className="input"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label className="label">Phone</label>
                <input
                  type="tel"
                  name="phonePrimary"
                  className="input"
                  value={formData.phonePrimary}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Gender *</label>
                <select
                  name="gender"
                  className="input"
                  value={formData.gender}
                  onChange={handleChange}
                  required
                >
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                </select>
              </div>

              <div>
                <label className="label">Date of Birth</label>
                <input
                  type="date"
                  name="dateOfBirth"
                  className="input"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div>
              <label className="label">Address</label>
              <textarea
                name="address"
                className="input"
                rows={3}
                value={formData.address}
                onChange={handleChange}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Marital Status</label>
                <select
                  name="maritalStatus"
                  className="input"
                  value={formData.maritalStatus}
                  onChange={handleChange}
                >
                  <option value="SINGLE">Single</option>
                  <option value="MARRIED">Married</option>
                  <option value="WIDOWED">Widowed</option>
                  <option value="DIVORCED">Divorced</option>
                </select>
              </div>

              <div>
                <label className="label">Membership Status</label>
                <select
                  name="membershipStatus"
                  className="input"
                  value={formData.membershipStatus}
                  onChange={handleChange}
                >
                  <option value="VISITOR">Visitor</option>
                  <option value="NEW_BELIEVER">New Believer</option>
                  <option value="MEMBER">Member</option>
                  <option value="LEADER">Leader</option>
                  <option value="INACTIVE">Inactive</option>
                </select>
              </div>
            </div>

            <div>
              <label className="label">Baptism Status</label>
              <select
                name="baptismStatus"
                className="input"
                value={formData.baptismStatus}
                onChange={handleChange}
              >
                <option value="NOT_BAPTIZED">Not Baptized</option>
                <option value="BAPTIZED">Baptized</option>
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
              <button
                type="submit"
                className="btn-primary"
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Save Member'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}