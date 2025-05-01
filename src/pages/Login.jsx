import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLayout } from '../context/LayoutContext';
import loginImage from '../assets/login.jpg';


export default function LavenderLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { user, signIn, isStudent, isTeacher } = useAuth();
  const { setShowFooter } = useLayout(); 
  const navigate = useNavigate();
  const location = useLocation();
  
  useEffect(() => {
    setShowFooter(false);
    // Cleanup function - restore footer when component unmounts
    return () => setShowFooter(true);
  }, [setShowFooter]);

  // Check if user is already logged in and redirect accordingly
  useEffect(() => {
    if (user) {
      if (isTeacher) {
        navigate('/teacher/dashboard');
      } else if (isStudent) {
        navigate('/student/dashboard');
      }
    }
  }, [user, isStudent, isTeacher, navigate]);
  
  // Display any messages passed in location state
  useEffect(() => {
    if (location.state?.message) {
      // Display success message if coming from signup
      setError('');
    }
  }, [location.state]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }
    
    try {
      setIsLoading(true);
      setError('');
      
      const result = await signIn(email, password);
      console.log('Sign in result:', result);
      
      if (result.profile?.role === 'teacher') {
        navigate('/teacher/dashboard');
      } else if (result.profile?.role === 'student') {
        navigate('/student/dashboard');
      } else {
        setError('Login successful but role not recognized');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message || 'Failed to sign in');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-purple-50 min-h-screen flex items-center justify-center p-2">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-3xl flex flex-col md:flex-row overflow-hidden">
        {/* Left side - Image */}
        <div className="hidden md:block md:w-1/2 bg-purple-100">
          <img
            src={loginImage}
            alt="Login illustration"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Right side - Login Form */}
        <div className="w-full md:w-1/2 p-6 sm:p-8 text-left">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">Login</h1>

          {location.state?.message && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-2 rounded mb-4">
              {location.state.message}
            </div>
          )}

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                id="email"
                type="email"
                className="w-full pl-3 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="your.email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="mb-4">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                id="password"
                type="password"
                className="w-full pl-3 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="********"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="text-right mb-4">
              <a className="text-sm text-purple-600 hover:text-purple-800 cursor-pointer">
                Forgot Password?
              </a>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-purple-500 text-white py-2 rounded-md hover:bg-purple-600 transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Signing In...' : 'Log In'}
            </button>
          </form>

          <p className="text-sm text-gray-600 mt-6 text-center">
            Don&apos;t have an account?{' '}
            <Link to="/signup" className="text-purple-600 hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}