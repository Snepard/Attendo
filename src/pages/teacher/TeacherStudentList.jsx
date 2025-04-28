import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import StudentList from '../../components/StudentList';
import { getTeacherCourses, getStudentsByCourse, getStudentAttendanceByCourse } from '../../utils/supabaseClient';

const TeacherStudentList = () => {
  const { user } = useAuth();
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
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Student Management</h1>
        <p className="text-gray-600">
          View and manage student attendance
        </p>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <h2 className="text-lg font-semibold">Course Selection</h2>
          
          <div className="mt-4 md:mt-0 max-w-xs">
            {courses.length > 0 ? (
              <select
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
            ) : (
              <div className="text-sm text-gray-500">No courses available</div>
            )}
          </div>
        </div>
        
        {selectedCourse && (
          <div className="bg-primary-50 p-4 rounded-lg border border-primary-100">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <h3 className="font-medium text-primary-800">{selectedCourse.name}</h3>
                <p className="text-sm text-primary-600">{selectedCourse.code}</p>
              </div>
              <div className="mt-4 md:mt-0">
                <span className="bg-primary-100 text-primary-800 px-3 py-1 rounded-full text-sm">
                  {students.length} Students
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 text-sm text-red-700">
          {error}
        </div>
      ) : students.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Students Found</h3>
          <p className="text-gray-600">
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
  );
};

export default TeacherStudentList;