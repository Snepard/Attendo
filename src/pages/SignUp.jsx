import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

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
      <div className="bg-white rounded-xl shadow-md max-w-4xl w-full overflow-hidden flex flex-col lg:flex-row transform scale-95">
        {/* Image section */}
        <div className="w-full lg:w-1/2 bg-purple-100 hidden lg:block">
          <img
            src="src/assets/signup.png"
            alt="Signup illustration"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Form section */}
        <div className="w-full lg:w-1/2 px-6 py-6 lg:px-10 overflow-y-auto text-left transition-all duration-300">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Sign Up</h1>

          {/* Role Selector */}
          <div className="flex mb-4 transition-all duration-500">
            <button
              onClick={() => setRole('student')}
              className={`w-1/2 py-2 text-sm font-medium rounded-l-lg border border-purple-500 transition-all duration-300 ${
                role === 'student' ? 'bg-purple-500 text-white' : 'bg-white text-purple-500'
              }`}
            >
              I am a Student
            </button>
            <button
              onClick={() => setRole('teacher')}
              className={`w-1/2 py-2 text-sm font-medium rounded-r-lg border border-purple-500 transition-all duration-300 ${
                role === 'teacher' ? 'bg-purple-500 text-white' : 'bg-white text-purple-500'
              }`}
            >
              I am a Teacher
            </button>
          </div>

          {error && (
            <div className="bg-red-50 border-l-4 border-red-400 p-2 mb-3 rounded text-sm text-red-600">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="flex space-x-3">
              <div className="w-1/2">
                <label className="block text-gray-700 text-sm mb-1">First Name</label>
                <input
                  type="text"
                  className="w-full p-2 border text-sm border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 transition-all"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                />
              </div>
              <div className="w-1/2">
                <label className="block text-gray-700 text-sm mb-1">Last Name</label>
                <input
                  type="text"
                  className="w-full p-2 border text-sm border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 transition-all"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-700 text-sm mb-1">Email</label>
              <input
                type="email"
                className="w-full p-2 border text-sm border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 transition-all"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            {role === 'student' && (
              <div className="transition-all duration-300">
                <label className="block text-gray-700 text-sm mb-1">Roll Number</label>
                <input
                  type="text"
                  className="w-full p-2 border text-sm border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 transition-all"
                  value={rollNumber}
                  onChange={(e) => setRollNumber(e.target.value)}
                  required
                />
              </div>
            )}

            <div>
              <label className="block text-gray-700 text-sm mb-1">Password</label>
              <input
                type="password"
                className="w-full p-2 border text-sm border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 transition-all"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 text-sm mb-1">Confirm Password</label>
              <input
                type="password"
                className="w-full p-2 border text-sm border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 transition-all"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-purple-500 text-white py-2 text-sm rounded-md hover:bg-purple-600 transition disabled:opacity-50"
            >
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </button>

            <p className="text-sm mt-3 text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="text-purple-600 hover:underline">
                Log in
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
