import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import QRCodeGenerator from '../../components/QRCodeGenerator';
import CourseForm from '../../components/CourseForm';
import { getTeacherCourses } from '../../utils/supabaseClient';
import { Calendar, FileText, Settings, Search, Download, BarChart2, Users, Award, User, Menu, X, BookOpen, QrCode, PlusCircle, GraduationCap } from 'lucide-react';

const TeacherDashboard = () => {
  const { user, profile } = useAuth();
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCourseForm, setShowCourseForm] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [dateRange, setDateRange] = useState({ start: '01 Dec', end: '31 Dec' });
  
  // Fetch courses
  const fetchCourses = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      setError('');
      
      const { data, error } = await getTeacherCourses(user.id);
      
      if (error) {
        throw new Error(error.message);
      }
      
      setCourses(data || []);
      
      // Select first course by default
      if (data && data.length > 0) {
        setSelectedCourse(data[0]);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
      setError('Failed to load courses');
    } finally {
      setIsLoading(false);
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
  };

  // Handle new course creation
  const handleCourseCreated = () => {
    setShowCourseForm(false);
    fetchCourses();
  };

  // Toggle mobile menu
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
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
    <div className="bg-purple-100 min-h-screen">
      {/* Mobile Navigation */}
      <div className="lg:hidden bg-white shadow-sm sticky top-0 z-50">
        <div className="flex justify-between items-center p-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 text-white flex items-center justify-center">
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
              <button className="flex flex-col items-center justify-center p-3 rounded-lg hover:bg-purple-50">
                <BookOpen size={20} className="text-purple-600 mb-1" />
                <span className="text-xs">Courses</span>
              </button>
              <button className="flex flex-col items-center justify-center p-3 rounded-lg hover:bg-purple-50">
                <QrCode size={20} className="text-purple-600 mb-1" />
                <span className="text-xs">QR Code</span>
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
                  <h1 className="text-xl sm:text-2xl font-bold">Hi, {profile?.first_name || 'Teacher'}!!</h1>
                  <p className="text-gray-600 text-sm sm:text-base">Manage your courses with Attendo</p>
                </div>
                <button 
                  onClick={() => setShowCourseForm(!showCourseForm)}
                  className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white py-2 px-4 sm:px-6 rounded-full flex items-center justify-center space-x-2 text-sm sm:text-base"
                >
                  <PlusCircle size={16} />
                  <span>{showCourseForm ? 'Cancel' : 'New Course'}</span>
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
                          className={`w-4 sm:w-6 rounded-t-md ${index === 6 ? 'bg-gradient-to-t from-blue-500 to-purple-500' : 'bg-gray-200'}`}>
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
                      <span className="w-2 h-2 sm:w-3 sm:h-3 bg-purple-500 rounded-full mr-2"></span>
                      <span>Students: {courses.reduce((acc, course) => acc + (course.course_students?.length || 0), 0)}</span>
                    </li>
                    <li className="flex items-center">
                      <span className="w-2 h-2 sm:w-3 sm:h-3 bg-orange-500 rounded-full mr-2"></span>
                      <span>Avg. Attendance: {stats.present}%</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Attendance Status */}
              <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 border border-gray-100">
                <div className="flex justify-between items-center mb-4 sm:mb-6">
                  <div className="flex items-center space-x-2">
                    <Award size={18} className="text-purple-600" />
                    <h2 className="font-semibold text-sm sm:text-base">Attendance Overview</h2>
                  </div>
                  <div className="text-xs sm:text-sm bg-purple-100 px-2 sm:px-3 py-1 rounded-full text-purple-800 font-medium">Total: {courses.length || 0}</div>
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
                  <a href="#" className="text-purple-600 text-xs sm:text-sm flex items-center hover:text-purple-800 transition-colors">
                    See All Insights
                    <span className="ml-1">▶</span>
                  </a>
                </div>
              </div>
            </div>

            {/* Courses Table */}
            <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 border border-gray-100">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4 sm:mb-6">
                <div className="flex items-center space-x-2">
                  <BookOpen size={18} className="text-purple-600" />
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
                    className="mt-4 px-4 py-2 bg-purple-600 text-white text-sm rounded-md hover:bg-purple-700 transition-colors"
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
                                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 text-white flex items-center justify-center mr-2 sm:mr-3">
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
                                <Users size={14} className="mr-1 text-purple-500" />
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
                                  className={`p-1 rounded-md ${selectedCourse?.id === course.id ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-500 hover:text-gray-700'}`}
                                >
                                  <QrCode size={16} />
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
            {/* New Course Form */}
            {showCourseForm ? (
              <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 border border-gray-100">
                <div className="flex items-center space-x-2 mb-4">
                  <PlusCircle size={18} className="text-purple-600" />
                  <h2 className="font-semibold text-sm sm:text-base">Create New Course</h2>
                </div>
                <CourseForm onCourseCreated={handleCourseCreated} />
              </div>
            ) : (
              <>
                {/* Course Selection */}
                <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 border border-gray-100">
                  <div className="flex items-center space-x-2 mb-4">
                    <BookOpen size={18} className="text-purple-600" />
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
                        className="w-full border-gray-300 rounded-md shadow-sm py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
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
                  <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 border border-gray-100">
                    <div className="flex items-center space-x-2 mb-4">
                      <GraduationCap size={18} className="text-purple-600" />
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
                            className="h-1.5 sm:h-2 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full"
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
                  <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 border border-gray-100">
                    <div className="flex items-center space-x-2 mb-4">
                      <QrCode size={18} className="text-purple-600" />
                      <h2 className="font-semibold text-sm sm:text-base">Attendance QR Code</h2>
                    </div>
                    <QRCodeGenerator courseId={selectedCourse.id} />
                  </div>
                )}
                
                {/* No Course Selected Message */}
                {!selectedCourse && courses.length > 0 && (
                  <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 border border-gray-100 text-center">
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
            onClick={() => setShowCourseForm(!showCourseForm)}
            className="w-14 h-14 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg flex items-center justify-center"
          >
            {showCourseForm ? <X size={24} /> : <PlusCircle size={24} />}
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