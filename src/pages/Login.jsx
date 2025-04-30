import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function LavenderLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Login submitted with:', { email, password });
  };

  return (
    <div className="bg-purple-50 min-h-screen flex items-center justify-center p-2">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-3xl flex flex-col md:flex-row overflow-hidden">
        {/* Left side - Image */}
        <div className="hidden md:block md:w-1/2 bg-purple-100">
          <img
            src="src/assets/login.png"
            alt="Login illustration"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Right side - Login Form */}
        <div className="w-full md:w-1/2 p-6 sm:p-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">Login</h1>

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                id="email"
                type="email"
                className="w-full pl-3 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="your.email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="mb-4">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                id="password"
                type="password"
                className="w-full pl-3 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="********"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div className="text-right mb-4">
              <a className="text-sm text-purple-600 hover:text-purple-800 cursor-pointer">Forgot Password?</a>
            </div>

            <button
              type="submit"
              className="w-full bg-purple-500 text-white py-2 rounded-md hover:bg-purple-600 transition-colors"
            >
              Log In
            </button>
          </form>

          <p className="text-sm text-gray-600 mt-6 text-center">
            Don’t have an account?{' '}
            <Link to="/signup" className="text-purple-600 hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
