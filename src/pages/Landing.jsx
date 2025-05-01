import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Landing = () => {
  const { user, isStudent, isTeacher } = useAuth();
  
  // Determine dashboard URL based on user role
  const getDashboardUrl = () => {
    if (!user) return '/login';
    if (isTeacher) return '/teacher/dashboard';
    if (isStudent) return '/student/dashboard';
    return '/login';
  };

  return (
    <div className="min-h-screen flex flex-col font-sans bg-lavender-50">
      {/* Hero Section */}
      <header className="bg-gradient-to-br from-purple-300 via-lavender-400 to-indigo-300 text-purple-900">
        <div className="container mx-auto px-6 py-12">
          <nav className="flex justify-between items-center mb-12">
            <div className="text-2xl font-black flex items-center tracking-tight">
              <span className="mr-2 text-3xl transform rotate-12 inline-block">⏱</span> 
              <span className="bg-white px-2 py-1 rounded-lg">atte<span className="text-purple-500">ndo</span></span>
            </div>
            <div className="flex space-x-3">
              {user ? (
                <Link to={getDashboardUrl()} className="btn bg-white text-purple-600 rounded-xl shadow-lg hover:shadow-xl hover:bg-purple-100 font-bold transition-all duration-300">
                  Dashboard
                </Link>
              ) : (
                <>
                  <Link to="/login" className="btn bg-white text-purple-600 rounded-xl shadow-lg hover:shadow-xl font-bold transition-all duration-300">
                    Log In
                  </Link>
                  <Link to="/signup" className="btn bg-purple-600 text-white border border-purple-400 rounded-xl shadow-lg hover:shadow-xl hover:bg-purple-700 font-bold transition-all duration-300">
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </nav>
          
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="md:w-1/2 mb-10 md:mb-0">
              <div className="inline-block bg-white/30 backdrop-blur-sm px-4 py-2 rounded-full text-sm mb-6 animate-pulse">
                ✨ Your attendance, but make it blockchain ✨
              </div>
              <h1 className="text-4xl md:text-6xl font-black leading-tight mb-6 tracking-tight">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-900 to-indigo-800">
                  Attendance
                </span>
                <br />
                <span className="bg-purple-600 text-white px-2">tracking</span> that's
                <span className="relative">
                  <span className="absolute -bottom-2 left-0 w-full h-4 bg-yellow-300 -z-10 transform -rotate-2"></span>
                  totally rad
                </span>
              </h1>
              <p className="text-xl text-purple-800 mb-8 font-medium">
                Secure, aesthetic, and tamper-proof attendance system powered by blockchain technology.
              </p>
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                {user ? (
                  <Link to={getDashboardUrl()} className="btn bg-purple-600 text-white font-bold text-lg px-8 py-3 rounded-xl shadow-lg hover:shadow-xl hover:bg-purple-700 transition-all duration-300">
                    Go to Dashboard
                  </Link>
                ) : (
                  <Link to="/signup" className="btn bg-purple-600 text-white font-bold text-lg px-8 py-3 rounded-xl shadow-lg hover:shadow-xl hover:bg-purple-700 transition-all duration-300">
                    Get Started
                  </Link>
                )}
                <a href="#features" className="btn bg-white/70 backdrop-blur-sm border-2 border-purple-400 text-purple-700 hover:bg-white font-bold text-lg px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
                  Learn More
                </a>
              </div>
            </div>
            <div className="md:w-1/2 flex justify-center">
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-r from-pink-300 to-purple-400 rounded-2xl blur opacity-70 animate-pulse"></div>
                <img 
                  src="https://img.freepik.com/free-psd/web-design-with-hands-sale-background_23-2151649824.jpg?t=st=1746042085~exp=1746045685~hmac=7d9afe840db924c9397b9a7a5e3e31c74b5aadf705053869257d9d6561c37d29&w=740"
                  alt="Attendo App" 
                  className="relative rounded-2xl shadow-2xl h-[75vh] w-full max-w-md transform rotate-2 hover:rotate-0 transition-all duration-700"
                />
                <div className="absolute -bottom-6 -right-6 bg-yellow-300 text-purple-900 font-black text-xl p-3 rounded-full shadow-lg transform rotate-12">
                  🔥
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-block bg-lavender-100 px-4 py-2 rounded-full text-sm text-purple-700 mb-4">
              THE PERKS
            </div>
            <h2 className="text-4xl font-black mb-4 text-purple-900">Why It's Giving</h2>
            <p className="text-xl text-purple-700 max-w-3xl mx-auto">
              Our blockchain-powered attendance system is basically the GOAT for educational vibes.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gradient-to-br from-lavender-100 to-purple-100 p-8 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="text-purple-600 mb-6 inline-block bg-white p-4 rounded-2xl shadow-md">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-2xl font-black mb-3 text-purple-900">Secure AF</h3>
              <p className="text-purple-700">
                Blockchain tech means your attendance records are literally unhackable. No cap.
              </p>
            </div>
            
            <div className="bg-gradient-to-br from-lavender-100 to-purple-100 p-8 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="text-purple-600 mb-6 inline-block bg-white p-4 rounded-2xl shadow-md">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-black mb-3 text-purple-900">Real-Time Vibes</h3>
              <p className="text-purple-700">
                Instant attendance updates, because who has time to wait? Not you.
              </p>
            </div>
            
            <div className="bg-gradient-to-br from-lavender-100 to-purple-100 p-8 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="text-purple-600 mb-6 inline-block bg-white p-4 rounded-2xl shadow-md">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-2xl font-black mb-3 text-purple-900">Verified Identity</h3>
              <p className="text-purple-700">
                MetaMask integration = no more getting your bestie to mark you present. Sorry not sorry.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-lavender-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-block bg-lavender-200 px-4 py-2 rounded-full text-sm text-purple-700 mb-4">
              THE PROCESS
            </div>
            <h2 className="text-4xl font-black mb-4 text-purple-900">How It Works</h2>
            <p className="text-xl text-purple-700 max-w-3xl mx-auto">
              Easy as making a TikTok (but way more productive).
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 relative">
            {/* Connecting line for desktop */}
            <div className="hidden md:block absolute top-1/2 left-0 w-full h-1 bg-gradient-to-r from-purple-300 via-purple-400 to-indigo-300 transform -translate-y-1/2 z-0"></div>
            
            <div className="bg-white rounded-3xl p-8 shadow-xl relative z-10 transform transition-all duration-500 hover:scale-105">
              <div className="bg-purple-600 text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl font-black mx-auto mb-6">1</div>
              <h3 className="text-2xl font-black mb-3 text-center text-purple-900">Connect Your Wallet</h3>
              <p className="text-purple-700 text-center">
                Link your MetaMask wallet for that secure blockchain vibe check.
              </p>
            </div>
            
            <div className="bg-white rounded-3xl p-8 shadow-xl relative z-10 transform transition-all duration-500 hover:scale-105 md:mt-12">
              <div className="bg-purple-600 text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl font-black mx-auto mb-6">2</div>
              <h3 className="text-2xl font-black mb-3 text-center text-purple-900">Scan QR Code</h3>
              <p className="text-purple-700 text-center">
                Teachers drop a QR code, you scan it faster than you scroll Insta.
              </p>
            </div>
            
            <div className="bg-white rounded-3xl p-8 shadow-xl relative z-10 transform transition-all duration-500 hover:scale-105">
              <div className="bg-purple-600 text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl font-black mx-auto mb-6">3</div>
              <h3 className="text-2xl font-black mb-3 text-center text-purple-900">Attendance Locked</h3>
              <p className="text-purple-700 text-center">
                Your attendance hits the blockchain and it's official. No takebacks.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600 via-lavender-500 to-indigo-500 opacity-90"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yLjIgMS44LTQgNC00czQgMS44IDQgNC0xLjggNC00IDQtNC0xLjgtNC00ek0xNiAxNGMwLTIuMiAxLjgtNCA0LTRzNCAxLjggNCA0LTEuOCA0LTQgNC00LTEuOC00LTR6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-20"></div>
        
        <div className="container mx-auto px-6 text-center relative z-10">
          <div className="max-w-3xl mx-auto">
            <div className="inline-block bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm text-white mb-6">
              GET WITH IT
            </div>
            <h2 className="text-4xl md:text-5xl font-black mb-6 text-white">Ready to level up your attendance game?</h2>
            <p className="text-xl mb-10 text-white/90">
              Join the thousands already living their best academic life with Attendo.
            </p>
            
            <div className="bg-white/10 backdrop-blur-md p-8 rounded-3xl shadow-xl">
              <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-6">
                {user ? (
                  <Link to={getDashboardUrl()} className="btn bg-white text-purple-700 hover:bg-purple-100 font-black text-lg px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
                    Hit Your Dashboard
                  </Link>
                ) : (
                  <>
                    <Link to="/signup" className="btn bg-white text-purple-700 hover:bg-purple-100 font-black text-lg px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
                      Create Account
                    </Link>
                    <Link to="/login" className="btn bg-purple-700 border-2 border-white text-white hover:bg-purple-800 font-black text-lg px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
                      Log In
                    </Link>
                  </>
                )}
              </div>
            </div>
            
            <div className="mt-12 flex flex-wrap justify-center gap-8">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-yellow-300 rounded-full mr-2"></div>
                <span className="text-white/80">Instant Setup</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-purple-300 rounded-full mr-2"></div>
                <span className="text-white/80">Free Trial</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-pink-300 rounded-full mr-2"></div>
                <span className="text-white/80">24/7 Support</span>
              </div>
            </div>
          </div>
        </div>
      </section>
      
    </div>
  );
};

export default Landing;