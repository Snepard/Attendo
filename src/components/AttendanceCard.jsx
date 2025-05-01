import { formatDateTime } from '../utils/attendanceUtils';

const AttendanceCard = ({ attendance }) => {
  if (!attendance) return null;

  return (
    <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-primary-500 transition-all hover:shadow-lg">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-medium">{attendance.course_name || 'Course'}</h3>
          <p className="text-sm text-gray-600">{formatDateTime(attendance.created_at)}</p>
          <div className="mt-2 flex items-center space-x-4 text-xs text-gray-500">
            <div>
              <span className="font-medium">Time In:</span> {formatDateTime(attendance.time_in)}
            </div>
            {attendance.time_out && (
              <div>
                <span className="font-medium">Time Out:</span> {formatDateTime(attendance.time_out)}
              </div>
            )}
          </div>
        </div>
        <div className={`px-2 py-1 rounded-full text-xs ${
          attendance.is_late 
            ? 'bg-yellow-100 text-yellow-800' 
            : 'bg-green-100 text-green-800'
        }`}>
          {attendance.is_late ? 'Late' : 'Present'}
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