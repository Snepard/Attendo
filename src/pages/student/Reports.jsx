import { useState } from 'react';
import { FileText, Download, Calendar, BarChart2, Filter } from 'lucide-react';

const Reports = () => {
  const [selectedReport, setSelectedReport] = useState('attendance');
  const [dateRange, setDateRange] = useState('month');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateReport = async () => {
    setIsGenerating(true);
    // Simulate report generation
    setTimeout(() => {
      setIsGenerating(false);
      alert('Report generation feature will be implemented soon!');
    }, 2000);
  };

  return (
    <div className="bg-purple-100 min-h-screen py-8">
      <div className="container mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Generate Reports</h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Report Type</label>
              <div className="space-y-2">
                <button
                  onClick={() => setSelectedReport('attendance')}
                  className={`w-full p-3 flex items-center rounded-lg border ${
                    selectedReport === 'attendance'
                      ? 'border-purple-500 bg-purple-50 text-purple-700'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <Calendar size={20} className="mr-3" />
                  <div className="text-left">
                    <div className="font-medium">Attendance Report</div>
                    <div className="text-sm text-gray-500">Detailed attendance statistics and patterns</div>
                  </div>
                </button>

                <button
                  onClick={() => setSelectedReport('performance')}
                  className={`w-full p-3 flex items-center rounded-lg border ${
                    selectedReport === 'performance'
                      ? 'border-purple-500 bg-purple-50 text-purple-700'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <BarChart2 size={20} className="mr-3" />
                  <div className="text-left">
                    <div className="font-medium">Performance Report</div>
                    <div className="text-sm text-gray-500">Academic performance and progress tracking</div>
                  </div>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Time Period</label>
              <div className="space-y-2">
                {['week', 'month', 'semester', 'year'].map((period) => (
                  <button
                    key={period}
                    onClick={() => setDateRange(period)}
                    className={`w-full p-3 flex items-center rounded-lg border ${
                      dateRange === period
                        ? 'border-purple-500 bg-purple-50 text-purple-700'
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <Filter size={20} className="mr-3" />
                    <span className="capitalize">{period}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="border-t pt-6">
            <button
              onClick={handleGenerateReport}
              disabled={isGenerating}
              className="w-full sm:w-auto bg-purple-600 text-white px-8 py-3 rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGenerating ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                  <span>Generating Report...</span>
                </>
              ) : (
                <>
                  <FileText size={20} />
                  <span>Generate Report</span>
                </>
              )}
            </button>

            <p className="mt-4 text-sm text-gray-500 text-center">
              Reports are generated in PDF format and include detailed analytics and visualizations.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;