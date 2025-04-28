import { v4 as uuidv4 } from 'uuid';
import { format } from 'date-fns';

// Generate a unique code for attendance
export const generateUniqueCode = () => {
  // Generate a random 6-character code
  const code = Math.random().toString(36).substring(2, 8).toUpperCase();
  return code;
};

// Format date for display
export const formatDate = (date) => {
  return format(new Date(date), 'PPP');
};

// Format time for display
export const formatTime = (date) => {
  return format(new Date(date), 'p');
};

// Format date and time for display
export const formatDateTime = (date) => {
  return format(new Date(date), 'PPp');
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
  };
};