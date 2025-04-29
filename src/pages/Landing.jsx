import { Link } from 'react-router-dom';

const Landing = () => {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <header className="bg-gradient-to-r from-primary-600 to-primary-800 text-white">
        <div className="container mx-auto px-4 py-16">
          <nav className="flex justify-between items-center mb-16">
            <div className="text-2xl font-bold flex items-center">
              <span className="text-3xl mr-2">⏱️</span> Attendo
            </div>
            <div className="flex space-x-4">
              <Link to="/login" className="btn bg-white text-primary-600 hover:bg-gray-100">
                Log In
              </Link>
              <Link to="/signup" className="btn bg-primary-500 text-white border border-primary-400 hover:bg-primary-600">
                Sign Up
              </Link>
            </div>
          </nav>
          
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="md:w-1/2 mb-10 md:mb-0">
              <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6 animate-[fadeIn_0.8s_ease-in]">
                Decentralized Attendance Tracking
              </h1>
              <p className="text-xl text-primary-100 mb-8 animate-[fadeIn_1s_ease-in]">
                Secure, transparent, and tamper-proof attendance system powered by blockchain technology.
              </p>
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 animate-[fadeIn_1.2s_ease-in]">
                <Link to="/signup" className="btn btn-accent text-white font-semibold text-lg px-8 py-3">
                  Get Started
                </Link>
                <a href="#features" className="btn bg-transparent border border-white text-white hover:bg-white hover:text-primary-600 font-semibold text-lg px-8 py-3">
                  Learn More
                </a>
              </div>
            </div>
            <div className="md:w-1/2 flex justify-center animate-[fadeIn_1.5s_ease-in]">
              <img 
                src="https://images.pexels.com/photos/8363104/pexels-photo-8363104.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1" 
                alt="Attendo App" 
                className="rounded-lg shadow-2xl w-full max-w-md"
              />
            </div>
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Why Choose Attendo?</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our blockchain-powered attendance system provides unmatched security and convenience for educational institutions.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition duration-300">
              <div className="text-primary-500 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3">Secure & Tamper-Proof</h3>
              <p className="text-gray-600">
                Blockchain technology ensures that attendance records cannot be manipulated or falsified once recorded.
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition duration-300">
              <div className="text-primary-500 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3">Real-Time Tracking</h3>
              <p className="text-gray-600">
                Instant attendance marking and real-time updates for both students and teachers.
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition duration-300">
              <div className="text-primary-500 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3">Verified Identity</h3>
              <p className="text-gray-600">
                MetaMask integration ensures that attendance is marked by the rightful student.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">How It Works</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Simple, efficient and secure attendance tracking in just a few steps.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-6">
              <div className="bg-primary-100 text-primary-600 w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">1</div>
              <h3 className="text-xl font-bold mb-3">Connect Your Wallet</h3>
              <p className="text-gray-600">
                Students connect their MetaMask wallet to securely verify their identity.
              </p>
            </div>
            
            <div className="text-center p-6">
              <div className="bg-primary-100 text-primary-600 w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">2</div>
              <h3 className="text-xl font-bold mb-3">Scan QR Code</h3>
              <p className="text-gray-600">
                Teachers generate a unique QR code that students can scan to mark attendance.
              </p>
            </div>
            
            <div className="text-center p-6">
              <div className="bg-primary-100 text-primary-600 w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">3</div>
              <h3 className="text-xl font-bold mb-3">Attendance Recorded</h3>
              <p className="text-gray-600">
                The attendance is securely recorded on the blockchain and instantly visible to all parties.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary-600 to-primary-800 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Revolutionize Attendance Tracking?</h2>
          <p className="text-xl mb-8 max-w-3xl mx-auto">
            Join thousands of educational institutions already using Attendo to streamline their attendance process.
          </p>
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Link to="/signup" className="btn bg-white text-primary-600 hover:bg-gray-100 font-semibold text-lg px-8 py-3">
              Create an Account
            </Link>
            <Link to="/login" className="btn bg-transparent border border-white text-white hover:bg-white hover:text-primary-600 font-semibold text-lg px-8 py-3">
              Log In
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Landing;