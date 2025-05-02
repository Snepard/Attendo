import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import QRCodeGenerator from '../../components/QRCodeGenerator';
import CourseForm from '../../components/CourseForm';
import { 
  getTeacherCourses, 
  addHomework, 
  getHomeworkByCourse 
} from '../../utils/supabaseClient';
import { 
  Calendar, 
  FileText, 
  Settings, 
  Search, 
  Download, 
  BarChart2, 
  Users, 
  Award, 
  User, 
  Menu, 
  X, 
  BookOpen, 
  QrCode, 
  PlusCircle, 
  GraduationCap, 
  Home, 
  Clock, 
  CheckCircle 
} from 'lucide-react';
import BlockchainAttendance from '../../components/BlockchainAttendance';
import WalletConnect from '../../components/WalletConnect';

const TeacherDashboard = () => {
  const { user, profile } = useAuth();
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCourseForm, setShowCourseForm] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [dateRange, setDateRange] = useState({ start: '01 Dec', end: '31 Dec' });
  const [showHomeworkForm, setShowHomeworkForm] = useState(false);
  const [homeworkList, setHomeworkList] = useState([]);
  const [homework, setHomework] = useState({
    title: '',
    description: '',
    due_date: '',
    attachments: []
  });

  // Toggle mobile menu function
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Fetch courses
  const fetchCourses = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      setError('');
      
      const { data, error: fetchError } = await getTeacherCourses(user.id);
      
      if (fetchError) {
        throw new Error(fetchError.message);
      }
      
      setCourses(data || []);
      
      // Select first course by default
      if (data && data.length > 0) {
        setSelectedCourse(data[0]);
        fetchHomework(data[0].id);
      }
    } catch (err) {
      console.error('Error fetching courses:', err);
      setError('Failed to load courses');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch homework for a course
  const fetchHomework = async (courseId) => {
    try {
      const { data, error: homeworkError } = await getHomeworkByCourse(courseId);
      if (homeworkError) throw homeworkError;
      setHomeworkList(data || []);
    } catch (err) {
      console.error('Error fetching homework:', err);
      setError('Failed to load homework');
    }
  };

  useEffect(() => {
    fetchCourses();
  }, [user]);

  // Handle course selection
  const handleCourseChange = (e) => {
    const courseId = e.target.value;
    const course = courses.find(c => c.id === courseId);
    setSelectedCourse(course);
    fetchHomework(courseId);
  };

  // Handle new course creation
  const handleCourseCreated = () => {
    setShowCourseForm(false);
    fetchCourses();
  };

  // Handle homework form input changes
  const handleHomeworkChange = (e) => {
    const { name, value } = e.target;
    setHomework(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle homework submission
  const handleHomeworkSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCourse || !user) return;

    try {
      const dueDate = new Date(homework.due_date);
      if (isNaN(dueDate.getTime())) {
        throw new Error('Invalid due date');
      }

      const { error: submitError } = await addHomework({
        ...homework,
        course_id: selectedCourse.id,
        teacher_id: user.id,
        due_date: dueDate.toISOString()
      });

      if (submitError) throw submitError;

      // Reset form and refresh homework list
      setHomework({
        title: '',
        description: '',
        due_date: '',
        attachments: []
      });
      setShowHomeworkForm(false);
      fetchHomework(selectedCourse.id);
    } catch (err) {
      console.error('Error adding homework:', err);
      setError(err.message || 'Failed to add homework');
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Mock data for attendance stats visualization
  const getAttendanceStats = () => {
    return {
      present: 85,
      late: 10,
      absent: 5
    };
  };

  const stats = getAttendanceStats();

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Mobile Navigation */}
      <div className="lg:hidden bg-white shadow-sm sticky top-0 z-50">
        <div className="flex justify-between items-center p-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white flex items-center justify-center">
              {profile?.first_name?.charAt(0) || 'T'}
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
              <button className="flex flex-col items-center justify-center p-3 rounded-lg hover:bg-blue-50">
                <BookOpen size={20} className="text-blue-600 mb-1" />
                <span className="text-xs">Courses</span>
              </button>
              <button className="flex flex-col items-center justify-center p-3 rounded-lg hover:bg-blue-50">
                <QrCode size={20} className="text-blue-600 mb-1" />
                <span className="text-xs">QR Code</span>
              </button>
              <button className="flex flex-col items-center justify-center p-3 rounded-lg hover:bg-blue-50">
                <User size={20} className="text-blue-600 mb-1" />
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
            <div className="bg-white rounded-lg shadow p-4 sm:p-6 border-l-4 border-blue-500">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Welcome, {profile?.first_name || 'Teacher'}!</h1>
                  <p className="text-gray-600 text-sm sm:text-base">Manage your courses and assignments</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button 
                    onClick={() => setShowCourseForm(!showCourseForm)}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-2 px-4 sm:px-6 rounded-lg flex items-center justify-center space-x-2 text-sm sm:text-base"
                  >
                    <PlusCircle size={16} />
                    <span>{showCourseForm ? 'Cancel' : 'New Course'}</span>
                  </button>
                  {selectedCourse && (
                    <button 
                      onClick={() => setShowHomeworkForm(!showHomeworkForm)}
                      className="bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white py-2 px-4 sm:px-6 rounded-lg flex items-center justify-center space-x-2 text-sm sm:text-base"
                    >
                      <Home size={16} />
                      <span>{showHomeworkForm ? 'Cancel' : 'Add Homework'}</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Stats Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
              {/* Attendance Chart */}
              <div className="bg-white rounded-lg shadow p-4 sm:p-6 border border-gray-200">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center space-x-2">
                    <BarChart2 size={18} className="text-blue-600" />
                    <h2 className="font-semibold text-sm sm:text-base">Course Metrics</h2>
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
                          className={`w-4 sm:w-6 rounded-t-md ${index === 6 ? 'bg-gradient-to-t from-blue-500 to-indigo-500' : 'bg-gray-200'}`}>
                        </div>
                        <span className="text-xs mt-1 sm:mt-2 text-gray-500">{month}</span>
                      </div>
                    );
                  })}
                </div>
                
                {/* Tooltip-like callout */}
                <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white p-3 sm:p-4 rounded-lg shadow-lg max-w-xs relative mb-4 sm:mb-6">
                  <div className="absolute bottom-full left-1/4 w-3 h-3 sm:w-4 sm:h-4 transform rotate-45 bg-gray-900"></div>
                  <ul className="space-y-1 sm:space-y-2 text-xs sm:text-sm">
                    <li className="flex items-center">
                      <span className="w-2 h-2 sm:w-3 sm:h-3 bg-blue-500 rounded-full mr-2"></span>
                      <span>Total Classes: {courses.length} courses</span>
                    </li>
                    <li className="flex items-center">
                      <span className="w-2 h-2 sm:w-3 sm:h-3 bg-indigo-500 rounded-full mr-2"></span>
                      <span>Students: {courses.reduce((acc, course) => acc + (course.course_students?.length || 0), 0)}</span>
                    </li>
                    <li className="flex items-center">
                      <span className="w-2 h-2 sm:w-3 sm:h-3 bg-teal-500 rounded-full mr-2"></span>
                      <span>Avg. Attendance: {stats.present}%</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Attendance Status */}
              <div className="bg-white rounded-lg shadow p-4 sm:p-6 border border-gray-200">
                <div className="flex justify-between items-center mb-4 sm:mb-6">
                  <div className="flex items-center space-x-2">
                    <Award size={18} className="text-blue-600" />
                    <h2 className="font-semibold text-sm sm:text-base">Attendance Overview</h2>
                  </div>
                  <div className="text-xs sm:text-sm bg-blue-100 px-2 sm:px-3 py-1 rounded-full text-blue-800 font-medium">Total: {courses.length || 0}</div>
                </div>
                
                {/* Attendance Type Breakdown */}
                <div className="space-y-3 sm:space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="flex items-center">
                        <span className="w-2 h-2 sm:w-3 sm:h-3 bg-green-500 rounded-full mr-2"></span>
                        <span className="text-xs sm:text-sm">Present</span>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <div className="mr-2 w-12 sm:w-16 text-right text-xs sm:text-sm">{stats.present}%</div>
                      <div className="w-24 sm:w-32 bg-gray-200 rounded-full h-1.5 sm:h-2">
                        <div className="bg-green-500 h-1.5 sm:h-2 rounded-full" style={{ width: `${stats.present}%` }}></div>
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
                  <a href="#" className="text-blue-600 text-xs sm:text-sm flex items-center hover:text-blue-800 transition-colors">
                    See All Insights
                    <span className="ml-1">▶</span>
                  </a>
                </div>
              </div>
            </div>

            {/* Homework Form */}
            {showHomeworkForm && selectedCourse && (
              <div className="bg-white rounded-lg shadow p-4 sm:p-6 border border-gray-200">
                <div className="flex items-center space-x-2 mb-4">
                  <Home size={18} className="text-blue-600" />
                  <h2 className="font-semibold text-sm sm:text-base">Add Homework for {selectedCourse.name}</h2>
                </div>
                
                <form onSubmit={handleHomeworkSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                    <input
                      type="text"
                      id="title"
                      name="title"
                      value={homework.title}
                      onChange={handleHomeworkChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                      id="description"
                      name="description"
                      value={homework.description}
                      onChange={handleHomeworkChange}
                      rows={4}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="due_date" className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                    <input
                      type="datetime-local"
                      id="due_date"
                      name="due_date"
                      value={homework.due_date}
                      onChange={handleHomeworkChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Attachments (coming soon)</label>
                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                      <div className="space-y-1 text-center">
                        <div className="flex text-sm text-gray-600">
                          <label className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none">
                            <span>Upload files</span>
                            <input type="file" className="sr-only" multiple disabled />
                          </label>
                          <p className="pl-1">or drag and drop</p>
                        </div>
                        <p className="text-xs text-gray-500">PDF, DOCX up to 10MB</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-end space-x-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowHomeworkForm(false)}
                      className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Assign Homework
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Homework List */}
            {selectedCourse && homeworkList.length > 0 && (
              <div className="bg-white rounded-lg shadow p-4 sm:p-6 border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-semibold text-lg">Homework Assignments</h2>
                  <span className="text-sm text-gray-500">
                    {homeworkList.length} assignments
                  </span>
                </div>
                <div className="space-y-4">
                  {homeworkList.map((hw) => (
                    <div key={hw.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex justify-between items-start">
                        <h3 className="font-medium">{hw.title}</h3>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          new Date(hw.due_date) < new Date() 
                            ? 'bg-red-100 text-red-800' 
                            : 'bg-green-100 text-green-800'
                        }`}>
                          Due: {formatDate(hw.due_date)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1 mb-2">
                        {hw.description}
                      </p>
                      <div className="flex justify-between items-center text-xs text-gray-500">
                        <span>Assigned: {formatDate(hw.created_at)}</span>
                        <span>{hw.courses?.name}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Courses Table */}
            <div className="bg-white rounded-lg shadow p-4 sm:p-6 border border-gray-200">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4 sm:mb-6">
                <div className="flex items-center space-x-2">
                  <BookOpen size={18} className="text-blue-600" />
                  <h2 className="font-semibold text-sm sm:text-base">Course Listing</h2>
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
                  <button className="text-blue-600 hover:bg-blue-50 px-2 sm:px-3 py-1 border border-blue-200 rounded-md flex items-center space-x-1 transition-colors text-xs sm:text-sm">
                    <FileText size={14} />
                    <span>View report</span>
                  </button>
                </div>
              </div>
              
              {isLoading ? (
                <div className="flex justify-center items-center h-40">
                  <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              ) : error ? (
                <div className="bg-red-50 border-l-4 border-red-400 p-3 sm:p-4 text-xs sm:text-sm text-red-700">
                  {error}
                </div>
              ) : courses.length === 0 ? (
                <div className="bg-gray-50 rounded-lg p-4 sm:p-8 text-center">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                    <BookOpen size={24} className="text-gray-400" />
                  </div>
                  <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-1 sm:mb-2">No courses yet</h3>
                  <p className="text-xs sm:text-sm text-gray-600">
                    Your courses will appear here after you create them.
                  </p>
                  <button
                    onClick={() => setShowCourseForm(true)}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Create your first course
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto -mx-4 sm:mx-0">
                  <div className="inline-block min-w-full align-middle">
                    <table className="min-w-full">
                      <thead>
                        <tr className="text-left text-gray-500 text-xs sm:text-sm bg-gray-50">
                          <th className="py-2 sm:py-3 px-4 sm:px-2 rounded-l-lg">Course Name</th>
                          <th className="py-2 sm:py-3 px-4 sm:px-2">Course Code</th>
                          <th className="py-2 sm:py-3 px-4 sm:px-2 hidden md:table-cell">Schedule</th>
                          <th className="py-2 sm:py-3 px-4 sm:px-2">Students</th>
                          <th className="py-2 sm:py-3 px-4 sm:px-2 hidden sm:table-cell">Status</th>
                          <th className="py-2 sm:py-3 px-4 sm:px-2 rounded-r-lg">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {courses.map((course) => (
                          <tr key={course.id} className="hover:bg-gray-50 transition-colors">
                            <td className="py-2 sm:py-3 px-4 sm:px-2">
                              <div className="flex items-center">
                                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white flex items-center justify-center mr-2 sm:mr-3">
                                  {course.name?.charAt(0) || 'C'}
                                </div>
                                <div>
                                  <div className="font-medium text-xs sm:text-sm">{course.name}</div>
                                  <div className="text-xs text-gray-500 hidden sm:block">{course.department || 'Department'}</div>
                                </div>
                              </div>
                            </td>
                            <td className="py-2 sm:py-3 px-4 sm:px-2 text-xs sm:text-sm">
                              <span className="font-mono bg-gray-100 px-2 py-1 rounded text-gray-600">
                                {course.code}
                              </span>
                            </td>
                            <td className="py-2 sm:py-3 px-4 sm:px-2 text-xs sm:text-sm text-gray-500 hidden md:table-cell">
                              {course.schedule || 'Not specified'}
                            </td>
                            <td className="py-2 sm:py-3 px-4 sm:px-2 text-xs sm:text-sm">
                              <div className="flex items-center">
                                <Users size={14} className="mr-1 text-blue-500" />
                                <span>{course.course_students?.length || 0}</span>
                              </div>
                            </td>
                            <td className="py-2 sm:py-3 px-4 sm:px-2 hidden sm:table-cell">
                              <span className="inline-block px-2 py-0.5 sm:py-1 rounded-md text-xs bg-green-100 text-green-800 border border-green-200">
                                Active
                              </span>
                            </td>
                            <td className="py-2 sm:py-3 px-4 sm:px-2">
                              <div className="flex space-x-2">
                                <button 
                                  onClick={() => setSelectedCourse(course)}
                                  className={`p-1 rounded-md ${selectedCourse?.id === course.id ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500 hover:text-gray-700'}`}
                                >
                                  <QrCode size={16} />
                                </button>
                                <button 
                                  onClick={() => {
                                    setSelectedCourse(course);
                                    setShowHomeworkForm(true);
                                  }}
                                  className="p-1 rounded-md bg-gray-100 text-gray-500 hover:text-gray-700"
                                >
                                  <Home size={16} />
                                </button>
                                <button className="p-1 rounded-md bg-gray-100 text-gray-500 hover:text-gray-700">
                                  <Settings size={16} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
              
              {/* Mobile note for horizontal scrolling */}
              {!isLoading && !error && courses.length > 0 && (
                <div className="sm:hidden mt-4">
                  <div className="text-xs text-gray-500 mb-2">Swipe to see more →</div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Course Form or QR Code */}
          <div className="w-full lg:w-1/3 space-y-4 lg:space-y-6">
            {/* Wallet Connect */}
            <WalletConnect />

            {/* Blockchain Attendance Records */}
            <BlockchainAttendance />

            {/* New Course Form */}
            {showCourseForm ? (
              <div className="bg-white rounded-lg shadow p-4 sm:p-6 border border-gray-200">
                <div className="flex items-center space-x-2 mb-4">
                  <PlusCircle size={18} className="text-blue-600" />
                  <h2 className="font-semibold text-sm sm:text-base">Create New Course</h2>
                </div>
                <CourseForm onCourseCreated={handleCourseCreated} />
              </div>
            ) : (
              <>
                {/* Course Selection */}
                <div className="bg-white rounded-lg shadow p-4 sm:p-6 border border-gray-200">
                  <div className="flex items-center space-x-2 mb-4">
                    <BookOpen size={18} className="text-blue-600" />
                    <h2 className="font-semibold text-sm sm:text-base">Course Selection</h2>
                  </div>
                  
                  {courses.length === 0 ? (
                    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 rounded-r-md text-xs sm:text-sm text-yellow-700">
                      <p>You don't have any courses yet.</p>
                      <button
                        onClick={() => setShowCourseForm(true)}
                        className="text-yellow-800 underline mt-2 text-xs sm:text-sm"
                      >
                        Create your first course
                      </button>
                    </div>
                  ) : (
                    <div>
                      <label htmlFor="courseSelect" className="block text-xs sm:text-sm text-gray-600 mb-2">
                        Select a course to generate attendance code
                      </label>
                      <select
                        id="courseSelect"
                        value={selectedCourse?.id || ''}
                        onChange={handleCourseChange}
                        className="w-full border-gray-300 rounded-md shadow-sm py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        {courses.map(course => (
                          <option key={course.id} value={course.id}>
                            {course.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
                
                {/* Course Overview */}
                {selectedCourse && (
                  <div className="bg-white rounded-lg shadow p-4 sm:p-6 border border-gray-200">
                    <div className="flex items-center space-x-2 mb-4">
                      <GraduationCap size={18} className="text-blue-600" />
                      <h2 className="font-semibold text-sm sm:text-base">Course Overview</h2>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-xs sm:text-sm font-medium text-gray-500">Course Name</h4>
                        <p className="text-gray-900 font-medium text-sm sm:text-base">{selectedCourse.name}</p>
                      </div>
                      
                      <div>
                        <h4 className="text-xs sm:text-sm font-medium text-gray-500">Course Code</h4>
                        <p className="text-gray-900 font-medium text-sm sm:text-base">{selectedCourse.code}</p>
                      </div>
                      
                      <div>
                        <h4 className="text-xs sm:text-sm font-medium text-gray-500">Schedule</h4>
                        <p className="text-gray-900 text-sm sm:text-base">{selectedCourse.schedule || 'Not specified'}</p>
                      </div>
                      
                      <div className="pt-2">
                        <div className="flex justify-between text-xs sm:text-sm">
                          <span className="font-medium text-gray-500">Students Enrolled</span>
                          <span className="font-medium text-gray-900">
                            {selectedCourse.course_students?.length || 0}
                          </span>
                        </div>
                        <div className="mt-2 h-1.5 sm:h-2 bg-gray-200 rounded-full">
                          <div
                            className="h-1.5 sm:h-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"
                            style={{ 
                              width: `${Math.min(((selectedCourse.course_students?.length || 0) / 50) * 100, 100)}%` 
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* QR Code Generator */}
                {selectedCourse && (
                  <div className="bg-white rounded-lg shadow p-4 sm:p-6 border border-gray-200">
                    <div className="flex items-center space-x-2 mb-4">
                      <QrCode size={18} className="text-blue-600" />
                      <h2 className="font-semibold text-sm sm:text-base">Attendance QR Code</h2>
                    </div>
                    <QRCodeGenerator courseId={selectedCourse.id} />
                  </div>
                )}
                
                {/* No Course Selected Message */}
                {!selectedCourse && courses.length > 0 && (
                  <div className="bg-white rounded-lg shadow p-4 sm:p-6 border border-gray-200 text-center">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                      <QrCode size={24} className="text-gray-400" />
                    </div>
                    <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-1 sm:mb-2">No Course Selected</h3>
                    <p className="text-xs sm:text-sm text-gray-600">
                      Please select a course to generate an attendance QR code.
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
        
        {/* Mobile Action Button */}
        <div className="lg:hidden fixed bottom-6 right-6">
          <button 
            onClick={() => {
              if (selectedCourse) {
                setShowHomeworkForm(!showHomeworkForm);
              } else {
                setShowCourseForm(!showCourseForm);
              }
            }}
            className="w-14 h-14 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg flex items-center justify-center"
          >
            {showCourseForm || showHomeworkForm ? <X size={24} /> : <PlusCircle size={24} />}
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

export default TeacherDashboard;