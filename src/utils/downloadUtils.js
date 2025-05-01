import { jsPDF } from 'jspdf';
import { formatDateTime, formatDate } from './attendanceUtils';

export const generateAttendanceReport = (attendanceRecords, studentInfo) => {
  const doc = new jsPDF();
  
  // Header
  doc.setFontSize(20);
  doc.text('Attendance Report', 20, 20);
  
  // Student Info
  doc.setFontSize(12);
  doc.text(`Name: ${studentInfo.first_name} ${studentInfo.last_name}`, 20, 40);
  doc.text(`Roll Number: ${studentInfo.roll_number || 'N/A'}`, 20, 50);
  doc.text(`Generated on: ${formatDateTime(new Date().toISOString())}`, 20, 60);
  
  // Table Headers
  const headers = ['Date', 'Course', 'Status', 'Time In'];
  let y = 80;
  
  doc.setFontSize(10);
  headers.forEach((header, i) => {
    doc.text(header, 20 + (i * 40), y);
  });
  
  // Table Content
  y += 10;
  attendanceRecords.forEach((record) => {
    if (y > 270) { // Check if we need a new page
      doc.addPage();
      y = 20;
    }
    
    doc.text(formatDate(record.created_at), 20, y);
    doc.text(record.course_name || 'N/A', 60, y);
    doc.text(record.is_late ? 'Late' : 'Present', 100, y);
    doc.text(formatDateTime(record.time_in), 140, y);
    
    y += 10;
  });
  
  return doc;
};

export const generateTranscript = (studentInfo, courses, attendanceStats) => {
  const doc = new jsPDF();
  
  // Header
  doc.setFontSize(20);
  doc.text('Academic Transcript', 20, 20);
  
  // Student Info
  doc.setFontSize(12);
  doc.text(`Name: ${studentInfo.first_name} ${studentInfo.last_name}`, 20, 40);
  doc.text(`Roll Number: ${studentInfo.roll_number || 'N/A'}`, 20, 50);
  doc.text(`Generated on: ${formatDateTime(new Date().toISOString())}`, 20, 60);
  
  // Courses and Attendance
  doc.setFontSize(14);
  doc.text('Course Summary', 20, 80);
  
  let y = 100;
  doc.setFontSize(10);
  
  courses.forEach((course) => {
    if (y > 270) {
      doc.addPage();
      y = 20;
    }
    
    doc.text(`Course: ${course.name}`, 20, y);
    doc.text(`Code: ${course.code}`, 20, y + 10);
    doc.text(`Attendance: ${attendanceStats[course.id]?.present || 0}%`, 20, y + 20);
    
    y += 40;
  });
  
  return doc;
};

export const downloadPDF = (doc, filename) => {
  doc.save(filename);
};