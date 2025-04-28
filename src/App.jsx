import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Web3Provider } from './context/Web3Context';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Landing from './pages/Landing';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import StudentDashboard from './pages/student/StudentDashboard';
import StudentProfile from './pages/student/StudentProfile';
import TeacherDashboard from './pages/teacher/TeacherDashboard';
import TeacherStudentList from './pages/teacher/TeacherStudentList';
import TeacherProfile from './pages/teacher/TeacherProfile';
import './App.css';

// Protected route component
const ProtectedRoute = ({ children, allowedRole }) => {
  // Get auth context values
  const user = { id: "1", role: "student" }; // Mock user for now
  
  // If user is not logged in, redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  // If role is specified and user doesn't have that role, redirect
  if (allowedRole && user.role !== allowedRole) {
    if (user.role === 'student') {
      return <Navigate to="/student/dashboard" replace />;
    } else if (user.role === 'teacher') {
      return <Navigate to="/teacher/dashboard" replace />;
    }
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <Web3Provider>
          <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-grow">
              <Routes>
                {/* Public routes */}
                <Route path="/" element={<Landing />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<SignUp />} />
                
                {/* Student routes */}
                <Route 
                  path="/student/dashboard" 
                  element={
                    <ProtectedRoute allowedRole="student">
                      <StudentDashboard />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/student/profile" 
                  element={
                    <ProtectedRoute allowedRole="student">
                      <StudentProfile />
                    </ProtectedRoute>
                  } 
                />
                
                {/* Teacher routes */}
                <Route 
                  path="/teacher/dashboard" 
                  element={
                    <ProtectedRoute allowedRole="teacher">
                      <TeacherDashboard />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/teacher/students" 
                  element={
                    <ProtectedRoute allowedRole="teacher">
                      <TeacherStudentList />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/teacher/profile" 
                  element={
                    <ProtectedRoute allowedRole="teacher">
                      <TeacherProfile />
                    </ProtectedRoute>
                  } 
                />
                
                {/* Fallback route */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </Web3Provider>
      </AuthProvider>
    </Router>
  );
}

export default App;