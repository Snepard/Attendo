import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import QRCodeGenerator from '../../components/QRCodeGenerator';
import { getTeacherCourses } from '../../utils/supabaseClient';

const TeacherDashboard = () => {
  const { user, profile } = useAuth();
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [attendanceCode, setAttendanceCode] = useState('');
  const [codeExpiry, setCodeExpiry] = useState(null);
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

  // Handle course selection
  const handleCourseChange = (e) => {
    const courseId = e.target.value;
    const course = courses.find(c => c.id === courseId);
    setSelectedCourse(course);
    // Reset code when changing course
    setAttendanceCode('');
    setCodeExpiry(null);
  };

  // Handle code generation
  const handleCodeGenerated = (code, expiry) => {
    setAttendanceCode(code);
    setCodeExpiry(expiry);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Teacher Dashboard</h1>
        <p className="text-gray-600">
          Welcome back, {profile?.first_name || 'Teacher'}!
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Course Selection and Stats */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4">Course Selection</h3>
            
            {isLoading ? (
              <div className="flex justify-center items-center h-20">
                <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-primary-500"></div>
              </div>
            ) : error ? (
              <div className="bg-red-50 border-l-4 border-red-400 p-4 text-sm text-red-700">
                {error}
              </div>
            ) : courses.length === 0 ? (
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 text-sm text-yellow-700">
                <p>You don't have any courses yet.</p>
              </div>
            ) : (
              <div>
                <label htmlFor="courseSelect" className="label">
                  Select a course to generate attendance code
                </label>
                <select
                  id="courseSelect"
                  value={selectedCourse?.id || ''}
                  onChange={handleCourseChange}
                  className="input"
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
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4">Course Overview</h3>
            
            {selectedCourse ? (
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Course Name</h4>
                  <p className="text-gray-900 font-medium">{selectedCourse.name}</p>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Course Code</h4>
                  <p className="text-gray-900 font-medium">{selectedCourse.code}</p>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Schedule</h4>
                  <p className="text-gray-900">{selectedCourse.schedule || 'Not specified'}</p>
                </div>
                
                <div className="pt-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-gray-500">Students Enrolled</span>
                    <span className="font-medium text-gray-900">{selectedCourse.student_count || 0}</span>
                  </div>
                  <div className="mt-2 h-2 bg-gray-200 rounded-full">
                    <div
                      className="h-2 bg-primary-500 rounded-full"
                      style={{ width: `${Math.min((selectedCourse.student_count || 0) / 50 * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-gray-500 italic">Select a course to view details</p>
            )}
          </div>
        </div>
        
        {/* Right Column - QR Code Generator */}
        <div className="lg:col-span-2 space-y-6">
          {selectedCourse ? (
            <QRCodeGenerator 
              courseId={selectedCourse.id} 
              onCodeGenerated={handleCodeGenerated} 
            />
          ) : (
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Course Selected</h3>
              <p className="text-gray-600">
                Please select a course to generate an attendance QR code.
              </p>
            </div>
          )}
          
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-4 bg-primary-50 border-b border-primary-100">
              <h3 className="text-lg font-semibold text-primary-800">Recent Activity</h3>
            </div>
            <div className="p-6">
              {attendanceCode ? (
                <div className="bg-green-50 border-l-4 border-green-400 p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-green-700">
                        Attendance code <span className="font-mono font-medium">{attendanceCode}</span> generated for {selectedCourse?.name}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500 italic">No recent activity</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;