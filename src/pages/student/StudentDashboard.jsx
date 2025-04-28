import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import WalletConnect from '../../components/WalletConnect';
import AttendanceForm from '../../components/AttendanceForm';
import AttendanceCard from '../../components/AttendanceCard';
import { getStudentAttendance } from '../../utils/supabaseClient';

const StudentDashboard = () => {
  const { user, profile } = useAuth();
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Student Dashboard</h1>
        <p className="text-gray-600">
          Welcome back, {profile?.first_name || 'Student'}!
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Wallet and Attendance Marking */}
        <div className="lg:col-span-1 space-y-6">
          <WalletConnect />
          <AttendanceForm onAttendanceMarked={handleAttendanceMarked} />
        </div>
        
        {/* Right Column - Attendance History */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold mb-4">Your Attendance History</h2>
            
            {isLoading ? (
              <div className="flex justify-center items-center h-40">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
              </div>
            ) : error ? (
              <div className="bg-red-50 border-l-4 border-red-400 p-4 text-sm text-red-700">
                {error}
              </div>
            ) : attendanceRecords.length === 0 ? (
              <div className="bg-gray-50 rounded-lg p-8 text-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No attendance records yet</h3>
                <p className="text-gray-600">
                  Your attendance history will appear here after you mark your first attendance.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {attendanceRecords.map((record) => (
                  <AttendanceCard key={record.id} attendance={record} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;