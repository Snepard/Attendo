import { useState, useEffect, useCallback, useRef } from 'react';
import QRCode from 'react-qr-code';
import { useAuth } from '../context/AuthContext';
import { useWeb3 } from '../context/Web3Context';
import { updateAttendanceCode } from '../utils/contractUtils';
import { createAttendanceCode } from '../utils/supabaseClient';
import { generateUniqueCode } from '../utils/attendanceUtils';
import { QrCode, ExternalLink, AlertCircle } from 'lucide-react';

const QRCodeGenerator = ({ courseId, onCodeGenerated }) => {
  const { user } = useAuth();
  const { walletAddress, provider } = useWeb3();
  const [attendanceCode, setAttendanceCode] = useState('');
  const [expiryTime, setExpiryTime] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState({ seconds: 7, expired: false });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [debugInfo, setDebugInfo] = useState('');
  const [blockchainTxHash, setBlockchainTxHash] = useState('');
  const [isActive, setIsActive] = useState(false);
  
  // Batch configuration
  const [batchSize, setBatchSize] = useState(5); // Smaller batch size to start
  const [rotationCount, setRotationCount] = useState(0);
  const [batchCodes, setBatchCodes] = useState([]);
  const [batchSubmitted, setBatchSubmitted] = useState(false);
  const [nextBatchTime, setNextBatchTime] = useState(null);
  
  // Debug mode
  const [showDebug, setShowDebug] = useState(false);
  const timerRef = useRef(null);

  // Add debug logging
  const log = useCallback((message, data = null) => {
    console.log(`[QRCodeGenerator] ${message}`, data || '');
    setDebugInfo(prev => `${new Date().toLocaleTimeString()}: ${message}\n${prev}`);
  }, []);

  // Generate a single code
  const generateSingleCode = useCallback(() => {
    try {
      const timestamp = Date.now();
      const baseCode = generateUniqueCode();
      const code = `${baseCode}-${timestamp}`;
      log(`Generated code: ${baseCode}`);
      return code;
    } catch (error) {
      log(`Error generating code: ${error.message}`);
      setError(`Error generating code: ${error.message}`);
      return null;
    }
  }, [log]);

  // Submit batch of codes to blockchain
  const submitBatch = useCallback(async (codes) => {
    if (!walletAddress || !provider || codes.length === 0) {
      log('Cannot submit batch: Missing wallet, provider, or codes');
      return false;
    }

    try {
      setIsLoading(true);
      setError('');
      log(`Submitting batch of ${codes.length} codes to blockchain`);

      // Get the signer
      const signer = await provider.getSigner();
      log('Got signer from provider');

      // Update contract with batch
      log('Calling updateAttendanceCode with batch');
      const result = await updateAttendanceCode(signer, JSON.stringify(codes), batchSize);
      
      if (result?.success) {
        setBlockchainTxHash(result.hash);
        log(`Transaction successful: ${result.hash}`);
        
        // Save to database
        for (const code of codes) {
          log(`Saving code to database: ${code.substring(0, 6)}...`);
          try {
            const { error: dbError } = await createAttendanceCode({
              teacherId: user?.id,
              courseId,
              code,
              validityMinutes: Math.ceil((batchSize * 7) / 60)
            });

            if (dbError) {
              log(`Database error: ${dbError.message}`);
            }
          } catch (dbError) {
            log(`Database exception: ${dbError.message}`);
          }
        }
        
        setBatchSubmitted(true);
        log('Batch submitted successfully');
        return true;
      } else {
        log('Contract call returned without success flag');
        setError('Contract call failed');
        return false;
      }
    } catch (error) {
      log(`Error submitting batch: ${error.message}`, error);
      setError(`Failed to submit batch: ${error.message}`);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [walletAddress, provider, user?.id, courseId, batchSize, log]);

  // Rotate code (generate new QR code)
  const rotateCode = useCallback(() => {
    if (!isActive) {
      log('Not active, skipping code rotation');
      return;
    }
    
    log('Rotating code');
    const newCode = generateSingleCode();
    if (!newCode) {
      log('Failed to generate new code');
      return;
    }
    
    setAttendanceCode(newCode);
    
    // Set expiry for display
    const expiry = new Date();
    expiry.setSeconds(expiry.getSeconds() + 7);
    setExpiryTime(expiry);
    
    // Check if we need to handle batch
    if (!batchSubmitted) {
      // Add to batch
      setBatchCodes(prev => [...prev, newCode]);
      setRotationCount(prev => {
        const newCount = prev + 1;
        log(`Rotation count: ${newCount}/${batchSize}`);
        return newCount;
      });
      
      // If batch size reached, submit batch
      if (rotationCount + 1 >= batchSize) {
        log(`Batch size reached (${batchSize}), submitting batch`);
        const allCodes = [...batchCodes, newCode];
        submitBatch(allCodes);
        setBatchCodes([]);
        setRotationCount(0);
        
        // Set next batch time
        const nextBatch = new Date();
        nextBatch.setSeconds(nextBatch.getSeconds() + 7 * batchSize);
        setNextBatchTime(nextBatch);
        log(`Next batch time set to ${nextBatch.toLocaleTimeString()}`);
      }
    } else {
      log('Using pre-approved batch');
    }
    
    // Update parent
    if (onCodeGenerated) {
      onCodeGenerated(newCode, expiry);
      log('Parent component notified of new code');
    }
  }, [
    isActive,
    generateSingleCode,
    batchSubmitted,
    batchCodes,
    rotationCount,
    batchSize,
    submitBatch,
    onCodeGenerated,
    log
  ]);

  // Start/Stop QR code generation
  const toggleGeneration = async () => {
    try {
      if (!isActive) {
        log('Starting QR code generation');
        setIsActive(true);
        setBatchSubmitted(false);
        setBatchCodes([]);
        setRotationCount(0);
        setError('');
        
        // Generate first code immediately
        setTimeout(() => rotateCode(), 100);
      } else {
        log('Stopping QR code generation');
        setIsActive(false);
        setAttendanceCode('');
        setExpiryTime(null);
        setBatchSubmitted(false);
        
        // Clear timer
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
      }
    } catch (error) {
      log(`Error in toggleGeneration: ${error.message}`, error);
      setError(`Failed to toggle generation: ${error.message}`);
    }
  };

  // Update countdown timer and auto-rotate code
  useEffect(() => {
    if (!isActive) return;

    log('Setting up timer for code rotation');
    
    // Clear any existing timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    // Set new timer
    timerRef.current = setInterval(() => {
      if (expiryTime) {
        const now = new Date();
        const diff = Math.max(0, Math.ceil((expiryTime - now) / 1000));
        
        setTimeRemaining({
          seconds: diff,
          expired: diff === 0
        });

        if (diff === 0) {
          log('Code expired, rotating');
          rotateCode();
        }
      }
    }, 1000);

    // Cleanup
    return () => {
      if (timerRef.current) {
        log('Cleaning up timer');
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [expiryTime, isActive, rotateCode, log]);

  // Initial checks on component mount
  useEffect(() => {
    const checkDependencies = async () => {
      log('Checking dependencies');
      
      if (!walletAddress) {
        log('No wallet address found');
      } else {
        log(`Wallet connected: ${walletAddress.substring(0, 8)}...`);
      }
      
      if (!provider) {
        log('No provider found');
      } else {
        log('Provider available');
        try {
          const network = await provider.getNetwork();
          log(`Connected to network: ${network.name || network.chainId}`);
        } catch (error) {
          log(`Error getting network: ${error.message}`);
        }
      }
      
      if (!user?.id) {
        log('No user ID found');
      } else {
        log(`User ID: ${user.id}`);
      }
      
      if (!courseId) {
        log('No course ID provided');
      } else {
        log(`Course ID: ${courseId}`);
      }
    };
    
    checkDependencies();
  }, [walletAddress, provider, user, courseId, log]);

  // Handle batch size change
  const handleBatchSizeChange = (e) => {
    const size = parseInt(e.target.value);
    if (!isNaN(size) && size >= 1 && size <= 50) {
      setBatchSize(size);
      log(`Batch size changed to ${size}`);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 text-center">
      <h3 className="text-lg font-semibold mb-4">Attendance QR Code</h3>
      
      <div className="text-right mb-2">
        <button 
          onClick={() => setShowDebug(!showDebug)} 
          className="text-xs text-gray-500 hover:text-gray-700"
        >
          {showDebug ? 'Hide Debug' : 'Show Debug'}
        </button>
      </div>

      {!walletAddress && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 text-sm text-yellow-700 mb-4">
          Please connect your wallet to generate attendance codes
        </div>
      )}
      
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 text-sm text-red-700 mb-4 flex items-start">
          <AlertCircle size={16} className="mr-2 mt-0.5 flex-shrink-0" />
          <div>{error}</div>
        </div>
      )}
      
      {!isActive && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Batch Size (codes per transaction)
          </label>
          <input
            type="number"
            min="1"
            max="50"
            value={batchSize}
            onChange={handleBatchSizeChange}
            className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
          <p className="text-xs text-gray-500 mt-1">
            Higher values mean fewer blockchain transactions but higher gas per transaction
          </p>
        </div>
      )}

      {attendanceCode ? (
        <div className="space-y-4">
          <div className="bg-white p-3 rounded-lg inline-block mx-auto">
            <QRCode value={attendanceCode} size={200} />
          </div>
          
          <div className="mt-4">
            <p className="text-sm text-gray-600 mb-2">Code expires in:</p>
            <p className="text-xl font-semibold text-primary-600">
              {timeRemaining.seconds} seconds
            </p>
          </div>
          
          {batchSubmitted ? (
            <div className="bg-green-50 border-l-4 border-green-400 p-3 text-sm text-green-700">
              Using pre-approved batch. Next transaction in {Math.floor((nextBatchTime - new Date()) / 1000)} seconds
            </div>
          ) : (
            <div className="bg-blue-50 border-l-4 border-blue-400 p-3 text-sm text-blue-700">
              Building batch: {rotationCount}/{batchSize} codes generated
            </div>
          )}

          <button
            onClick={toggleGeneration}
            className="mt-4 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
          >
            Stop Generation
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-gray-600 mb-4">
            Generate a QR code for students to scan and mark their attendance.
            Code will refresh every 7 seconds, but blockchain transactions will be batched.
          </p>
          
          <button
            onClick={toggleGeneration}
            disabled={isLoading || !walletAddress}
            className={`w-full px-4 py-2 rounded-lg text-white ${
              isLoading || !walletAddress 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-blue-500 hover:bg-blue-600 transition-colors'
            }`}
          >
            {isLoading ? 'Generating...' : 'Start QR Generation'}
          </button>
        </div>
      )}

      {blockchainTxHash && (
        <div className="mt-4 text-xs text-gray-500">
          <a
            href={`https://testnet.teloscan.io/tx/${blockchainTxHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-purple-600 hover:text-purple-800 flex items-center justify-center"
          >
            View on Explorer
            <ExternalLink size={12} className="ml-1" />
          </a>
        </div>
      )}
      
      {showDebug && (
        <div className="mt-6 p-3 bg-gray-100 rounded text-left">
          <h4 className="text-sm font-semibold mb-2">Debug Information</h4>
          <div className="text-xs font-mono whitespace-pre-wrap h-40 overflow-y-auto bg-gray-900 text-gray-200 p-2 rounded">
            {debugInfo || 'No debug information available'}
          </div>
        </div>
      )}
    </div>
  );
};

export default QRCodeGenerator;