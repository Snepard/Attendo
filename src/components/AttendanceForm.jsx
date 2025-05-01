import { useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useWeb3 } from '../context/Web3Context';
import { markAttendance as markBlockchainAttendance } from '../utils/contractUtils';
import { markAttendance, validateAttendanceCode } from '../utils/supabaseClient';
import { createAttendanceRecord } from '../utils/attendanceUtils';
import { isWithinCampus } from '../utils/locationUtils';
import QRScanner from './QRScanner';
import { QrCode } from 'lucide-react';

const AttendanceForm = ({ onAttendanceMarked }) => {
  const { user, profile } = useAuth();
  const { walletAddress, provider } = useWeb3();
  const [attendanceCode, setAttendanceCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showQRScanner, setShowQRScanner] = useState(false);

  const checkLocationAndMarkAttendance = async (codeData) => {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          
          // Add accuracy information to help debug location issues
          console.log('Location accuracy:', position.coords.accuracy, 'meters');
          
          if (!isWithinCampus(latitude, longitude)) {
            reject(new Error(`You must be within campus area to mark attendance. You are ${getDistanceFromLatLonInKm(
              latitude,
              longitude,
              CAMPUS_COORDINATES.latitude,
              CAMPUS_COORDINATES.longitude
            ).toFixed(2)}km from campus center`));
            return;
          }

          try {
            // Create attendance record
            const attendanceData = createAttendanceRecord(
              user.id, 
              codeData.course_id,
              attendanceCode,
              codeData.id
            );

            // Record attendance in database
            const { data, error } = await markAttendance(attendanceData);

            if (error) {
              throw error;
            }

            // Mark attendance on blockchain
            if (walletAddress && provider) {
              const signer = await provider.getSigner();
              await markBlockchainAttendance(signer, attendanceCode);
            }

            resolve(data);
          } catch (error) {
            reject(error);
          }
        },
        (error) => {
          console.error('Geolocation error:', error);
          reject(new Error('Please enable location access to mark attendance. Error: ' + error.message));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    });
  };

  const handleSubmit = async (e) => {
    if (e) {
      e.preventDefault();
    }
    
    if (!attendanceCode.trim()) {
      setError('Please enter an attendance code');
      return;
    }

    if (!walletAddress) {
      setError('Please connect your wallet to mark attendance');
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

      // Check location and mark attendance
      const data = await checkLocationAndMarkAttendance(codeData);

      // Success
      setSuccess('Attendance marked successfully on both database and blockchain!');
      setAttendanceCode('');
      
      // Notify parent component
      if (onAttendanceMarked) onAttendanceMarked(data);
      
      // Hide QR scanner if it was open
      setShowQRScanner(false);
    } catch (error) {
      console.error('Error marking attendance:', error);
      setError(error.message || 'Failed to mark attendance');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQRCodeScanned = (code) => {
    console.log("QR code received in AttendanceForm:", code);
    setAttendanceCode(code);
    setShowQRScanner(false);
    
    // Auto-submit with a small delay to allow state update
    setTimeout(() => {
      console.log("Auto-submitting with code:", code);
      handleSubmit();
    }, 800);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold mb-4">Mark Attendance</h3>
      
      {showQRScanner ? (
        <div className="mb-4">
          <QRScanner 
            onScan={(code) => {
              console.log("QR Code detected:", code);
              handleQRCodeScanned(code);
            }} 
          />
          <button 
            onClick={() => {
              console.log("Cancelling QR scanner");
              setShowQRScanner(false);
            }}
            className="btn btn-secondary w-full mt-2"
          >
            Cancel Scan
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="attendanceCode" className="label">
              Enter Attendance Code
            </label>
            <div className="flex space-x-2">
              <input
                id="attendanceCode"
                type="text"
                value={attendanceCode}
                onChange={(e) => setAttendanceCode(e.target.value.toUpperCase())}
                placeholder="Enter code or scan QR"
                className="input uppercase flex-1"
                maxLength={6}
              />
              <button
                type="button"
                onClick={() => {
                  console.log("Opening QR scanner");
                  setShowQRScanner(true);
                }}
                className="btn btn-secondary px-3"
                aria-label="Scan QR Code"
              >
                <QrCode size={20} />
              </button>
            </div>
          </div>
          
          <button
            type="submit"
            disabled={isSubmitting || !walletAddress}
            className="btn btn-primary w-full"
          >
            {isSubmitting ? 'Submitting...' : 'Mark Attendance'}
          </button>
          
          {!walletAddress && (
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 text-sm text-yellow-700">
              Please connect your wallet to mark attendance
            </div>
          )}
          
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
      )}
    </div>
  );
};

export default AttendanceForm;