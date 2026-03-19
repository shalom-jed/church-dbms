import { useState, useEffect } from 'react';
import { attendanceService } from '../services/attendance.service';
import { memberService } from '../services/member.service';
import type { Member } from '../services/member.service';
import toast from 'react-hot-toast';
import { X, Users, Calendar } from 'lucide-react'; // Added icons

export default function Attendance() {
  const [services, setServices] = useState<any[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedService, setSelectedService] = useState<any>(null); // New state for viewing history
  const [serviceDate, setServiceDate] = useState('');
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {services.map((service) => (
          <div 
            key={service.id} 
            className="card cursor-pointer hover:shadow-md transition-shadow hover:border-primary-200 border-2 border-transparent"
            onClick={() => setSelectedService(service)}
          >
            <div className="flex items-center space-x-3 mb-3">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                <Calendar className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-secondary-900">
                  {new Date(service.serviceDate).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </h3>
              </div>
            </div>
            
            <div className="flex justify-between items-center mt-4 p-3 bg-gray-50 rounded-lg">
              <div className="text-center">
                <p className="text-sm text-gray-500 font-medium">Total</p>
                <p className="text-xl font-bold text-blue-600">{service.totalAttendance}</p>
              </div>
              <div className="w-px h-8 bg-gray-200"></div>
              <div className="text-center">
                <p className="text-sm text-gray-500 font-medium">Members</p>
                <p className="text-xl font-bold text-green-600">{service.membersCount}</p>
              </div>
              <div className="w-px h-8 bg-gray-200"></div>
              <div className="text-center">
                <p className="text-sm text-gray-500 font-medium">Visitors</p>
                <p className="text-xl font-bold text-purple-600">{service.visitorsCount}</p>
              </div>
            </div>
          </div>
        ))}

        {services.length === 0 && (
          <div className="col-span-full text-center py-12 text-gray-500">
            No attendance records found
          </div>
        )}
      </div>

      {/* View Attendance Details Modal */}
      {selectedService && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-in">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-hard animate-scale-up">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-secondary-900">Service Details</h2>
                <p className="text-secondary-500">
                  {new Date(selectedService.serviceDate).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </div>
              <button
                onClick={() => setSelectedService(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 bg-gray-50">
              <h3 className="font-semibold text-secondary-900 mb-3 flex items-center">
                <Users className="w-5 h-5 mr-2 text-primary-500" /> 
                Attendees ({selectedService.attendanceRecords?.length || 0})
              </h3>
              
              <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
                {selectedService.attendanceRecords?.map((record: any) => (
                  <div key={record.id} className="p-4 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-primary-100 to-primary-200 rounded-lg flex items-center justify-center text-primary-700 font-bold">
                        {record.member?.firstName?.[0]}{record.member?.lastName?.[0]}
                      </div>
                      <div>
                        <p className="font-medium text-secondary-900">
                          {record.member?.firstName} {record.member?.lastName}
                        </p>
                        <p className="text-xs text-secondary-500">
                          {record.member?.membershipStatus || 'Visitor'}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
                
                {(!selectedService.attendanceRecords || selectedService.attendanceRecords.length === 0) && (
                  <div className="p-8 text-center text-gray-500">
                    No attendees recorded for this service.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Record Attendance Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-hard animate-scale-up">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Record Sunday Attendance</h2>
                <button
                  onClick={() => setShowForm(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-6 h-6" />
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
                  <div className="border border-gray-200 rounded-xl p-4 max-h-64 overflow-y-auto space-y-2 bg-gray-50">
                    {members.map((member) => (
                      <label
                        key={member.id}
                        className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-colors ${
                          selectedMembers.includes(member.id) ? 'bg-primary-50 border border-primary-200' : 'bg-white border border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={selectedMembers.includes(member.id)}
                          onChange={() => toggleMember(member.id)}
                          className="w-5 h-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        />
                        <div className="flex flex-col">
                          <span className="font-medium text-secondary-900">
                            {member.firstName} {member.lastName}
                          </span>
                          <span className="text-xs text-secondary-500">{member.membershipStatus}</span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
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