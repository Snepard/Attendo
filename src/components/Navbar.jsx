import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, profile, isStudent, isTeacher, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Don't show navbar on landing page
  if (location.pathname === '/') {
    return null;
  }

  // Don't show navbar on auth pages
  if (location.pathname === '/login' || location.pathname === '/signup') {
    return null;
  }

  const handleLogout = async () => {
    try {
      signOut();
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <nav className="bg-white shadow-md">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          <Link to={user ? (isStudent ? '/student/dashboard' : '/teacher/dashboard') : '/'} className="text-xl font-bold text-primary-500 flex items-center">
            <span className="text-2xl mr-2">⏱</span> Attendo
          </Link>

          {user ? (
            <div className="flex items-center space-x-6">
              {isStudent && (
                <>
                  <Link 
                    to="/student/dashboard" 
                    className={`text-sm font-medium transition hover:text-primary-500 ${
                      location.pathname === '/student/dashboard' ? 'text-primary-500' : 'text-gray-700'
                    }`}
                  >
                    Dashboard
                  </Link>
                  <Link 
                    to="/student/profile" 
                    className={`text-sm font-medium transition hover:text-primary-500 ${
                      location.pathname === '/student/profile' ? 'text-primary-500' : 'text-gray-700'
                    }`}
                  >
                    Profile
                  </Link>
                </>
              )}

              {isTeacher && (
                <>
                  <Link 
                    to="/teacher/dashboard" 
                    className={`text-sm font-medium transition hover:text-primary-500 ${
                      location.pathname === '/teacher/dashboard' ? 'text-primary-500' : 'text-gray-700'
                    }`}
                  >
                    Teacher Dashboard
                  </Link>
                  <Link 
                    to="/teacher/students" 
                    className={`text-sm font-medium transition hover:text-primary-500 ${
                      location.pathname === '/teacher/students' ? 'text-primary-500' : 'text-gray-700'
                    }`}
                  >
                    Students
                  </Link>
                  <Link 
                    to="/teacher/profile" 
                    className={`text-sm font-medium transition hover:text-primary-500 ${
                      location.pathname === '/teacher/profile' ? 'text-primary-500' : 'text-gray-700'
                    }`}
                  >
                    Profile
                  </Link>
                </>
              )}
              
              <div className="flex items-center space-x-4">
                <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-semibold text-sm">
                  {profile?.first_name?.[0] || user.email[0].toUpperCase()}
                </div>
                <button
                  onClick={handleLogout}
                  className="text-sm font-medium text-gray-700 hover:text-primary-500 transition"
                >
                  Logout
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center space-x-4">
              <Link to="/login" className="btn btn-sm btn-primary">
                Log In
              </Link>
              <Link to="/signup" className="btn btn-sm btn-secondary">
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;  