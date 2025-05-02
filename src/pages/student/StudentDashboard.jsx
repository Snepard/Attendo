import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getStudentAttendance, getStudentAssignments, submitHomework } from '../../utils/supabaseClient';
import { 
  Home, FileText, ClipboardList, User, Calendar, 
  Menu, X, QrCode, Plus, Check, Clock, Download, Video
} from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

// Reusing existing components
import WalletConnect from '../../components/WalletConnect';
import AttendanceForm from '../../components/AttendanceForm';
import BlockchainAttendance from '../../components/BlockchainAttendance';
import QRScanner from '../../components/QRScanner';

const StudentDashboard = () => {
  const { user, profile } = useAuth();
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [assignmentsLoading, setAssignmentsLoading] = useState(true);
  const [error, setError] = useState('');
  const [assignmentsError, setAssignmentsError] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [totalClasses, setTotalClasses] = useState(30);
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showSubmissionForm, setShowSubmissionForm] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [submissionText, setSubmissionText] = useState('');

  // Get current time for greeting
  const currentHour = new Date().getHours();
  const greeting = currentHour < 12 ? 'Good morning' : 
                  currentHour < 18 ? 'Good afternoon' : 'Good evening';

  // Load todos from localStorage on component mount
  useEffect(() => {
    const savedTodos = localStorage.getItem('studentTodos');
    if (savedTodos) {
      setTodos(JSON.parse(savedTodos));
    }
  }, []);

  // Save todos to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('studentTodos', JSON.stringify(todos));
  }, [todos]);

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

  // Fetch assignments
  useEffect(() => {
    const fetchAssignments = async () => {
      if (!user) return;
      
      try {
        setAssignmentsLoading(true);
        setAssignmentsError('');
        
        const { data, error } = await getStudentAssignments(user.id);
        
        if (error) {
          throw new Error(error.message);
        }
        
        setAssignments(data || []);
      } catch (error) {
        console.error('Error fetching assignments:', error);
        setAssignmentsError('Failed to load assignments');
      } finally {
        setAssignmentsLoading(false);
      }
    };
    
    fetchAssignments();
  }, [user]);

  // Prepare chart data with dates on x-axis
  const prepareChartData = () => {
    // Group attendance by date
    const attendanceByDate = {};
    
    attendanceRecords.forEach(record => {
      const date = new Date(record.date).toLocaleDateString();
      if (!attendanceByDate[date]) {
        attendanceByDate[date] = {
          present: 0,
          late: 0
        };
      }
      
      if (record.is_late) {
        attendanceByDate[date].late += 1;
      } else {
        attendanceByDate[date].present += 1;
      }
    });

    // Sort dates chronologically
    const sortedDates = Object.keys(attendanceByDate).sort((a, b) => {
      return new Date(a) - new Date(b);
    });

    return {
      labels: sortedDates,
      datasets: [
        {
          label: 'Present',
          data: sortedDates.map(date => attendanceByDate[date].present),
          backgroundColor: 'rgba(75, 192, 192, 0.6)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1
        },
        {
          label: 'Late',
          data: sortedDates.map(date => attendanceByDate[date].late),
          backgroundColor: 'rgba(255, 206, 86, 0.6)',
          borderColor: 'rgba(255, 206, 86, 1)',
          borderWidth: 1
        }
      ]
    };
  };

  const chartData = prepareChartData();

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Attendance by Date'
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `${context.dataset.label}: ${context.raw}`;
          }
        }
      }
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Date'
        }
      },
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Count'
        },
        ticks: {
          stepSize: 1,
          precision: 0
        }
      }
    }
  };

  // Handle when new attendance is marked
  const handleAttendanceMarked = (newAttendance) => {
    setAttendanceRecords([newAttendance, ...attendanceRecords]);
    setShowQRScanner(false);
  };

  // Handle QR code scan result
  const handleQRScan = (qrData) => {
    setShowQRScanner(false);
  };

  // Calculate attendance stats
  const getAttendanceStats = () => {
    if (!attendanceRecords.length) return { present: 0, late: 0, absent: 0 };
    
    const present = attendanceRecords.filter(r => !r.is_late).length;
    const late = attendanceRecords.filter(r => r.is_late).length;
    const total = totalClasses;
    
    return {
      present: Math.round((present / total) * 100),
      late: Math.round((late / total) * 100),
      absent: Math.round(((total - present - late) / total) * 100)
    };
  };

  const stats = getAttendanceStats();

  // Todo list functions
  const addTodo = () => {
    if (newTodo.trim() === '') return;
    setTodos([...todos, { id: Date.now(), text: newTodo, completed: false }]);
    setNewTodo('');
  };

  const toggleTodo = (id) => {
    setTodos(todos.map(todo => 
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  };

  const deleteTodo = (id) => {
    setTodos(todos.filter(todo => todo.id !== id));
  };

  // Generate calendar days
  const generateCalendarDays = () => {
    const days = [];
    const today = new Date().getDate();
    const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
    
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }
    
    const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }
    
    return { days, today };
  };

  const { days, today } = generateCalendarDays();

  // Toggle mobile menu
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Toggle QR scanner
  const toggleQRScanner = () => {
    setShowQRScanner(!showQRScanner);
  };

  // Handle assignment submission
  const handleAssignmentSubmit = async (assignmentId) => {
    if (!user || !submissionText) return;
    
    try {
      const { data, error } = await submitHomework({
        homework_id: assignmentId,
        student_id: user.id,
        submission_text: submissionText,
        submitted_at: new Date().toISOString()
      });

      if (error) throw error;

      // Refresh assignments list
      const { data: updatedAssignments } = await getStudentAssignments(user.id);
      setAssignments(updatedAssignments || []);
      setShowSubmissionForm(false);
      setSelectedAssignment(null);
      setSubmissionText('');
    } catch (error) {
      console.error('Error submitting assignment:', error);
      setAssignmentsError('Failed to submit assignment');
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="flex min-h-screen bg-white">
      {/* Sidebar - Desktop */}
      <div className={`hidden lg:flex flex-col w-64 border-r border-gray-200 bg-white ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="flex items-center justify-center h-16 border-b border-gray-200">
          <h1 className="text-xl font-semibold text-purple-600">Attendo</h1>
        </div>
        <div className="flex flex-col flex-grow p-4 overflow-auto">
          <nav className="flex-1 space-y-2">
            <Link 
              to="/student" 
              className="flex items-center px-4 py-3 text-sm font-medium rounded-lg bg-purple-50 text-purple-700"
            >
              <Home className="w-5 h-5 mr-3" />
              Dashboard
            </Link>
            <Link 
              to="/student/reports" 
              className="flex items-center px-4 py-3 text-sm font-medium rounded-lg text-gray-700 hover:bg-purple-50 hover:text-purple-700"
            >
              <FileText className="w-5 h-5 mr-3" />
              Reports
            </Link>
            <Link 
              to="/student/assignments" 
              className="flex items-center px-4 py-3 text-sm font-medium rounded-lg text-gray-700 hover:bg-purple-50 hover:text-purple-700"
            >
              <ClipboardList className="w-5 h-5 mr-3" />
              Assignments
            </Link>
          </nav>
          <div className="mt-auto pb-4">
            <Link 
              to="/student/profile" 
              className="flex items-center px-4 py-3 text-sm font-medium rounded-lg text-gray-700 hover:bg-purple-50 hover:text-purple-700"
            >
              <User className="w-5 h-5 mr-3" />
              {profile?.first_name || 'Profile'}
            </Link>
          </div>
        </div>
      </div>

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
            <div className="space-y-2">
              <Link to="/student" className="flex items-center p-3 rounded-lg hover:bg-purple-50">
                <Home size={20} className="text-purple-600 mr-3" />
                <span>Dashboard</span>
              </Link>
              <Link to="/student/reports" className="flex items-center p-3 rounded-lg hover:bg-purple-50">
                <FileText size={20} className="text-purple-600 mr-3" />
                <span>Reports</span>
              </Link>
              <Link to="/student/assignments" className="flex items-center p-3 rounded-lg hover:bg-purple-50">
                <ClipboardList size={20} className="text-purple-600 mr-3" />
                <span>Assignments</span>
              </Link>
              <Link to="/student/profile" className="flex items-center p-3 rounded-lg hover:bg-purple-50">
                <User size={20} className="text-purple-600 mr-3" />
                <span>Profile</span>
              </Link>
            </div>
          </div>
        )}
      </div>
      
      <div className="flex-1 overflow-auto">
        <div className="container mx-auto px-4 py-6">
          {/* Main Content */}
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Left Column - Dashboard and Stats */}
            <div className="w-full lg:w-2/3 space-y-6">
              {/* Greeting Header */}
              <div>
                <h1 className="text-2xl font-bold text-gray-800">{greeting}, {profile?.first_name || 'Student'}!</h1>
                <p className="text-gray-600">Here's your dashboard overview</p>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Link 
                  to="/student/reports/create" 
                  className="bg-purple-50 hover:bg-purple-100 p-4 rounded-xl transition-colors"
                >
                  <div className="flex items-center">
                    <div className="p-3 rounded-lg bg-purple-100 text-purple-600 mr-4">
                      <FileText size={20} />
                    </div>
                    <div>
                      <h3 className="font-medium">Create Reports</h3>
                      <p className="text-sm text-gray-500">Generate your attendance reports</p>
                    </div>
                  </div>
                </Link>
                
                <Link 
                  to="/student/attendance-records" 
                  className="bg-purple-50 hover:bg-purple-100 p-4 rounded-xl transition-colors"
                >
                  <div className="flex items-center">
                    <div className="p-3 rounded-lg bg-purple-100 text-purple-600 mr-4">
                      <Clock size={20} />
                    </div>
                    <div>
                      <h3 className="font-medium">Attendance Records</h3>
                      <p className="text-sm text-gray-500">View your attendance history</p>
                    </div>
                  </div>
                </Link>

                <button 
                  onClick={toggleQRScanner}
                  className="bg-purple-50 hover:bg-purple-100 p-4 rounded-xl transition-colors text-left"
                >
                  <div className="flex items-center">
                    <div className="p-3 rounded-lg bg-purple-100 text-purple-600 mr-4">
                      <QrCode size={20} />
                    </div>
                    <div>
                      <h3 className="font-medium">Mark Attendance</h3>
                      <p className="text-sm text-gray-500">Scan QR code to mark presence</p>
                    </div>
                  </div>
                </button>
              </div>

              {/* Stats Section */}
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="font-semibold text-lg">Attendance Metrics</h2>
                  <button className="text-purple-600 hover:text-purple-800 text-sm flex items-center">
                    <Download size={16} className="mr-1" />
                    Export
                  </button>
                </div>
                
                {/* Bar Chart Visualization */}
                <div className="h-64 mb-6">
                  {attendanceRecords.length > 0 ? (
                    <Bar data={chartData} options={chartOptions} />
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-500">
                      No attendance data available for chart
                    </div>
                  )}
                </div>
                
                {/* Stats Summary */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500">Present</p>
                    <p className="text-2xl font-bold text-purple-600">{stats.present}%</p>
                  </div>
                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500">Late</p>
                    <p className="text-2xl font-bold text-yellow-600">{stats.late}%</p>
                  </div>
                  <div className="bg-red-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500">Absent</p>
                    <p className="text-2xl font-bold text-red-600">{stats.absent}%</p>
                  </div>
                </div>
              </div>

              {/* Attendance Records Table */}
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="font-semibold text-lg">Recent Attendance</h2>
                  <Link 
                    to="/student/attendance-records"
                    className="text-purple-600 hover:text-purple-800 text-sm"
                  >
                    View All
                  </Link>
                </div>
                
                {isLoading ? (
                  <div className="flex justify-center items-center h-40">
                    <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-purple-500"></div>
                  </div>
                ) : error ? (
                  <div className="bg-red-50 border-l-4 border-red-400 p-4 text-sm text-red-700">
                    {error}
                  </div>
                ) : attendanceRecords.length === 0 ? (
                  <div className="bg-gray-50 rounded-lg p-8 text-center">
                    <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Calendar size={24} className="text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No attendance records yet</h3>
                    <p className="text-sm text-gray-600">
                      Your attendance history will appear here after you mark your first attendance.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full">
                      <thead>
                        <tr className="text-left text-gray-500 text-sm">
                          <th className="pb-3">Date</th>
                          <th className="pb-3">Status</th>
                          <th className="pb-3">Time In</th>
                          <th className="pb-3">Time Out</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {attendanceRecords.slice(0, 5).map((record, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="py-3 text-sm">
                              {new Date(record.date).toLocaleDateString()}
                            </td>
                            <td className="py-3">
                              <span className={`inline-block px-2 py-1 rounded-full text-xs ${
                                record.is_late 
                                  ? 'bg-yellow-100 text-yellow-800' 
                                  : 'bg-green-100 text-green-800'
                              }`}>
                                {record.is_late ? 'Late' : 'On Time'}
                              </span>
                            </td>
                            <td className="py-3 text-sm">
                              {record.time_in}
                            </td>
                            <td className="py-3 text-sm">
                              {record.time_out || '-'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column */}
            <div className="w-full lg:w-1/3 space-y-6">
              {/* Calendar */}
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-medium">{currentMonth} {currentYear}</h3>
                  <Link to="/student/calendar" className="text-purple-600 hover:text-purple-800 text-sm">
                    View All
                  </Link>
                </div>
                <div className="grid grid-cols-7 gap-1 text-center">
                  {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(day => (
                    <div key={day} className="text-xs text-gray-500 py-1">{day}</div>
                  ))}
                  {days.map((day, index) => (
                    <div 
                      key={index} 
                      className={`text-xs p-2 rounded-full ${day === today ? 'bg-purple-100 text-purple-800 font-medium' : 'text-gray-700'} ${day ? 'cursor-pointer hover:bg-gray-100' : ''}`}
                    >
                      {day || ''}
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Todo List */}
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-medium">My Tasks</h3>
                  <Link to="/student/tasks" className="text-purple-600 hover:text-purple-800 text-sm">
                    View All
                  </Link>
                </div>
                <div className="space-y-3 mb-4">
                  {todos.slice(0, 4).map(todo => (
                    <div key={todo.id} className="flex items-center">
                      <button 
                        onClick={() => toggleTodo(todo.id)}
                        className={`w-5 h-5 rounded mr-3 flex items-center justify-center ${todo.completed ? 'bg-purple-500 text-white' : 'border border-gray-300'}`}
                      >
                        {todo.completed && <Check size={14} />}
                      </button>
                      <span className={`text-sm flex-grow ${todo.completed ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                        {todo.text}
                      </span>
                      <button 
                        onClick={() => deleteTodo(todo.id)}
                        className="text-gray-400 hover:text-red-500 ml-2"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex">
                  <input
                    type="text"
                    value={newTodo}
                    onChange={(e) => setNewTodo(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addTodo()}
                    placeholder="Add a new task..."
                    className="flex-grow text-sm border border-gray-300 rounded-l-lg px-4 py-2 focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
                  />
                  <button
                    onClick={addTodo}
                    className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-r-lg"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>

              {/* Assignments Section */}
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="font-semibold text-lg">Your Assignments</h2>
                  <Link 
                    to="/student/assignments"
                    className="text-purple-600 hover:text-purple-800 text-sm"
                  >
                    View All
                  </Link>
                </div>
                
                {assignmentsLoading ? (
                  <div className="flex justify-center items-center h-40">
                    <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-purple-500"></div>
                  </div>
                ) : assignmentsError ? (
                  <div className="bg-red-50 border-l-4 border-red-400 p-4 text-sm text-red-700">
                    {assignmentsError}
                  </div>
                ) : assignments.length === 0 ? (
                  <div className="bg-gray-50 rounded-lg p-8 text-center">
                    <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                      <ClipboardList size={24} className="text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No assignments yet</h3>
                    <p className="text-sm text-gray-600">
                      Your assignments will appear here when your teachers post them.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {assignments.slice(0, 3).map(assignment => (
                      <div key={assignment.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-medium text-gray-900">{assignment.title}</h3>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            new Date(assignment.due_date) < new Date() 
                              ? 'bg-red-100 text-red-800' 
                              : 'bg-purple-100 text-purple-800'
                          }`}>
                            Due: {formatDate(assignment.due_date)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                          {assignment.description}
                        </p>
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-gray-500">
                            {assignment.courses?.name}
                          </span>
                          <button 
                            onClick={() => {
                              setSelectedAssignment(assignment);
                              setShowSubmissionForm(true);
                            }}
                            className="text-purple-600 hover:text-purple-800 text-sm flex items-center"
                          >
                            Submit
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Assignment Submission Modal */}
              {showSubmissionForm && selectedAssignment && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                  <div className="bg-white rounded-lg p-6 w-full max-w-md">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-medium">Submit Assignment: {selectedAssignment.title}</h3>
                      <button 
                        onClick={() => {
                          setShowSubmissionForm(false);
                          setSelectedAssignment(null);
                        }} 
                        className="text-gray-500 hover:text-gray-700"
                      >
                        <X size={24} />
                      </button>
                    </div>
                    <div className="mb-4">
                      <label htmlFor="submissionText" className="block text-sm font-medium text-gray-700 mb-1">
                        Your Submission
                      </label>
                      <textarea
                        id="submissionText"
                        value={submissionText}
                        onChange={(e) => setSubmissionText(e.target.value)}
                        rows={6}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
                        placeholder="Write your submission here..."
                      />
                    </div>
                    <div className="flex justify-end space-x-3">
                      <button
                        onClick={() => {
                          setShowSubmissionForm(false);
                          setSelectedAssignment(null);
                        }}
                        className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleAssignmentSubmit(selectedAssignment.id)}
                        className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700"
                      >
                        Submit Assignment
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Mark Attendance Tool */}
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-semibold">Mark Attendance</h2>
                  <button 
                    onClick={toggleQRScanner}
                    className="bg-purple-100 hover:bg-purple-200 text-purple-700 p-2 rounded-full"
                  >
                    <QrCode size={18} />
                  </button>
                </div>
                
                {showQRScanner ? (
                  <QRScanner onScan={handleQRScan} />
                ) : (
                  <AttendanceForm onAttendanceMarked={handleAttendanceMarked} />
                )}
              </div>
              
              {/* Blockchain Attendance */}
              <BlockchainAttendance />
              
              {/* Wallet Section */}
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <WalletConnect />
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Mobile Action Button */}
      <div className="lg:hidden fixed bottom-6 right-6">
        <button className="w-14 h-14 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg flex items-center justify-center">
          <User size={24} />
        </button>
      </div>
      
      {/* QR Scanner Modal */}
      {showQRScanner && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Scan QR Code</h3>
              <button onClick={toggleQRScanner} className="text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>
            <QRScanner onScan={handleQRScan} />
          </div>
        </div>
      )}
      
      {/* Animations */}
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