import { useState } from 'react';
import { markAttendance, validateAttendanceCode } from '../utils/supabaseClient';
import { useAuth } from '../context/AuthContext';
import { createAttendanceRecord } from '../utils/attendanceUtils';

const AttendanceForm = ({ onAttendanceMarked }) => {
  const { user, profile } = useAuth();
  const [attendanceCode, setAttendanceCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!attendanceCode.trim()) {
      setError('Please enter an attendance code');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');
      setSuccess('');

      // Validate the attendance code
      const { data: codeData, error: codeError } = await validateAttendanceCode(attendanceCode);

      if (codeError || !codeData) {
        setError('Invalid or expired attendance code');
        return;
      }

      // Create attendance record
      const attendanceData = createAttendanceRecord(
        user.id, 
        codeData.course_id,
        attendanceCode,
        codeData.id
      );

      // Record attendance
      const { data, error } = await markAttendance(attendanceData);

      if (error) {
        throw new Error(error.message);
      }

      // Success
      setSuccess('Attendance marked successfully!');
      setAttendanceCode('');
      
      // Notify parent component
      if (onAttendanceMarked) onAttendanceMarked(data);
    } catch (error) {
      console.error('Error marking attendance:', error);
      setError('Failed to mark attendance');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold mb-4">Mark Attendance</h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="attendanceCode" className="label">
            Enter Attendance Code
          </label>
          <input
            id="attendanceCode"
            type="text"
            value={attendanceCode}
            onChange={(e) => setAttendanceCode(e.target.value)}
            placeholder="Enter code or scan QR"
            className="input uppercase"
            maxLength={6}
          />
        </div>
        
        <button
          type="submit"
          disabled={isSubmitting}
          className="btn btn-primary w-full"
        >
          {isSubmitting ? 'Submitting...' : 'Mark Attendance'}
        </button>
        
        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-3 text-sm text-red-700">
            {error}
          </div>
        )}
        
        {success && (
          <div className="bg-green-50 border-l-4 border-green-400 p-3 text-sm text-green-700">
            {success}
          </div>
        )}
      </form>
    </div>
  );
};

export default AttendanceForm;