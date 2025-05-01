import { v4 as uuidv4 } from 'uuid';
import { format, parseISO } from 'date-fns';

// Generate a unique code for attendance
export const generateUniqueCode = () => {
  // Generate a random 6-character code
  const code = Math.random().toString(36).substring(2, 8).toUpperCase();
  return code;
};

// Validate attendance code with timestamp
export const validateAttendanceCode = (code) => {
  if (!code) return false;
  
  const [baseCode, timestamp] = code.split('-');
  if (!baseCode || !timestamp) return false;
  
  const codeTime = parseInt(timestamp);
  const now = Date.now();
  const timeDiff = now - codeTime;
  
  // Code must be less than 7 seconds old
  return timeDiff <= 7000;
};

// Format date for display
export const formatDate = (dateString) => {
  try {
    const date = parseISO(dateString);
    return format(date, 'PPP');
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid Date';
  }
};

// Format time for display
export const formatTime = (dateString) => {
  try {
    const date = parseISO(dateString);
    return format(date, 'p');
  } catch (error) {
    console.error('Error formatting time:', error);
    return 'Invalid Time';
  }
};

// Format date and time for display
export const formatDateTime = (dateString) => {
  try {
    const date = parseISO(dateString);
    return format(date, 'PPp');
  } catch (error) {
    console.error('Error formatting date and time:', error);
    return 'Invalid Date/Time';
  }
};

// Calculate time remaining in minutes and seconds
export const calculateTimeRemaining = (expiryTime) => {
  const now = new Date();
  const expiry = new Date(expiryTime);
  const diffMs = expiry - now;
  
  // If expired
  if (diffMs <= 0) {
    return { minutes: 0, seconds: 0, expired: true };
  }
  
  const minutes = Math.floor(diffMs / 60000);
  const seconds = Math.floor((diffMs % 60000) / 1000);
  
  return { minutes, seconds, expired: false };
};

// Create attendance record object
export const createAttendanceRecord = (studentId, courseId, code, sessionId) => {
  return {
    id: uuidv4(),
    student_id: studentId,
    course_id: courseId,
    code: code,
    session_id: sessionId,
    created_at: new Date().toISOString(),
    time_in: new Date().toISOString(),
  };
};

// Calculate attendance statistics
export const calculateAttendanceStats = (records) => {
  if (!records?.length) return { present: 0, late: 0, absent: 0 };
  
  const total = records.length;
  const present = records.filter(r => !r.is_late).length;
  const late = records.filter(r => r.is_late).length;
  
  return {
    present: Math.round((present / total) * 100),
    late: Math.round((late / total) * 100),
    absent: Math.round(((total - present - late) / total) * 100)
  };
};

// Generate monthly attendance data
export const generateMonthlyAttendanceData = (records) => {
  const months = Array.from({ length: 12 }, (_, i) => {
    const date = new Date();
    date.setMonth(i);
    return format(date, 'MMM');
  });

  const data = months.map(month => {
    const monthRecords = records.filter(r => {
      const recordDate = parseISO(r.created_at);
      return format(recordDate, 'MMM') === month;
    });

    return {
      month,
      total: monthRecords.length,
      present: monthRecords.filter(r => !r.is_late).length,
      late: monthRecords.filter(r => r.is_late).length
    };
  });

  return data;
};