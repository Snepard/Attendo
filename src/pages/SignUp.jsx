import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const SignUp = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('student');
  const [rollNumber, setRollNumber] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { signUp, signOut } = useAuth();
  const navigate = useNavigate();

  // Ensure user is properly signed out when accessing sign up page
  useEffect(() => {
    const ensureSignedOut = async () => {
      try {
        await signOut();
      } catch (error) {
        console.error('Error signing out on signup page load:', error);
      }
    };
    
    ensureSignedOut();
  }, [signOut]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Reset error state
    setError('');
    
    // Basic validation
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
      
      // Create user profile data
      const userProfile = {
        first_name: firstName,
        last_name: lastName,
        role: role,
        roll_number: role === 'student' ? rollNumber : null,
      };
      
      // Sign up the user
      await signUp(email, password, userProfile);
      
      // Redirect to login
      navigate('/login', { 
        state: { message: 'Account created successfully. Please sign in.' } 
      });
    } catch (error) {
      console.error('Signup error:', error);
      setError(error.message || 'Failed to create account');
      // Reset loading state on error
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link to="/" className="flex justify-center text-3xl font-bold text-primary-500 mb-6">
          <span className="text-3xl mr-2">⏱️</span> Attendo
        </Link>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Create your account
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Or{' '}
          <Link to="/login" className="font-medium text-primary-500 hover:text-primary-600">
            sign in to your existing account
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                </div>
              </div>
            )}
            
            <div className="flex space-x-4">
              <div className="w-1/2">
                <label htmlFor="firstName" className="label">
                  First name
                </label>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="input"
                />
              </div>
              
              <div className="w-1/2">
                <label htmlFor="lastName" className="label">
                  Last name
                </label>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="input"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="label">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input"
              />
            </div>

            <div>
              <label htmlFor="role" className="label">
                I am a:
              </label>
              <div className="flex space-x-4 mt-1">
                <div className="flex items-center">
                  <input
                    id="student"
                    name="role"
                    type="radio"
                    value="student"
                    checked={role === 'student'}
                    onChange={() => setRole('student')}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                  />
                  <label htmlFor="student" className="ml-2 block text-sm text-gray-700">
                    Student
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    id="teacher"
                    name="role"
                    type="radio"
                    value="teacher"
                    checked={role === 'teacher'}
                    onChange={() => setRole('teacher')}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                  />
                  <label htmlFor="teacher" className="ml-2 block text-sm text-gray-700">
                    Teacher
                  </label>
                </div>
              </div>
            </div>

            {role === 'student' && (
              <div>
                <label htmlFor="rollNumber" className="label">
                  Roll Number
                </label>
                <input
                  id="rollNumber"
                  name="rollNumber"
                  type="text"
                  required
                  value={rollNumber}
                  onChange={(e) => setRollNumber(e.target.value)}
                  className="input"
                />
              </div>
            )}

            <div>
              <label htmlFor="password" className="label">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input"
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="label">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="input"
              />
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full btn btn-primary py-2"
              >
                {isLoading ? 'Creating account...' : 'Create Account'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SignUp;