import { ethers } from 'ethers';

const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS;
// Original ABI with added batch function
const CONTRACT_ABI = [
  "function updateAttendanceCode(string memory code, uint256 validityInMinutes) external",
  "function updateBatchAttendanceCodes(string memory codes, uint256 validityInMinutes) external",
  "function markAttendance(string memory code) external",
  "function resetAttendance() external",
  "function getAttendanceCount(address student) external view returns (uint256)",
  "function teacher() external view returns (address)",
  "function currentCodeHash() external view returns (bytes32)",
  "function codeExpiry() external view returns (uint256)",
  "function hasMarkedAttendance(address) external view returns (bool)",
  "event AttendanceMarked(address indexed student, uint256 timestamp)",
  "event CodeUpdated(bytes32 indexed codeHash, uint256 expiry)",
  "event BatchCodesUpdated(bytes32 indexed batchHash, uint256 count, uint256 expiry)"
];

// Improved error handler with debugging
const handleProviderError = (error) => {
  console.error('Provider error:', error);
  
  // Check if error is RPC error
  if (error.code && error.code.toString().includes('32')) {
    return {
      success: false,
      error: 'RPC Error: Check that your wallet is connected to the correct network'
    };
  }
  
  // Network connection errors
  if (error.code === 'NETWORK_ERROR' || error.message?.includes('network')) {
    return {
      success: false,
      error: 'Network Error: Please make sure you are connected to the Telos network'
    };
  }
  
  // Contract call errors
  if (error.code === 'CALL_EXCEPTION' || error.message?.includes('call exception')) {
    return {
      success: false,
      error: 'Contract Error: Transaction reverted. Check that you have permissions to call this function.'
    };
  }
  
  // Rejected by user
  if (error.code === 4001 || error.message?.includes('user rejected')) {
    return {
      success: false,
      error: 'Transaction was rejected by user'
    };
  }
  
  // Gas related errors
  if (error.message?.includes('gas') || error.message?.includes('fee')) {
    return {
      success: false,
      error: 'Gas Error: Transaction may require more gas than allowed'
    };
  }
  
  // Default error
  return {
    success: false,
    error: `Error: ${error.message || 'Unknown error occurred'}`
  };
};

// Get contract with enhanced error handling
export const getContract = (provider) => {
  try {
    if (!CONTRACT_ADDRESS) {
      console.error('Contract address not configured');
      throw new Error('Contract address not configured in environment variables');
    }
    
    console.log('Creating contract instance with address:', CONTRACT_ADDRESS);
    return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
  } catch (error) {
    console.error('Error getting contract:', error);
    throw error;
  }
};

// Original updateAttendanceCode with fallback to batch function
export const updateAttendanceCode = async (signer, code, validityInMinutes) => {
  try {
    console.log('Attempting to update attendance code');
    console.log('Code type:', typeof code);
    console.log('Is array or object?', code.startsWith('[') || code.startsWith('{'));
    
    // Check if this is a batch update
    if (code.startsWith('[') || code.startsWith('{')) {
      console.log('Detected batch format, forwarding to batch function');
      return updateBatchAttendanceCodes(signer, code, validityInMinutes);
    }
    
    // If we don't have a contract address, simulate success for testing
    if (!CONTRACT_ADDRESS) {
      console.warn('No contract address found - simulating successful transaction');
      return {
        hash: '0x' + Array(64).fill('0').join(''),
        success: true,
        simulated: true
      };
    }
    
    const contract = getContract(signer);
    console.log('Calling contract.updateAttendanceCode');
    const tx = await contract.updateAttendanceCode(code, validityInMinutes);
    console.log('Transaction sent:', tx.hash);
    
    // Wait for confirmation
    console.log('Waiting for transaction confirmation...');
    const receipt = await tx.wait();
    console.log('Transaction confirmed:', receipt);
    
    return {
      hash: receipt.hash,
      success: true
    };
  } catch (error) {
    console.error('Error in updateAttendanceCode:', error);
    return handleProviderError(error);
  }
};

// Batch attendance code update
export const updateBatchAttendanceCodes = async (signer, codes, validityInMinutes) => {
  try {
    console.log('Updating batch attendance codes');
    
    // Ensure codes is a string
    const codesString = typeof codes === 'string' ? codes : JSON.stringify(codes);
    console.log(`Batch contains ${JSON.parse(codesString).length} codes`);
    
    // If we don't have a contract address, simulate success for testing
    if (!CONTRACT_ADDRESS) {
      console.warn('No contract address found - simulating successful batch transaction');
      return {
        hash: '0x' + Array(64).fill('0').join(''),
        success: true,
        simulated: true
      };
    }
    
    const contract = getContract(signer);
    console.log('Calling contract.updateBatchAttendanceCodes');
    
    // Check if function exists on contract
    if (!contract.updateBatchAttendanceCodes) {
      console.warn('updateBatchAttendanceCodes not found on contract, falling back to regular function');
      // Extract first code and use regular function as fallback
      const firstCode = JSON.parse(codesString)[0];
      return updateAttendanceCode(signer, firstCode, validityInMinutes);
    }
    
    // Call the batch function
    const tx = await contract.updateBatchAttendanceCodes(codesString, validityInMinutes);
    console.log('Batch transaction sent:', tx.hash);
    
    // Wait for confirmation
    console.log('Waiting for batch transaction confirmation...');
    const receipt = await tx.wait();
    console.log('Batch transaction confirmed:', receipt);
    
    return {
      hash: receipt.hash,
      success: true
    };
  } catch (error) {
    console.error('Error in updateBatchAttendanceCodes:', error);
    return handleProviderError(error);
  }
};

export const markAttendance = async (signer, code) => {
  try {
    console.log('Marking attendance with code');
    
    // If we don't have a contract address, simulate success for testing
    if (!CONTRACT_ADDRESS) {
      console.warn('No contract address found - simulating successful attendance marking');
      return {
        hash: '0x' + Array(64).fill('0').join(''),
        success: true,
        simulated: true
      };
    }
    
    const contract = getContract(signer);
    const tx = await contract.markAttendance(code);
    const receipt = await tx.wait();
    
    return {
      hash: receipt.hash,
      success: true
    };
  } catch (error) {
    console.error('Error marking attendance:', error);
    
    if (error.message?.includes('already marked')) {
      return {
        success: false,
        error: 'You have already marked attendance for this session'
      };
    }
    
    return handleProviderError(error);
  }
};

export const checkAttendanceStatus = async (provider, address) => {
  try {
    console.log('Checking attendance status for address:', address);
    
    // If we don't have a contract address, return dummy data for testing
    if (!CONTRACT_ADDRESS) {
      console.warn('No contract address found - returning dummy attendance status');
      return { 
        hasMarked: false, 
        count: 0,
        simulated: true 
      };
    }
    
    const contract = getContract(provider);
    const [hasMarked, count] = await Promise.all([
      contract.hasMarkedAttendance(address),
      contract.getAttendanceCount(address)
    ]);
    
    return { hasMarked, count };
  } catch (error) {
    console.error('Error checking attendance status:', error);
    return handleProviderError(error);
  }
};

export const isTeacher = async (provider, address) => {
  try {
    console.log('Checking if address is teacher:', address);
    
    // If we don't have a contract address, return true for testing
    if (!CONTRACT_ADDRESS) {
      console.warn('No contract address found - assuming address is teacher for testing');
      return true;
    }
    
    const contract = getContract(provider);
    const teacher = await contract.teacher();
    return teacher.toLowerCase() === address.toLowerCase();
  } catch (error) {
    console.error('Error checking teacher status:', error);
    return handleProviderError(error);
  }
};