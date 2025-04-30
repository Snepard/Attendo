import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import signupImage from '../assets/signup.jpg';

export default function LavenderSignupPage() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('student');
  const [rollNumber, setRollNumber] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { user, signUp } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
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

      navigate('/login', {
        state: { message: 'Account created successfully. Please sign in.' },
      });
    } catch (error) {
      console.error('Signup error:', error);
      setError(error.message || 'Failed to create account');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-purple-50 min-h-screen flex items-center justify-center p-2">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-3xl flex flex-col md:flex-row overflow-hidden transition-all duration-500 scale-[0.85]">
        {/* Left side - Image */}
        <div className="hidden md:block md:w-1/2 bg-purple-100">
          <img
            src={signupImage}
            alt="Signup illustration"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Right side - Form */}
        <div className="w-full md:w-1/2 p-4 sm:p-6 animate-fade-in">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">Sign Up</h1>

          {/* Error Message */}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mb-4">
              {error}
            </div>
          )}

          {/* Role Toggle */}
          <div className="flex mb-4">
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
          <form onSubmit={handleSubmit}>
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
              {isLoading ? 'Creating...' : 'Create Account'}
            </button>
          </form>

          <p className="text-sm text-gray-600 mt-6 text-center">
            Already have an account?{' '}
            <Link to="/login" className="text-purple-600 hover:underline">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
