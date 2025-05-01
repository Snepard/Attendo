import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLayout } from '../context/LayoutContext';
import loginImage from '../assets/login.jpg';
import signupImage from '../assets/signup.jpg';

export default function FlippingAuthCard() {
  // Auth state and navigation
  const { user, signIn, signUp, isStudent, isTeacher } = useAuth();
  const { setShowFooter } = useLayout();
  const navigate = useNavigate();
  const location = useLocation();

  // UI state
  const [isFlipped, setIsFlipped] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Login form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Signup form state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('student');
  const [rollNumber, setRollNumber] = useState('');

  // Check URL path to determine initial card state
  useEffect(() => {
    setIsFlipped(location.pathname === '/signup');
  }, [location.pathname]);

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
      } else {
        navigate('/');
      }
    }
  }, [user, isStudent, isTeacher, navigate]);

  // Display any messages passed in location state
  useEffect(() => {
    if (location.state?.message) {
      setError('');
    }
  }, [location.state]);

  const handleFlip = () => {
    // Clear form values and errors when flipping
    setIsFlipped(!isFlipped);
    setError('');
    
    // Update URL to match current view without page refresh
    navigate(isFlipped ? '/login' : '/signup', { replace: true });
  };

  const handleLogin = async (e) => {
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

  const handleSignup = async (e) => {
    e.preventDefault();

    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      setError('Please fill in all required fields');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (role === 'student' && !rollNumber) {
      setError('Roll number is required for students');
      return;
    }

    try {
      setIsLoading(true);
      setError('');

      const userProfile = {
        first_name: firstName,
        last_name: lastName,
        role: role,
        roll_number: role === 'student' ? rollNumber : null,
        department: null,
      };

      await signUp(email, password, userProfile);
      
      // Instead of navigating to login page, just flip the card
      setIsFlipped(false);
      navigate('/login', { 
        replace: true,
        state: { message: 'Account created successfully. Please sign in.' }
      });
      
      // Clear signup form
      setFirstName('');
      setLastName('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setRollNumber('');
      
    } catch (error) {
      console.error('Signup error:', error);
      setError(error.message || 'Failed to create account');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-purple-50 min-h-screen flex items-center justify-center p-2">
      <div 
        className="bg-white rounded-2xl shadow-lg w-full max-w-3xl overflow-hidden transition-all duration-500"
        style={{
          perspective: '1000px',
          height: '500px', // Fixed height for better flip animation
        }}
      >
        {/* Card Container */}
        <div 
          className="relative w-full h-full transition-transform duration-500"
          style={{
            transformStyle: 'preserve-3d',
            transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
          }}
        >
          {/* Login Side */}
          <div 
            className="absolute inset-0 w-full h-full flex flex-col md:flex-row"
            style={{
              backfaceVisibility: 'hidden',
            }}
          >
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

              {!isFlipped && error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mb-4">
                  {error}
                </div>
              )}

              <form onSubmit={handleLogin}>
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
                  {isLoading && !isFlipped ? 'Signing In...' : 'Log In'}
                </button>
              </form>

              <p className="text-sm text-gray-600 mt-6 text-center">
                Don&apos;t have an account?{' '}
                <button 
                  type="button"
                  onClick={handleFlip}
                  className="text-purple-600 hover:underline"
                >
                  Sign up
                </button>
              </p>
            </div>
          </div>

          {/* Signup Side */}
          <div 
            className="absolute inset-0 w-full h-full flex flex-col md:flex-row"
            style={{
              backfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)'
            }}
          >
            {/* Left side - Form */}
            <div className="w-full md:w-1/2 p-4 sm:p-6">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">Sign Up</h1>

              {/* Error Message */}
              {isFlipped && error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mb-4">
                  {error}
                </div>
              )}

              {/* Role Toggle */}
              <div className="flex mb-0.5">
                <button
                  type="button"
                  onClick={() => setRole('student')}
                  className={`w-1/2 py-2 text-sm font-medium border border-purple-500 rounded-l ${
                    role === 'student' ? 'bg-purple-500 text-white' : 'bg-white text-purple-500'
                  }`}
                >
                  Student
                </button>
                <button
                  type="button"
                  onClick={() => setRole('teacher')}
                  className={`w-1/2 py-2 text-sm font-medium border border-purple-500 rounded-r ${
                    role === 'teacher' ? 'bg-purple-500 text-white' : 'bg-white text-purple-500'
                  }`}
                >
                  Teacher
                </button>
              </div>

              {/* Form Fields */}
              <form onSubmit={handleSignup}>
                <div className="flex space-x-2 mb-4">
                  <input
                    type="text"
                    placeholder="First Name"
                    className="w-1/2 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-purple-500"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                  />
                  <input
                    type="text"
                    placeholder="Last Name"
                    className="w-1/2 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-purple-500"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                  />
                </div>

                <div className="mb-4">
                  <input
                    type="email"
                    placeholder="Email"
                    className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-purple-500"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                {role === 'student' && (
                  <div className="mb-4">
                    <input
                      type="text"
                      placeholder="Roll Number"
                      className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-purple-500"
                      value={rollNumber}
                      onChange={(e) => setRollNumber(e.target.value)}
                    />
                  </div>
                )}

                <div className="mb-4">
                  <input
                    type="password"
                    placeholder="Password"
                    className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-purple-500"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>

                <div className="mb-4">
                  <input
                    type="password"
                    placeholder="Confirm Password"
                    className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-purple-500"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-purple-500 text-white py-2 rounded hover:bg-purple-600 transition-all duration-300 disabled:opacity-50"
                >
                  {isLoading && isFlipped ? 'Creating...' : 'Create Account'}
                </button>
              </form>

              <p className="text-sm text-gray-600 mt-6 text-center">
                Already have an account?{' '}
                <button 
                  type="button"
                  onClick={handleFlip}
                  className="text-purple-600 hover:underline"
                >
                  Log in
                </button>
              </p>
            </div>

            {/* Right side - Image */}
            <div className="hidden md:block md:w-1/2 bg-purple-100">
              <img
                src={signupImage}
                alt="Signup illustration"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}