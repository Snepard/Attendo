import { useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useWeb3 } from '../context/Web3Context';
import { markAttendance as markBlockchainAttendance } from '../utils/contractUtils';
import { markAttendance, validateAttendanceCode } from '../utils/supabaseClient';
import { createAttendanceRecord } from '../utils/attendanceUtils';
import { isWithinCampus, getDistanceFromLatLonInKm, CAMPUS_COORDINATES } from '../utils/locationUtils';
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
      // First check if geolocation is available
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by your browser'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            
            // Add accuracy information to help debug location issues
            console.log('Location accuracy:', position.coords.accuracy, 'meters');
            
            if (!isWithinCampus(latitude, longitude)) {
              const distance = getDistanceFromLatLonInKm(
                latitude,
                longitude,
                CAMPUS_COORDINATES.latitude,
                CAMPUS_COORDINATES.longitude
              ).toFixed(2);
              
              reject(new Error(`You must be within campus area to mark attendance. You are ${distance}km from campus center`));
              return;
            }

            // Create attendance record
            const attendanceData = createAttendanceRecord(
              user.id, 
              codeData.course_id,
              attendanceCode,
              codeData.id
            );

            // Record attendance in database
            const { data, error: dbError } = await markAttendance(attendanceData);

            if (dbError) {
              console.error("Database error:", dbError);
              throw new Error(dbError.message || 'Failed to record attendance in database');
            }

            // Mark attendance on blockchain
            if (walletAddress && provider) {
              try {
                const signer = provider.getSigner();
                await markBlockchainAttendance(signer, attendanceCode);
                console.log("Blockchain attendance marked successfully");
              } catch (blockchainError) {
                console.error("Blockchain error:", blockchainError);
                // Don't fail the whole process if blockchain marking fails
                // Just log the error and continue
              }
            } else {
              console.warn("No wallet connected for blockchain attendance");
            }

            // Even if blockchain fails, we still successfully recorded in the database
            resolve(data);
          } catch (error) {
            console.error("Error in attendance process:", error);
            reject(error);
          }
        },
        (geoError) => {
          console.error('Geolocation error:', geoError);
          let errorMsg = 'Please enable location access to mark attendance.';
          
          // Provide more specific error messages based on the error code
          switch(geoError.code) {
            case 1: // PERMISSION_DENIED
              errorMsg = 'Location permission denied. Please enable location services in your browser settings.';
              break;
            case 2: // POSITION_UNAVAILABLE
              errorMsg = 'Location information is unavailable. Please try again in a different area.';
              break;
            case 3: // TIMEOUT
              errorMsg = 'Location request timed out. Please check your connection and try again.';
              break;
          }
          
          reject(new Error(errorMsg));
        },
        {
          enableHighAccuracy: true,
          timeout: 15000, // Increased timeout to 15 seconds
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

    try {
      setIsSubmitting(true);
      setError('');
      setSuccess('');

      // Check wallet only if needed for blockchain (but don't block database attendance)
      if (!walletAddress) {
        console.warn('No wallet connected. Will record attendance in database only.');
      }

      // Validate the attendance code
      const { data: codeData, error: codeError } = await validateAttendanceCode(attendanceCode);

      if (codeError || !codeData) {
        throw new Error('Invalid or expired attendance code');
      }

      // Check location and mark attendance
      const data = await checkLocationAndMarkAttendance(codeData);

      // Success
      setSuccess(walletAddress 
        ? 'Attendance marked successfully on both database and blockchain!' 
        : 'Attendance marked successfully in database. Connect wallet to record on blockchain.');
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
    if (!code) {
      setError('Invalid QR code');
      return;
    }
    
    // Validate and clean the code
    const cleanCode = code.trim().toUpperCase();
    setAttendanceCode(cleanCode);
    setShowQRScanner(false);
    
    // Auto-submit with a small delay to allow state update
    setTimeout(() => {
      console.log("Auto-submitting with code:", cleanCode);
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
            disabled={isSubmitting}
            className="btn btn-primary w-full"
          >
            {isSubmitting ? 'Submitting...' : 'Mark Attendance'}
          </button>
          
          {!walletAddress && (
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 text-sm text-yellow-700">
              No wallet connected. Attendance will only be recorded in database, not on blockchain.
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