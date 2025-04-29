// src/components/ProtectedRoute.jsx
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Component for routes that require authentication
export const ProtectedRoute = () => {
  const { user, loading } = useAuth();
  const location = useLocation();
  
  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }
  
  // Redirect to login if not authenticated, but remember where they were trying to go
  if (!user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }
  
  // Render child routes if authenticated
  return <Outlet />;
};

// Component for routes that require teacher role
export const TeacherRoute = () => {
  const { user, profile, loading, isTeacher } = useAuth();
  const location = useLocation();
  
  console.log("TeacherRoute check - User:", !!user, "Profile:", profile, "isTeacher:", isTeacher);
  
  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }
  
  // Redirect to login if not authenticated
  if (!user) {
    console.log("TeacherRoute: No user, redirecting to login");
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }
  
  // Redirect to student dashboard if not a teacher
  if (!isTeacher) {
    console.log("TeacherRoute: Not a teacher, redirecting to student dashboard");
    console.log("Current role:", profile?.role);
    return <Navigate to="/student/dashboard" replace />;
  }
  
  // Render child routes if authenticated and is a teacher
  console.log("TeacherRoute: User is a teacher, rendering child routes");
  return <Outlet />;
};

// Component for routes that require student role
export const StudentRoute = () => {
  const { user, profile, loading, isStudent } = useAuth();
  const location = useLocation();
  
  console.log("StudentRoute check - User:", !!user, "Profile:", profile, "isStudent:", isStudent);
  
  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }
  
  // Redirect to login if not authenticated
  if (!user) {
    console.log("StudentRoute: No user, redirecting to login");
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }
  
  // Redirect to teacher dashboard if not a student
  if (!isStudent) {
    console.log("StudentRoute: Not a student, redirecting to teacher dashboard");
    console.log("Current role:", profile?.role);
    return <Navigate to="/teacher/dashboard" replace />;
  }
  
  // Render child routes if authenticated and is a student
  console.log("StudentRoute: User is a student, rendering child routes");
  return <Outlet />;
};