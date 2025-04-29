import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, signOut, isStudent, isTeacher } = useAuth();
  const navigate = useNavigate();
  
  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };
  
  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex items-center text-xl font-bold text-primary-500">
              <span className="text-2xl mr-2">⏱️</span> Attendo
            </div>
          </div>
          
          <div className="flex items-center">
            {user ? (
              <>
                {isTeacher && (
                  <a href="/teacher/dashboard" className="text-gray-600 hover:text-gray-900 px-3 py-2 mr-2">
                    Dashboard
                  </a>
                )}
                
                {isStudent && (
                  <a href="/student/dashboard" className="text-gray-600 hover:text-gray-900 px-3 py-2 mr-2">
                    Dashboard
                  </a>
                )}
                
                <button
                  onClick={handleLogout}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <a href="/login" className="text-gray-600 hover:text-gray-900 px-3 py-2 mr-2">
                  Login
                </a>
                <a href="/signup" className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md text-sm">
                  Sign Up
                </a>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;