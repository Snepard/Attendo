import { useState, useEffect, useRef } from 'react';
import { Camera, QrCode, AlertTriangle } from 'lucide-react';

// This component uses an HTML5 QR Code scanner
// Note: You will need to install the html5-qrcode library:
// npm install html5-qrcode --save

const QRScanner = ({ onScan }) => {
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState('');
  const scannerRef = useRef(null);
  
  useEffect(() => {
    let html5QrCode;
    
    const startScanner = async () => {
      try {
        // Check if the browser supports media devices (camera)
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          setError('Camera access is not supported by your browser');
          return;
        }
        
        setScanning(true);
        setError('');
        
        // We need to dynamically import the library since it uses browser APIs
        // that might not be available during SSR
        const { Html5Qrcode } = await import('html5-qrcode');
        
        // Create instance of scanner
        html5QrCode = new Html5Qrcode("qr-reader");
        
        const qrCodeSuccessCallback = (decodedText) => {
          // Stop scanning
          html5QrCode.stop().then(() => {
            setScanning(false);
            // Pass the result to parent component
            onScan(decodedText);
          }).catch(err => {
            console.error("Failed to stop camera:", err);
          });
        };
        
        const config = { 
          fps: 10, 
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0
        };
        
        // Start scanning
        html5QrCode.start(
          { facingMode: "environment" }, // Use the back camera
          config,
          qrCodeSuccessCallback,
          (errorMessage) => {
            // QR scanning errors are not critical, so we just log them
            console.log(`QR Scan error: ${errorMessage}`);
          }
        ).catch(err => {
          setError(`Failed to start scanner: ${err}`);
          setScanning(false);
        });
      } catch (error) {
        console.error("QR Scanner error:", error);
        setError('Failed to initialize camera');
        setScanning(false);
      }
    };
    
    // Start the scanner when component mounts
    startScanner();
    
    // Cleanup function
    return () => {
      if (html5QrCode) {
        html5QrCode.stop().catch(err => {
          console.error("Failed to stop camera on unmount:", err);
        });
      }
    };
  }, [onScan]);
  
  return (
    <div className="qr-scanner">
      {error ? (
        <div className="bg-red-50 p-4 rounded-lg text-center">
          <div className="flex justify-center mb-2">
            <AlertTriangle size={24} className="text-red-500" />
          </div>
          <p className="text-red-600 text-sm">{error}</p>
          <button 
            onClick={() => setError('')}
            className="mt-3 bg-red-100 hover:bg-red-200 text-red-700 px-3 py-1 rounded-md text-xs"
          >
            Retry
          </button>
        </div>
      ) : (
        <>
          <div className="relative bg-gray-800 rounded-lg overflow-hidden">
            {/* QR Scanner container */}
            <div 
              id="qr-reader" 
              ref={scannerRef} 
              className="w-full aspect-square max-w-xs mx-auto overflow-hidden"
            ></div>
            
            {/* Scan overlay with targeting UI */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="w-full h-full flex items-center justify-center">
                <div className="border-2 border-white opacity-70 w-48 h-48 rounded-lg"></div>
              </div>
            </div>
          </div>
          
          {scanning ? (
            <div className="text-center mt-3">
              <div className="flex items-center justify-center text-xs text-gray-600">
                <div className="animate-pulse flex items-center">
                  <QrCode size={14} className="mr-1 text-purple-600" />
                  <span>Scanning...</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center mt-3">
              <div className="text-xs text-gray-600">Scanner initializing...</div>
            </div>
          )}
        </>
      )}
      
      <style jsx>{`
        /* Custom CSS for QR scanner */
        #qr-reader {
          width: 100%;
          max-width: 300px;
          margin: 0 auto;
        }
        #qr-reader video {
          object-fit: cover;
        }
        #qr-reader img {
          display: none; /* Hide QR scanner image */
        }
      `}</style>
    </div>
  );
};

export default QRScanner;