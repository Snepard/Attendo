import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getStudentAttendance } from '../../utils/supabaseClient';
import { Calendar, Download, FileText, Search } from 'lucide-react';

const AttendanceRecords = () => {
  const { user } = useAuth();
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

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

  const filteredRecords = attendanceRecords.filter(record => 
    record.course_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    new Date(record.created_at).toLocaleDateString().includes(searchTerm)
  );

  return (
    <div className="bg-purple-100 min-h-screen py-8">
      <div className="container mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-4 sm:mb-0">Attendance Records</h1>
            <div className="flex space-x-2">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search records..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
              </div>
              <button className="bg-purple-100 text-purple-600 px-4 py-2 rounded-lg hover:bg-purple-200 transition-colors flex items-center">
                <Download size={18} className="mr-2" />
                Export
              </button>
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
            </div>
          ) : error ? (
            <div className="bg-red-50 border-l-4 border-red-400 p-4 text-red-700">
              {error}
            </div>
          ) : filteredRecords.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="mx-auto text-gray-400 mb-4" size={48} />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No attendance records found</h3>
              <p className="text-gray-500">No matching records for your search criteria.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredRecords.map((record) => (
                    <tr key={record.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(record.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {record.course_name || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          record.is_late 
                            ? 'bg-yellow-100 text-yellow-800' 
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {record.is_late ? 'Late' : 'On Time'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(record.created_at).toLocaleTimeString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {record.location || 'Campus'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AttendanceRecords;