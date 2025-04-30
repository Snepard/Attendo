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

export const getContract = (provider) => {
  return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
};

export const updateAttendanceCode = async (signer, code, validityInMinutes) => {
  const contract = getContract(signer);
  const tx = await contract.updateAttendanceCode(code, validityInMinutes);
  await tx.wait();
  return tx;
};

export const markAttendance = async (signer, code) => {
  const contract = getContract(signer);
  const tx = await contract.markAttendance(code);
  await tx.wait();
  return tx;
};

export const checkAttendanceStatus = async (provider, address) => {
  const contract = getContract(provider);
  const hasMarked = await contract.hasMarkedAttendance(address);
  const count = await contract.getAttendanceCount(address);
  return { hasMarked, count };
};

export const isTeacher = async (provider, address) => {
  const contract = getContract(provider);
  const teacher = await contract.teacher();
  return teacher.toLowerCase() === address.toLowerCase();
};