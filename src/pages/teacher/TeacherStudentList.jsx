import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import StudentList from '../../components/StudentList';
import { getTeacherCourses, getStudentsByCourse, getStudentAttendanceByCourse } from '../../utils/supabaseClient';
import { BookOpen, Search, Settings, Download, FileText, Users } from 'lucide-react';

const TeacherStudentList = () => {
  const { user, profile } = useAuth();
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [students, setStudents] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch courses
  useEffect(() => {
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
    
    fetchCourses();
  }, [user]);

  // Fetch students and attendance records when course changes
  useEffect(() => {
    const fetchStudentsAndAttendance = async () => {
      if (!selectedCourse) return;
      
      try {
        setIsLoading(true);
        setError('');
        
        // Fetch students
        const { data: studentsData, error: studentsError } = await getStudentsByCourse(selectedCourse.id);
        
        if (studentsError) {
          throw new Error(studentsError.message);
        }
        
        setStudents(studentsData || []);
        
        // Fetch attendance records
        const { data: attendanceData, error: attendanceError } = await getStudentAttendanceByCourse(selectedCourse.id);
        
        if (attendanceError) {
          throw new Error(attendanceError.message);
        }
        
        setAttendanceRecords(attendanceData || []);
      } catch (error) {
        console.error('Error fetching students and attendance:', error);
        setError('Failed to load student data');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchStudentsAndAttendance();
  }, [selectedCourse]);

  // Handle course selection
  const handleCourseChange = (e) => {
    const courseId = e.target.value;
    const course = courses.find(c => c.id === courseId);
    setSelectedCourse(course);
  };

  return (
    <div className="bg-purple-100 min-h-screen">
      <div className="container mx-auto px-4 py-6">
        {/* Welcome Header */}
        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 border-l-4 border-purple-500 mb-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold">Student Management</h1>
              <p className="text-gray-600 text-sm sm:text-base">View and manage student attendance</p>
            </div>
            <div className="flex items-center bg-purple-50 px-3 py-2 rounded-lg border border-purple-100">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 text-white flex items-center justify-center mr-2">
                {profile?.first_name?.charAt(0) || 'T'}
              </div>
              <span className="text-sm font-medium">{profile?.first_name || 'Teacher'}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          {/* Main Content */}
          <div className="w-full">
            {/* Course Selection */}
            <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 border border-gray-100 mb-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
                <div className="flex items-center space-x-2">
                  <BookOpen size={18} className="text-purple-600" />
                  <h2 className="font-semibold">Course Selection</h2>
                </div>
                
                <div className="mt-4 md:mt-0 max-w-xs w-full">
                  {courses.length > 0 ? (
                    <select
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
                  ) : (
                    <div className="text-sm text-gray-500">No courses available</div>
                  )}
                </div>
              </div>
              
              {selectedCourse && (
                <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 text-white flex items-center justify-center mr-3">
                        {selectedCourse.name?.charAt(0) || 'C'}
                      </div>
                      <div>
                        <h3 className="font-medium text-purple-800">{selectedCourse.name}</h3>
                        <p className="text-sm text-purple-600">{selectedCourse.code}</p>
                      </div>
                    </div>
                    <div className="mt-4 md:mt-0 flex items-center">
                      <div className="flex items-center mr-3">
                        <Users size={16} className="mr-1 text-purple-500" />
                        <span className="text-sm">{students.length}</span>
                      </div>
                      <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium">
                        Active
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Student Data */}
            <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 border border-gray-100">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4 sm:mb-6">
                <div className="flex items-center space-x-2">
                  <Users size={18} className="text-purple-600" />
                  <h2 className="font-semibold text-sm sm:text-base">Student Listing</h2>
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
                    <span>Attendance report</span>
                  </button>
                </div>
              </div>
              
              {isLoading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
                </div>
              ) : error ? (
                <div className="bg-red-50 border-l-4 border-red-400 p-4 text-sm text-red-700">
                  {error}
                </div>
              ) : students.length === 0 ? (
                <div className="bg-gray-50 rounded-lg p-4 sm:p-8 text-center">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                    <Users size={24} className="text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Students Found</h3>
                  <p className="text-sm text-gray-600">
                    There are no students enrolled in this course yet.
                  </p>
                </div>
              ) : (
                <StudentList 
                  students={students} 
                  attendanceRecords={attendanceRecords} 
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherStudentList;