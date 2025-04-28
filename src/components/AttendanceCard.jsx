import { formatDateTime } from '../utils/attendanceUtils';

const AttendanceCard = ({ attendance }) => {
  if (!attendance) return null;

  return (
    <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-primary-500 transition-all hover:shadow-lg">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-medium">{attendance.course_name || 'Course'}</h3>
          <p className="text-sm text-gray-600">{formatDateTime(attendance.created_at)}</p>
        </div>
        <div className="bg-primary-100 text-primary-800 text-xs px-2 py-1 rounded-full">
          Present
        </div>
      </div>
      
      {attendance.location && (
        <div className="mt-2 text-xs text-gray-500">
          Location: {attendance.location}
        </div>
      )}
    </div>
  );
};

export default AttendanceCard;