import { useState, useEffect } from 'react';
import QRCode from 'react-qr-code';
import { calculateTimeRemaining, generateUniqueCode } from '../utils/attendanceUtils';
import { createAttendanceCode } from '../utils/supabaseClient';
import { useAuth } from '../context/AuthContext';
import { useWeb3 } from '../context/Web3Context';
import { updateAttendanceCode } from '../utils/contractUtils';

const QRCodeGenerator = ({ courseId, onCodeGenerated }) => {
  const { user } = useAuth();
  const { walletAddress, provider } = useWeb3();
  const [attendanceCode, setAttendanceCode] = useState('');
  const [expiryTime, setExpiryTime] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState({ minutes: 0, seconds: 0, expired: true });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Update the countdown timer
  useEffect(() => {
    if (!expiryTime) return;

    const timer = setInterval(() => {
      const remaining = calculateTimeRemaining(expiryTime);
      setTimeRemaining(remaining);

      if (remaining.expired) {
        clearInterval(timer);
        setAttendanceCode('');
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [expiryTime]);

  const generateCode = async () => {
    if (!walletAddress) {
      setError('Please connect your wallet to generate attendance code');
      return;
    }

    try {
      setIsLoading(true);
      setError('');

      // Generate a unique code
      const code = generateUniqueCode();
      const validityMinutes = 5;

      // Update code on blockchain
      const signer = await provider.getSigner();
      await updateAttendanceCode(signer, code, validityMinutes);

      // Save to database
      const { data, error } = await createAttendanceCode({
        teacherId: user.id,
        courseId,
        code,
        validityMinutes
      });

      if (error) {
        throw new Error(error.message);
      }

      // Set the code and expiry time
      setAttendanceCode(code);
      
      // Calculate expiry time (5 minutes from now)
      const expiry = new Date();
      expiry.setMinutes(expiry.getMinutes() + validityMinutes);
      setExpiryTime(expiry);

      // Update parent component
      onCodeGenerated(code, expiry);
    } catch (error) {
      console.error('Error generating attendance code:', error);
      setError('Failed to generate attendance code');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 text-center">
      <h3 className="text-lg font-semibold mb-4">Attendance QR Code</h3>

      {!walletAddress && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 text-sm text-yellow-700 mb-4">
          Please connect your wallet to generate attendance codes
        </div>
      )}

      {attendanceCode ? (
        <div className="space-y-4">
          <div className="bg-white p-3 rounded-lg inline-block mx-auto">
            <QRCode value={attendanceCode} size={200} />
          </div>
          
          <div className="mt-4">
            <p className="text-sm text-gray-600 mb-2">Or share this code with students:</p>
            <div className="bg-gray-100 py-3 px-4 rounded-md code-container">
              {attendanceCode}
            </div>
          </div>
          
          <div className="mt-4">
            <p className="text-sm text-gray-600">Code expires in:</p>
            <p className="text-xl font-semibold text-primary-600">
              {timeRemaining.minutes}:{timeRemaining.seconds < 10 ? `0${timeRemaining.seconds}` : timeRemaining.seconds}
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-gray-600 mb-4">
            Generate a QR code for students to scan and mark their attendance.
          </p>
          
          <button
            onClick={generateCode}
            disabled={isLoading || !walletAddress}
            className="btn btn-primary w-full"
          >
            {isLoading ? 'Generating...' : 'Generate QR Code'}
          </button>
          
          {error && <p className="text-error-500 text-sm mt-2">{error}</p>}
        </div>
      )}
    </div>
  );
};

export default QRCodeGenerator;