import { useState, useEffect } from 'react';
import { attendanceService } from '../services/attendance.service';
import { memberService } from '../services/member.service';
import type { Member } from '../services/member.service';
import toast from 'react-hot-toast';

export default function Attendance() {
  const [services, setServices] = useState<any[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [serviceDate, setServiceDate] = useState('');
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadServices();
    loadMembers();
  }, []);

  const loadServices = async () => {
    try {
      const data = await attendanceService.getSundayServices();
      setServices(data);
    } catch (error) {
      console.error('Failed to load services');
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
    setLoading(true);

    try {
      // Create service
      const service = await attendanceService.createSundayService({
        serviceDate,
      });

      // Record attendance
      const attendees = selectedMembers.map((memberId) => ({
        memberId,
      }));

      await attendanceService.recordSundayAttendance(service.id, attendees);

      toast.success('Attendance recorded successfully');
      setShowForm(false);
      setServiceDate('');
      setSelectedMembers([]);
      setTotalCount(0);
      loadServices();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to record attendance');
    } finally {
      setLoading(false);
    }
  };

  const toggleMember = (memberId: string) => {
    setSelectedMembers((prev) =>
      prev.includes(memberId)
        ? prev.filter((id) => id !== memberId)
        : [...prev, memberId]
    );
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Sunday Service Attendance</h1>
        <button onClick={() => setShowForm(true)} className="btn-primary">
          + Record Attendance
        </button>
      </div>

      {/* Recent Services */}
      <div className="space-y-4">
        {services.map((service) => (
          <div key={service.id} className="card">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-semibold">
                  {new Date(service.serviceDate).toLocaleDateString()}
                </h3>
                <p className="text-sm text-gray-600">
                  Total: {service.totalAttendance} | Members: {service.membersCount} |
                  Visitors: {service.visitorsCount}
                </p>
              </div>
            </div>
          </div>
        ))}

        {services.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No attendance records found
          </div>
        )}
      </div>

      {/* Attendance Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Record Sunday Attendance</h2>
                <button
                  onClick={() => setShowForm(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="label">Service Date *</label>
                  <input
                    type="date"
                    className="input"
                    value={serviceDate}
                    onChange={(e) => setServiceDate(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="label">
                    Select Members Present ({selectedMembers.length} selected)
                  </label>
                  <div className="border rounded p-4 max-h-64 overflow-y-auto space-y-2">
                    {members.map((member) => (
                      <label
                        key={member.id}
                        className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded"
                      >
                        <input
                          type="checkbox"
                          checked={selectedMembers.includes(member.id)}
                          onChange={() => toggleMember(member.id)}
                          className="rounded"
                        />
                        <span>
                          {member.firstName} {member.lastName}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="btn-secondary"
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary" disabled={loading}>
                    {loading ? 'Saving...' : 'Save Attendance'}
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