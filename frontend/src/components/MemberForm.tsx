import { useState, useEffect } from 'react';
import { memberService } from '../services/member.service';
import type { Member } from '../services/member.service';
import toast from 'react-hot-toast';
import { X } from 'lucide-react';

interface MemberFormProps {
  member: Member | null;
  onClose: () => void;
}

const MINISTRY_OPTIONS = ['PRAYER', 'MEN', 'WOMEN', 'YOUTH', 'CHILDREN', 'WORSHIP', 'OTHER'];

export default function MemberForm({ member, onClose }: MemberFormProps) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phonePrimary: '',
    phoneAlternate: '',
    gender: 'MALE',
    dateOfBirth: '',
    address: '',
    maritalStatus: 'SINGLE',
    membershipStatus: 'VISITOR',
    involvedMinistries: [] as string[],
    baptismStatus: 'NOT_BAPTIZED',
    baptismDate: '',
    joinDate: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (member) {
      setFormData({
        firstName: member.firstName || '',
        lastName: member.lastName || '',
        email: member.email || '',
        phonePrimary: member.phonePrimary || '',
        phoneAlternate: (member as any).phoneAlternate || '',
        gender: member.gender || 'MALE',
        dateOfBirth: member.dateOfBirth ? member.dateOfBirth.split('T')[0] : '',
        address: member.address || '',
        maritalStatus: member.maritalStatus || 'SINGLE',
        membershipStatus: member.membershipStatus || 'VISITOR',
        involvedMinistries: (member as any).involvedMinistries || [],
        baptismStatus: member.baptismStatus || 'NOT_BAPTIZED',
        baptismDate: (member as any).baptismDate ? (member as any).baptismDate.split('T')[0] : '',
        joinDate: (member as any).joinDate ? (member as any).joinDate.split('T')[0] : '',
        emergencyContactName: (member as any).emergencyContactName || '',
        emergencyContactPhone: (member as any).emergencyContactPhone || '',
      });
    }
  }, [member]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Clean up empty strings to null
      const cleanedData: any = Object.fromEntries(
        Object.entries(formData).map(([key, value]) => [key, value === '' ? null : value])
      );

      // Reset ministries if they aren't marked as a leader anymore
      if (cleanedData.membershipStatus !== 'LEADER') {
        cleanedData.involvedMinistries = [];
      }

      if (member) {
        await memberService.update(member.id, cleanedData);
        toast.success('Member updated successfully');
      } else {
        await memberService.create(cleanedData);
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

  const handleMinistryToggle = (ministry: string) => {
    setFormData(prev => ({
      ...prev,
      involvedMinistries: prev.involvedMinistries.includes(ministry)
        ? prev.involvedMinistries.filter(m => m !== ministry)
        : [...prev.involvedMinistries, ministry]
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-in">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden shadow-hard animate-scale-up">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-secondary-900">
              {member ? 'Edit Member' : 'Add New Member'}
            </h2>
            <button onClick={onClose} className="text-secondary-400 hover:text-secondary-600">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[70vh]">
          {/* Personal Info Section */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-secondary-900 mb-4 pb-2 border-b border-gray-200">
              Personal Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

              <div className="md:col-span-2">
                <label className="label">Address</label>
                <textarea
                  name="address"
                  className="input"
                  rows={2}
                  value={formData.address}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          {/* Contact Info Section */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-secondary-900 mb-4 pb-2 border-b border-gray-200">
              Contact Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <label className="label">Primary Phone</label>
                <input
                  type="tel"
                  name="phonePrimary"
                  className="input"
                  value={formData.phonePrimary}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label className="label">Alternate Phone</label>
                <input
                  type="tel"
                  name="phoneAlternate"
                  className="input"
                  value={formData.phoneAlternate}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          {/* Church Info Section */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-secondary-900 mb-4 pb-2 border-b border-gray-200">
              Church Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className={formData.membershipStatus === 'LEADER' ? "md:col-span-2" : ""}>
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

                {formData.membershipStatus === 'LEADER' && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <label className="label mb-3">Involved Ministries (Select all that apply) *</label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                      {MINISTRY_OPTIONS.map(ministry => (
                        <label key={ministry} className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.involvedMinistries.includes(ministry)}
                            onChange={() => handleMinistryToggle(ministry)}
                            className="rounded border-gray-300 text-primary-600 focus:ring-primary-500 w-4 h-4"
                          />
                          <span className="text-sm font-medium text-gray-700 capitalize">
                            {ministry.toLowerCase()}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="label">Join Date</label>
                <input
                  type="date"
                  name="joinDate"
                  className="input"
                  value={formData.joinDate}
                  onChange={handleChange}
                />
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

              {formData.baptismStatus === 'BAPTIZED' && (
                <div>
                  <label className="label">Baptism Date</label>
                  <input
                    type="date"
                    name="baptismDate"
                    className="input"
                    value={formData.baptismDate}
                    onChange={handleChange}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Emergency Contact Section */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-secondary-900 mb-4 pb-2 border-b border-gray-200">
              Emergency Contact
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">Contact Name</label>
                <input
                  type="text"
                  name="emergencyContactName"
                  className="input"
                  value={formData.emergencyContactName}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label className="label">Contact Phone</label>
                <input
                  type="tel"
                  name="emergencyContactPhone"
                  className="input"
                  value={formData.emergencyContactPhone}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
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
  );
}