import { ethers } from 'ethers';

const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS;
const CONTRACT_ABI = [
  "function updateAttendanceCode(string memory code, uint256 validityInMinutes) external",
  "function markAttendance(string memory code) external",
  "function resetAttendance() external",
  "function getAttendanceCount(address student) external view returns (uint256)",
  "function teacher() external view returns (address)",
  "function currentCodeHash() external view returns (bytes32)",
  "function codeExpiry() external view returns (uint256)",
  "function hasMarkedAttendance(address) external view returns (bool)",
  "event AttendanceMarked(address indexed student, uint256 timestamp)",
  "event CodeUpdated(bytes32 indexed codeHash, uint256 expiry)"
];

// Helper function to handle provider errors
const handleProviderError = (error) => {
  if (error.code === 'NETWORK_ERROR') {
    throw new Error('Please make sure you are connected to the Telos network');
  }
  throw error;
};

export const getContract = (provider) => {
  try {
    return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
  } catch (error) {
    handleProviderError(error);
  }
};

export const updateAttendanceCode = async (signer, code, validityInMinutes) => {
  try {
    const contract = getContract(signer);
    const tx = await contract.updateAttendanceCode(code, validityInMinutes);
    await tx.wait();
    return tx;
  } catch (error) {
    handleProviderError(error);
  }
};

export const markAttendance = async (signer, code) => {
  try {
    const contract = getContract(signer);
    const tx = await contract.markAttendance(code);
    await tx.wait();
    return tx;
  } catch (error) {
    handleProviderError(error);
  }
};

export const checkAttendanceStatus = async (provider, address) => {
  try {
    const contract = getContract(provider);
    const hasMarked = await contract.hasMarkedAttendance(address);
    const count = await contract.getAttendanceCount(address);
    return { hasMarked, count };
  } catch (error) {
    handleProviderError(error);
  }
};

export const isTeacher = async (provider, address) => {
  try {
    const contract = getContract(provider);
    const teacher = await contract.teacher();
    return teacher.toLowerCase() === address.toLowerCase();
  } catch (error) {
    handleProviderError(error);
  }
};