import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getStudentAttendance } from '../../utils/supabaseClient';
import { Bell, Calendar, FileText, Settings, Search, Download, BarChart2, Clock, Award, User, Menu, X } from 'lucide-react';

// Reusing existing components
import WalletConnect from '../../components/WalletConnect';
import AttendanceForm from '../../components/AttendanceForm';
import BlockchainAttendance from '../../components/BlockchainAttendance';

const StudentDashboard = () => {
  const { user, profile } = useAuth();
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [dateRange, setDateRange] = useState({ start: '01 Dec', end: '31 Dec' });
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Get current date for calendar
  const currentDate = new Date();
  const currentMonth = currentDate.toLocaleString('default', { month: 'long' });
  const currentYear = currentDate.getFullYear();
  
  // Fetch attendance records
  useEffect(() => {
    const fetchAttendance = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
        setError('');
        
        const { data, error } = await getStudentAttendance(user.id);
        
        if (error) {
          throw new Error(error.message);
        }
        
        setAttendanceRecords(data || []);
      } catch (error) {
        console.error('Error fetching attendance:', error);
        setError('Failed to load attendance records');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchAttendance();
  }, [user]);

  // Handle when new attendance is marked
  const handleAttendanceMarked = (newAttendance) => {
    setAttendanceRecords([newAttendance, ...attendanceRecords]);
  };

  // Monthly attendance stats (mock data based on records)
  const getMonthlyStats = () => {
    const total = attendanceRecords.length;
    return {
      onTime: Math.round((attendanceRecords.filter(r => !r.is_late).length / total) * 100) || 0,
      late: Math.round((attendanceRecords.filter(r => r.is_late).length / total) * 100) || 0,
      absent: 100 - (Math.round((attendanceRecords.length / 30) * 100) || 0)
    };
  };

  const stats = getMonthlyStats();

  // Calculate employment status (mock data)
  const employmentStats = {
    contract: { count: 2, percentage: 15 },
    fullTime: { count: 8, percentage: 60 },
    partTime: { count: 3, percentage: 25 }
  };

  // Mock upcoming schedule
  const upcomingEvents = [
    { title: "Course Assignment", time: "10:00 AM", icon: "📚" },
    { title: "Group Project Meeting", time: "01:00 PM", icon: "👥" },
    { title: "Academic Counseling", time: "03:00 PM", icon: "🎓" }
  ];

  // Generate month days for calendar
  const generateCalendarDays = () => {
    const days = [];
    for (let i = 12; i <= 18; i++) {
      days.push(i);
    }
    return days;
  };

  // Toggle mobile menu
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <div className="bg-purple-100 min-h-screen">
      {/* Mobile Navigation */}
      <div className="lg:hidden bg-white shadow-sm sticky top-0 z-50">
        <div className="flex justify-between items-center p-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 text-white flex items-center justify-center">
              {profile?.first_name?.charAt(0) || 'S'}
            </div>
            <span className="font-medium">Attendo</span>
          </div>
          <button 
            onClick={toggleMobileMenu}
            className="p-2 rounded-md hover:bg-gray-100"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
        
        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="bg-white border-t p-4 animate-fadeIn">
            <div className="grid grid-cols-3 gap-4">
              <button className="flex flex-col items-center justify-center p-3 rounded-lg hover:bg-purple-50">
                <Calendar size={20} className="text-purple-600 mb-1" />
                <span className="text-xs">Calendar</span>
              </button>
              <button className="flex flex-col items-center justify-center p-3 rounded-lg hover:bg-purple-50">
                <BarChart2 size={20} className="text-purple-600 mb-1" />
                <span className="text-xs">Stats</span>
              </button>
              <button className="flex flex-col items-center justify-center p-3 rounded-lg hover:bg-purple-50">
                <User size={20} className="text-purple-600 mb-1" />
                <span className="text-xs">Profile</span>
              </button>
            </div>
          </div>
        )}
      </div>
      
      <div className="container mx-auto px-4 py-6">
        {/* Main Content */}
        <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
          {/* Left Column - Dashboard and Stats */}
          <div className="w-full lg:w-2/3 space-y-4 lg:space-y-6">
            {/* Welcome Header */}
            <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 border-l-4 border-purple-500">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold">Hi, {profile?.first_name || 'Student'}!!</h1>
                  <p className="text-gray-600 text-sm sm:text-base">Manage your education with Attendo</p>
                </div>
                <button className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white py-2 px-4 sm:px-6 rounded-full flex items-center justify-center space-x-2 text-sm sm:text-base">
                  <FileText size={16} />
                  <span>Create Reports</span>
                </button>
              </div>
            </div>

            {/* Stats Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
              {/* Attendance Chart */}
              <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 border border-gray-100">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center space-x-2">
                    <BarChart2 size={18} className="text-purple-600" />
                    <h2 className="font-semibold text-sm sm:text-base">Attendance Metrics</h2>
                  </div>
                  <div className="text-xs sm:text-sm bg-gray-100 px-2 sm:px-3 py-1 rounded-full text-gray-600">{dateRange.start} - {dateRange.end}</div>
                </div>
                
                {/* Bar Chart Visualization (simplified) */}
                <div className="h-32 sm:h-40 flex items-end justify-between space-x-1 sm:space-x-2 mb-4 sm:mb-6">
                  {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'].map((month, index) => {
                    const height = 20 + Math.random() * 60;
                    return (
                      <div key={month} className="flex flex-col items-center">
                        <div 
                          style={{height: `${height}%`}} 
                          className={`w-4 sm:w-6 rounded-t-md ${index === 6 ? 'bg-gradient-to-t from-blue-500 to-purple-500' : 'bg-gray-200'}`}>
                        </div>
                        <span className="text-xs mt-1 sm:mt-2 text-gray-500">{month}</span>
                      </div>
                    );
                  })}
                </div>
                
                {/* Tooltip-like callout */}
                {attendanceRecords.length > 0 && (
                  <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white p-3 sm:p-4 rounded-lg shadow-lg max-w-xs relative mb-4 sm:mb-6">
                    <div className="absolute bottom-full left-1/4 w-3 h-3 sm:w-4 sm:h-4 transform rotate-45 bg-gray-900"></div>
                    <ul className="space-y-1 sm:space-y-2 text-xs sm:text-sm">
                      <li className="flex items-center">
                        <span className="w-2 h-2 sm:w-3 sm:h-3 bg-blue-500 rounded-full mr-2"></span>
                        <span>Class Hours: 42hr</span>
                      </li>
                      <li className="flex items-center">
                        <span className="w-2 h-2 sm:w-3 sm:h-3 bg-purple-500 rounded-full mr-2"></span>
                        <span>Attendance Rate: {100 - stats.absent}%</span>
                      </li>
                      <li className="flex items-center">
                        <span className="w-2 h-2 sm:w-3 sm:h-3 bg-orange-500 rounded-full mr-2"></span>
                        <span>Punctuality: {stats.onTime}%</span>
                      </li>
                    </ul>
                  </div>
                )}
              </div>

              {/* Attendance Status */}
              <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 border border-gray-100">
                <div className="flex justify-between items-center mb-4 sm:mb-6">
                  <div className="flex items-center space-x-2">
                    <Award size={18} className="text-purple-600" />
                    <h2 className="font-semibold text-sm sm:text-base">Attendance Status</h2>
                  </div>
                  <div className="text-xs sm:text-sm bg-purple-100 px-2 sm:px-3 py-1 rounded-full text-purple-800 font-medium">Total: {attendanceRecords.length || 0}</div>
                </div>
                
                {/* Attendance Type Breakdown */}
                <div className="space-y-3 sm:space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="flex items-center">
                        <span className="w-2 h-2 sm:w-3 sm:h-3 bg-green-500 rounded-full mr-2"></span>
                        <span className="text-xs sm:text-sm">On Time</span>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <div className="mr-2 w-12 sm:w-16 text-right text-xs sm:text-sm">{stats.onTime}%</div>
                      <div className="w-24 sm:w-32 bg-gray-200 rounded-full h-1.5 sm:h-2">
                        <div className="bg-green-500 h-1.5 sm:h-2 rounded-full" style={{ width: `${stats.onTime}%` }}></div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="flex items-center">
                        <span className="w-2 h-2 sm:w-3 sm:h-3 bg-yellow-500 rounded-full mr-2"></span>
                        <span className="text-xs sm:text-sm">Late</span>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <div className="mr-2 w-12 sm:w-16 text-right text-xs sm:text-sm">{stats.late}%</div>
                      <div className="w-24 sm:w-32 bg-gray-200 rounded-full h-1.5 sm:h-2">
                        <div className="bg-yellow-500 h-1.5 sm:h-2 rounded-full" style={{ width: `${stats.late}%` }}></div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="flex items-center">
                        <span className="w-2 h-2 sm:w-3 sm:h-3 bg-red-500 rounded-full mr-2"></span>
                        <span className="text-xs sm:text-sm">Absent</span>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <div className="mr-2 w-12 sm:w-16 text-right text-xs sm:text-sm">{stats.absent}%</div>
                      <div className="w-24 sm:w-32 bg-gray-200 rounded-full h-1.5 sm:h-2">
                        <div className="bg-red-500 h-1.5 sm:h-2 rounded-full" style={{ width: `${stats.absent}%` }}></div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t">
                  <a href="#" className="text-purple-600 text-xs sm:text-sm flex items-center hover:text-purple-800 transition-colors">
                    See All Insights
                    <span className="ml-1">▶</span>
                  </a>
                </div>
              </div>
            </div>

            {/* Attendance Records Table */}
            <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 border border-gray-100">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4 sm:mb-6">
                <div className="flex items-center space-x-2">
                  <Calendar size={18} className="text-purple-600" />
                  <h2 className="font-semibold text-sm sm:text-base">Attendance Records</h2>
                </div>
                <div className="flex flex-wrap gap-2 sm:space-x-2">
                  <button className="text-gray-500 hover:text-gray-700 p-1 bg-gray-100 rounded-md">
                    <Search size={16} />
                  </button>
                  <button className="text-gray-500 hover:text-gray-700 p-1 bg-gray-100 rounded-md">
                    <Settings size={16} />
                  </button>
                  <button className="text-gray-500 hover:bg-gray-100 px-2 sm:px-3 py-1 border rounded-md flex items-center space-x-1 transition-colors text-xs sm:text-sm">
                    <Download size={14} />
                    <span>Export</span>
                  </button>
                  <button className="text-purple-600 hover:bg-purple-50 px-2 sm:px-3 py-1 border border-purple-200 rounded-md flex items-center space-x-1 transition-colors text-xs sm:text-sm">
                    <FileText size={14} />
                    <span>View report</span>
                  </button>
                </div>
              </div>
              
              {isLoading ? (
                <div className="flex justify-center items-center h-40">
                  <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-t-2 border-b-2 border-purple-500"></div>
                </div>
              ) : error ? (
                <div className="bg-red-50 border-l-4 border-red-400 p-3 sm:p-4 text-xs sm:text-sm text-red-700">
                  {error}
                </div>
              ) : attendanceRecords.length === 0 ? (
                <div className="bg-gray-50 rounded-lg p-4 sm:p-8 text-center">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                    <Calendar size={24} className="text-gray-400" />
                  </div>
                  <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-1 sm:mb-2">No attendance records yet</h3>
                  <p className="text-xs sm:text-sm text-gray-600">
                    Your attendance history will appear here after you mark your first attendance.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto -mx-4 sm:mx-0">
                  <div className="inline-block min-w-full align-middle">
                    <table className="min-w-full">
                      <thead>
                        <tr className="text-left text-gray-500 text-xs sm:text-sm bg-gray-50">
                          <th className="py-2 sm:py-3 px-4 sm:px-2 rounded-l-lg">Name</th>
                          <th className="py-2 sm:py-3 px-4 sm:px-2">Status</th>
                          <th className="py-2 sm:py-3 px-4 sm:px-2">Date</th>
                          <th className="py-2 sm:py-3 px-4 sm:px-2">Clock In</th>
                          <th className="py-2 sm:py-3 px-4 sm:px-2 hidden sm:table-cell">Clock Out</th>
                          <th className="py-2 sm:py-3 px-4 sm:px-2 hidden md:table-cell">Schedule In</th>
                          <th className="py-2 sm:py-3 px-4 sm:px-2 hidden md:table-cell rounded-r-lg">Schedule Out</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {attendanceRecords.slice(0, 4).map((record, index) => (
                          <tr key={record.id || index} className="hover:bg-gray-50 transition-colors">
                            <td className="py-2 sm:py-3 px-4 sm:px-2">
                              <div className="flex items-center">
                                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 text-white flex items-center justify-center mr-2 sm:mr-3">
                                  {profile?.first_name?.charAt(0) || 'S'}
                                </div>
                                <div>
                                  <div className="font-medium text-xs sm:text-sm">{profile?.first_name || 'Student'} {profile?.last_name || ''}</div>
                                  <div className="text-xs text-gray-500 hidden sm:block">Student</div>
                                </div>
                              </div>
                            </td>
                            <td className="py-2 sm:py-3 px-4 sm:px-2">
                              <span className={`inline-block px-2 py-0.5 sm:py-1 rounded-md text-xs ${
                                record.is_late 
                                  ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' 
                                  : 'bg-green-100 text-green-800 border border-green-200'
                              }`}>
                                {record.is_late ? 'Late' : 'On Time'}
                              </span>
                            </td>
                            <td className="py-2 sm:py-3 px-4 sm:px-2 text-xs sm:text-sm">
                              {new Date(record.created_at).toLocaleDateString()}
                            </td>
                            <td className="py-2 sm:py-3 px-4 sm:px-2 text-xs sm:text-sm font-medium text-gray-700">
                              <div className="flex items-center">
                                <Clock size={12} className="mr-1 text-purple-500" />
                                {record.check_in_time || '09:00'}
                              </div>
                            </td>
                            <td className="py-2 sm:py-3 px-4 sm:px-2 text-xs sm:text-sm font-medium text-gray-700 hidden sm:table-cell">
                              <div className="flex items-center">
                                <Clock size={12} className="mr-1 text-indigo-500" />
                                {record.check_out_time || '17:07'}
                              </div>
                            </td>
                            <td className="py-2 sm:py-3 px-4 sm:px-2 text-xs sm:text-sm text-gray-500 hidden md:table-cell">
                              09:00
                            </td>
                            <td className="py-2 sm:py-3 px-4 sm:px-2 text-xs sm:text-sm text-gray-500 hidden md:table-cell">
                              17:00
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
              
              {/* Mobile view for attendance records - only shows on very small screens */}
              {!isLoading && !error && attendanceRecords.length > 0 && (
                <div className="sm:hidden mt-4">
                  <div className="text-xs text-gray-500 mb-2">Swipe to see more →</div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Calendar and Tools */}
          <div className="w-full lg:w-1/3 space-y-4 lg:space-y-6">
            {/* Mark Attendance Tool */}
            <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 border border-gray-100">
              <div className="flex items-center space-x-2 mb-4">
                <User size={18} className="text-purple-600" />
                <h2 className="font-semibold text-sm sm:text-base">Mark Attendance</h2>
              </div>
              <AttendanceForm onAttendanceMarked={handleAttendanceMarked} />
            </div>
            
            {/* Blockchain Attendance Records */}
            <BlockchainAttendance />
            
            {/* Wallet Section */}
            <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 border border-gray-100">
              <WalletConnect />
            </div>
          </div>
        </div>
        
        {/* Mobile Action Button */}
        <div className="lg:hidden fixed bottom-6 right-6">
          <button className="w-14 h-14 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg flex items-center justify-center">
            <User size={24} />
          </button>
        </div>
      </div>
      
      {/* Add some CSS for animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default StudentDashboard;