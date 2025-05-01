import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Web3Provider } from './context/Web3Context';
import { LayoutProvider, useLayout } from './context/LayoutContext'; 
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Landing from './pages/Landing';

import StudentDashboard from './pages/student/StudentDashboard';
import StudentProfile from './pages/student/StudentProfile';
import AttendanceRecords from './pages/student/AttendanceRecords';
import Transcript from './pages/student/Transcript';
import Reports from './pages/student/Reports';

import TeacherDashboard from './pages/teacher/TeacherDashboard';
import TeacherStudentList from './pages/teacher/TeacherStudentList';
import TeacherProfile from './pages/teacher/TeacherProfile';
import FlippingAuthCard from './pages/FlippingAuthCard';

import { ProtectedRoute, TeacherRoute, StudentRoute } from './components/ProtectedRoute';
import './App.css';

function AppContent() {
  const { showNavbar, showFooter } = useLayout();
  
  return (
    <div className="flex flex-col min-h-screen">
      {showNavbar && <Navbar />}
      <main className="flex-grow">
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<FlippingAuthCard />} />
          <Route path="/signup" element={<FlippingAuthCard />} />
          
          {/* Student routes */}
          <Route element={<StudentRoute />}>
            <Route path="/student/dashboard" element={<StudentDashboard />} />
            <Route path="/student/profile" element={<StudentProfile />} />
            <Route path="/student/attendance-records" element={<AttendanceRecords />} />
            <Route path="/student/transcript" element={<Transcript />} />
            <Route path="/student/reports" element={<Reports />} />
          </Route>
          
          {/* Teacher routes */}
          <Route element={<TeacherRoute />}>
            <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
            <Route path="/teacher/students" element={<TeacherStudentList />} />
            <Route path="/teacher/profile" element={<TeacherProfile />} />
          </Route>
          
          {/* Fallback route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      {showFooter && <Footer />}
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <Web3Provider>
          <LayoutProvider>
            <AppContent />
          </LayoutProvider>
        </Web3Provider>
      </AuthProvider>
    </Router>
  );
}

export default App;