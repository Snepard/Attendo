import { useState } from 'react';
import { Download, FileText, Calendar } from 'lucide-react';

const Transcript = () => {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleDownload = async () => {
    setIsGenerating(true);
    // Simulate download delay
    setTimeout(() => {
      setIsGenerating(false);
      // Here you would normally trigger the actual download
      alert('Transcript download feature will be implemented soon!');
    }, 2000);
  };

  return (
    <div className="bg-purple-100 min-h-screen py-8">
      <div className="container mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-center max-w-2xl mx-auto">
            <FileText className="mx-auto text-purple-600 mb-4" size={48} />
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Academic Transcript</h1>
            <p className="text-gray-600 mb-8">
              Download your official academic transcript with attendance records and course details.
            </p>

            <div className="space-y-4">
              <button
                onClick={handleDownload}
                disabled={isGenerating}
                className="w-full sm:w-auto bg-purple-600 text-white px-8 py-3 rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGenerating ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                    <span>Generating...</span>
                  </>
                ) : (
                  <>
                    <Download size={20} />
                    <span>Download Transcript</span>
                  </>
                )}
              </button>

              <p className="text-sm text-gray-500">
                Your transcript will include all verified attendance records and academic performance data.
              </p>
            </div>

            <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-purple-50 p-6 rounded-lg">
                <Calendar className="text-purple-600 mb-2" size={24} />
                <h3 className="font-semibold mb-2">Attendance Summary</h3>
                <p className="text-sm text-gray-600">
                  View your complete attendance history and performance metrics.
                </p>
              </div>

              <div className="bg-purple-50 p-6 rounded-lg">
                <FileText className="text-purple-600 mb-2" size={24} />
                <h3 className="font-semibold mb-2">Course Details</h3>
                <p className="text-sm text-gray-600">
                  Access detailed information about your enrolled courses and academic progress.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Transcript;