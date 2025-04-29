  import { useState, useEffect } from 'react';
  import { useAuth } from '../../context/AuthContext';
  import QRCodeGenerator from '../../components/QRCodeGenerator';
  import CourseForm from '../../components/CourseForm';
  import { getTeacherCourses } from '../../utils/supabaseClient';

  const TeacherDashboard = () => {
    const { user, profile } = useAuth();
    const [courses, setCourses] = useState([]);
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [showCourseForm, setShowCourseForm] = useState(false);
    
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
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Course Selection</h3>
                <button
                  onClick={() => setShowCourseForm(!showCourseForm)}
                  className="btn btn-sm btn-primary"
                >
                  {showCourseForm ? 'Cancel' : 'New Course'}
                </button>
              </div>
              
              {showCourseForm ? (
                <CourseForm onCourseCreated={handleCourseCreated} />
              ) : isLoading ? (
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
                  <button
                    onClick={() => setShowCourseForm(true)}
                    className="text-yellow-800 underline mt-2"
                  >
                    Create your first course
                  </button>
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
            
            {selectedCourse && !showCourseForm && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold mb-4">Course Overview</h3>
                
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
                      <span className="font-medium text-gray-900">
                        {selectedCourse.course_students?.length || 0}
                      </span>
                    </div>
                    <div className="mt-2 h-2 bg-gray-200 rounded-full">
                      <div
                        className="h-2 bg-primary-500 rounded-full"
                        style={{ 
                          width: `${Math.min(((selectedCourse.course_students?.length || 0) / 50) * 100, 100)}%` 
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Right Column - QR Code Generator */}
          <div className="lg:col-span-2">
            {selectedCourse && !showCourseForm ? (
              <QRCodeGenerator 
                courseId={selectedCourse.id} 
              />
            ) : (
              <div className="bg-white rounded-lg shadow-md p-6 text-center">
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Course Selected</h3>
                <p className="text-gray-600">
                  {showCourseForm 
                    ? 'Create a new course using the form on the left.'
                    : 'Please select a course to generate an attendance QR code.'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  export default TeacherDashboard;