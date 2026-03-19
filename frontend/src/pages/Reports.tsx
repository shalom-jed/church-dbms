import { useState, useEffect } from 'react';
import { reportService } from '../services/report.service';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import toast from 'react-hot-toast';
import { exportAttendanceToPDF, exportAttendanceToExcel } from '../utils/exportUtils';
import { Download, FileText, Table } from 'lucide-react';

export default function Reports() {
  const [membershipReport, setMembershipReport] = useState<any>(null);
  const [attendanceReport, setAttendanceReport] = useState<any>(null);
  const [absenteeReport, setAbsenteeReport] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setMonth(new Date().getMonth() - 3)).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      setLoading(true);
      const [membership, attendance, absentees] = await Promise.all([
        reportService.getMembershipReport(),
        reportService.getAttendanceReport(dateRange.startDate, dateRange.endDate),
        reportService.getAbsenteeReport(dateRange.startDate, dateRange.endDate),
      ]);
      setMembershipReport(membership);
      setAttendanceReport(attendance);
      setAbsenteeReport(absentees);
    } catch (error) {
      toast.error('Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = async () => {
    try {
      const [attendance, absentees] = await Promise.all([
        reportService.getAttendanceReport(dateRange.startDate, dateRange.endDate),
        reportService.getAbsenteeReport(dateRange.startDate, dateRange.endDate),
      ]);
      setAttendanceReport(attendance);
      setAbsenteeReport(absentees);
    } catch (error) {
       toast.error('Failed to refresh data for new dates');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const COLORS = ['#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  // Transform membership data
  const statusData = membershipReport?.byStatus?.map((item: any) => ({
    name: item.membershipStatus,
    value: item._count,
  })) || [];

  const genderData = membershipReport?.byGender?.map((item: any) => ({
    name: item.gender,
    value: item._count,
  })) || [];

  const baptismData = membershipReport?.byBaptism?.map((item: any) => ({
    name: item.baptismStatus,
    value: item._count,
  })) || [];

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Reports & Analytics</h1>

      {/* Membership Reports */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Membership Statistics</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* By Status */}
          <div className="card">
            <h3 className="text-lg font-semibold mb-4 text-center">By Membership Status</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusData.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* By Gender */}
          <div className="card">
            <h3 className="text-lg font-semibold mb-4 text-center">By Gender</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={genderData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {genderData.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* By Baptism */}
          <div className="card">
            <h3 className="text-lg font-semibold mb-4 text-center">By Baptism Status</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={baptismData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {baptismData.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Attendance & Absentees Section */}
      <div className="card mb-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <h2 className="text-2xl font-semibold mb-4 md:mb-0">Attendance & Missing Members</h2>
          
          <div className="flex flex-wrap items-center space-x-2 gap-y-2">
            <input
              type="date"
              className="input w-auto"
              value={dateRange.startDate}
              onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
            />
            <span className="text-gray-500 font-medium">to</span>
            <input
              type="date"
              className="input w-auto"
              value={dateRange.endDate}
              onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
            />
            <button onClick={handleDateChange} className="btn-primary">
              Apply Filter
            </button>
          </div>
        </div>

        {/* Top level stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">Total Services in Range</p>
            <p className="text-2xl font-bold text-blue-600">
              {attendanceReport?.totalServices || 0}
            </p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">Average Attendance</p>
            <p className="text-2xl font-bold text-green-600">
              {attendanceReport?.averageAttendance || 0}
            </p>
          </div>
          <div className="bg-red-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">Total Absentees Identified</p>
            <p className="text-2xl font-bold text-red-600">
              {absenteeReport?.length || 0}
            </p>
          </div>
        </div>

        {/* Chart View */}
        {attendanceReport?.services?.length > 0 && (
          <div className="mb-10">
            <h3 className="text-lg font-semibold mb-4 text-gray-700">Service Attendance Trends</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={attendanceReport.services}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="serviceDate" 
                  tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                />
                <YAxis />
                <Tooltip labelFormatter={(date) => new Date(date).toLocaleDateString()} />
                <Legend />
                <Bar dataKey="totalAttendance" fill="#0ea5e9" name="Total" />
                <Bar dataKey="membersCount" fill="#10b981" name="Members" />
                <Bar dataKey="visitorsCount" fill="#f59e0b" name="Visitors" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Absentee Report Table View */}
        <div className="mt-8 border-t border-gray-200 pt-6">
          <h3 className="text-xl font-semibold mb-2 text-red-600">Absentee Report</h3>
          <p className="text-sm text-gray-500 mb-4">
            Active members and leaders who have attended <strong>zero</strong> Sunday services AND <strong>zero</strong> small groups between {new Date(dateRange.startDate).toLocaleDateString()} and {new Date(dateRange.endDate).toLocaleDateString()}.
          </p>

          {absenteeReport?.length > 0 ? (
            <div className="overflow-x-auto border border-gray-200 rounded-lg">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="p-4 font-semibold text-gray-700">Name</th>
                    <th className="p-4 font-semibold text-gray-700">Status</th>
                    <th className="p-4 font-semibold text-gray-700">Primary Phone</th>
                    <th className="p-4 font-semibold text-gray-700">Email</th>
                  </tr>
                </thead>
                <tbody>
                  {absenteeReport.map((member) => (
                    <tr key={member.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="p-4 font-medium text-gray-900">{member.firstName} {member.lastName}</td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          member.membershipStatus === 'LEADER' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                        }`}>
                          {member.membershipStatus}
                        </span>
                      </td>
                      <td className="p-4 text-gray-600">{member.phonePrimary || '-'}</td>
                      <td className="p-4 text-gray-600">{member.email || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
             <div className="bg-green-50 p-6 rounded-lg text-center border border-green-200">
               <p className="text-green-800 font-medium">Great news! No missing members found in this date range.</p>
             </div>
          )}
        </div>
      </div>

      {/* Export Buttons */}
      <div className="card mt-6">
        <h3 className="text-lg font-semibold mb-4">Export Reports</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button 
            className="btn-primary flex items-center justify-center space-x-2"
            onClick={() => exportAttendanceToPDF(attendanceReport?.services || [])}
          >
            <FileText className="w-5 h-5" />
            <span>Export Attendance to PDF</span>
          </button>
          <button 
            className="btn-secondary flex items-center justify-center space-x-2"
            onClick={() => exportAttendanceToExcel(attendanceReport?.services || [])}
          >
            <Table className="w-5 h-5" />
            <span>Export Attendance to Excel</span>
          </button>
        </div>
      </div>
    </div>
  );
}