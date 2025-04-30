// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract AttendanceContract {
    address public teacher;
    bytes32 public currentCodeHash;
    uint256 public codeExpiry;
    mapping(address => bool) public hasMarkedAttendance;
    mapping(address => uint256) public attendanceCount;
    
    event AttendanceMarked(address indexed student, uint256 timestamp);
    event CodeUpdated(bytes32 indexed codeHash, uint256 expiry);
    
    modifier onlyTeacher() {
        require(msg.sender == teacher, "Only teacher can call this");
        _;
    }
    
    constructor() {
        teacher = msg.sender;
    }
    
    function updateAttendanceCode(string memory code, uint256 validityInMinutes) external onlyTeacher {
        require(validityInMinutes > 0, "Validity must be greater than 0");
        currentCodeHash = keccak256(abi.encodePacked(code));
        codeExpiry = block.timestamp + (validityInMinutes * 1 minutes);
        
        emit CodeUpdated(currentCodeHash, codeExpiry);
    }
    
    function markAttendance(string memory code) external {
        require(block.timestamp <= codeExpiry, "Attendance code has expired");
        require(!hasMarkedAttendance[msg.sender], "Already marked attendance");
        require(keccak256(abi.encodePacked(code)) == currentCodeHash, "Invalid code");
        
        hasMarkedAttendance[msg.sender] = true;
        attendanceCount[msg.sender]++;
        
        emit AttendanceMarked(msg.sender, block.timestamp);
    }
    
    function resetAttendance() external onlyTeacher {
        currentCodeHash = 0;
        codeExpiry = 0;
        
        emit CodeUpdated(currentCodeHash, codeExpiry);
    }
    
    function getAttendanceCount(address student) external view returns (uint256) {
        return attendanceCount[student];
    }
}