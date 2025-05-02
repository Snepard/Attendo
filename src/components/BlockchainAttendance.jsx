import { useState, useEffect } from 'react';
import { useWeb3 } from '../context/Web3Context';
import { checkAttendanceStatus, isTeacher } from '../utils/contractUtils';

const BlockchainAttendance = () => {
  const { walletAddress, provider } = useWeb3();
  const [attendanceData, setAttendanceData] = useState(null);
  const [isTeacherAccount, setIsTeacherAccount] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAttendanceData = async () => {
      if (!walletAddress || !provider) return;

      try {
        setIsLoading(true);
        setError('');

        // Check if the address is teacher
        const teacherCheck = await isTeacher(provider, walletAddress);
        setIsTeacherAccount(teacherCheck);

        // Get attendance status
        const status = await checkAttendanceStatus(provider, walletAddress);
        setAttendanceData(status);
      } catch (error) {
        console.error('Error fetching blockchain attendance:', error);
        // setError('Failed to fetch blockchain attendance data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAttendanceData();
  }, [walletAddress, provider]);

  if (!walletAddress) {
    return (
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 text-sm text-yellow-700">
        Please connect your wallet to view blockchain attendance records.
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-400 p-4 text-sm text-red-700">
        {error}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold mb-4">Blockchain Attendance Records</h3>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <span className="text-gray-600">Role</span>
          <span className="font-medium">{isTeacherAccount ? 'Teacher' : 'Student'}</span>
        </div>
        
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <span className="text-gray-600">Total Attendance Marked</span>
          <span className="font-medium">{attendanceData?.count?.toString() || '0'}</span>
        </div>
        
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <span className="text-gray-600">Current Session Status</span>
          <span className={`px-2 py-1 rounded-full text-sm ${
            attendanceData?.hasMarked 
              ? 'bg-green-100 text-green-800' 
              : 'bg-yellow-100 text-yellow-800'
          }`}>
            {attendanceData?.hasMarked ? 'Marked' : 'Not Marked'}
          </span>
        </div>
      </div>
      
      <div className="mt-4 pt-4 border-t border-gray-100">
        <p className="text-xs text-gray-500">
          These records are stored on the blockchain and cannot be modified.
        </p>
      </div>
    </div>
  );
};

export default BlockchainAttendance;