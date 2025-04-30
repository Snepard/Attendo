import { useState, useEffect, useRef } from 'react';
import { Camera, QrCode, AlertTriangle } from 'lucide-react';

// This component uses an HTML5 QR Code scanner
// npm install html5-qrcode --save

const QRScanner = ({ onScan }) => {
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState('');
  const html5QrCodeRef = useRef(null);
  
  useEffect(() => {
    // Clean up any existing scanner instances first
    const existingElement = document.getElementById('qr-reader');
    if (existingElement) {
      while (existingElement.firstChild) {
        existingElement.removeChild(existingElement.firstChild);
      }
    }
    
    let scanner = null;
    
    const initScanner = async () => {
      try {
        // Check if the browser supports media devices
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          setError('Camera access is not supported by your browser');
          return;
        }
        
        // Dynamically import the library
        const { Html5Qrcode } = await import('html5-qrcode');
        
        // Create a new scanner instance
        scanner = new Html5Qrcode("qr-reader");
        html5QrCodeRef.current = scanner;
        
        setScanning(true);
        
        const qrCodeSuccessCallback = (decodedText) => {
          console.log("QR Code scanned successfully:", decodedText);
          
          // Send result to parent
          onScan(decodedText);
          
          // Stop scanner if running
          if (scanner && scanner.isScanning) {
            scanner.stop().then(() => {
              console.log("Scanner stopped");
            }).catch(err => {
              console.error("Error stopping scanner:", err);
            });
          }
        };
        
        const config = { 
          fps: 10, 
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0
        };
        
        // Start scanning
        await scanner.start(
          { facingMode: "environment" },
          config,
          qrCodeSuccessCallback,
          (errorMessage) => {
            // QR scanning errors are not critical
            console.log(`QR Scan error: ${errorMessage}`);
          }
        );
      } catch (error) {
        console.error("QR Scanner error:", error);
        setError('Failed to initialize camera. Please check camera permissions.');
        setScanning(false);
      }
    };
    
    // Start scanner on mount
    initScanner();
    
    // Clean up on unmount
    return () => {
      if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
        html5QrCodeRef.current.stop().catch(err => {
          console.error("Failed to stop camera on unmount:", err);
        });
      }
    };
  }, []); // Empty array means this runs once on mount
  
  const handleRetry = () => {
    setError('');
    // Force refresh by re-mounting component
    if (html5QrCodeRef.current) {
      html5QrCodeRef.current.clear();
      html5QrCodeRef.current = null;
    }
    window.location.reload(); // If necessary, reload the page
  };
  
  return (
    <div className="qr-scanner">
      {error ? (
        <div className="bg-red-50 p-4 rounded-lg text-center">
          <div className="flex justify-center mb-2">
            <AlertTriangle size={24} className="text-red-500" />
          </div>
          <p className="text-red-600 text-sm">{error}</p>
          <button 
            onClick={handleRetry}
            className="mt-3 bg-red-100 hover:bg-red-200 text-red-700 px-3 py-1 rounded-md text-xs"
          >
            Retry
          </button>
        </div>
      ) : (
        <>
          <div className="relative bg-gray-800 rounded-lg overflow-hidden">
            {/* QR Scanner container - must have this exact ID */}
            <div 
              id="qr-reader" 
              className="w-full aspect-square max-w-xs mx-auto overflow-hidden"
            ></div>
            
            {/* Scan overlay with targeting UI */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="w-full h-full flex items-center justify-center">
                <div className="border-2 border-white opacity-70 w-48 h-48 rounded-lg"></div>
              </div>
            </div>
          </div>
          
          <div className="text-center mt-3">
            <div className="flex items-center justify-center text-xs text-gray-600">
              <div className="animate-pulse flex items-center">
                <QrCode size={14} className="mr-1 text-purple-600" />
                <span>Scanning...</span>
              </div>
            </div>
          </div>
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