// src/components/AuthDebug.jsx
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { checkAuthStatus } from '../utils/debugUtils';

const AuthDebug = () => {
  const { user, profile, loading, error, isStudent, isTeacher } = useAuth();
  const [debugInfo, setDebugInfo] = useState(null);
  const [showDebug, setShowDebug] = useState(false);

  useEffect(() => {
    const fetchDebugInfo = async () => {
      const status = await checkAuthStatus();
      setDebugInfo(status);
    };
    
    fetchDebugInfo();
  }, []);

  if (loading) {
    return <div>Loading auth status...</div>;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={() => setShowDebug(!showDebug)}
        className="bg-gray-800 text-white px-4 py-2 rounded-md"
      >
        {showDebug ? 'Hide Debug' : 'Show Auth Debug'}
      </button>
      
      {showDebug && (
        <div className="bg-white border border-gray-300 rounded-md p-4 mt-2 shadow-lg max-w-lg overflow-auto max-h-96">
          <h3 className="text-lg font-bold mb-2">Auth Debug Info</h3>
          
          <div className="mb-4">
            <h4 className="font-semibold">Auth Context:</h4>
            <div className="pl-4">
              <p><strong>User:</strong> {user ? 'Yes' : 'No'}</p>
              <p><strong>User ID:</strong> {user?.id || 'None'}</p>
              <p><strong>Email:</strong> {user?.email || 'None'}</p>
              <p><strong>Profile:</strong> {profile ? 'Yes' : 'No'}</p>
              <p><strong>Role:</strong> {profile?.role || 'None'}</p>
              <p><strong>isStudent:</strong> {isStudent ? 'Yes' : 'No'}</p>
              <p><strong>isTeacher:</strong> {isTeacher ? 'Yes' : 'No'}</p>
              <p><strong>Error:</strong> {error || 'None'}</p>
            </div>
          </div>
          
          <div className="mb-4">
            <h4 className="font-semibold">Debug Utils:</h4>
            <div className="pl-4">
              <p><strong>Success:</strong> {debugInfo?.success ? 'Yes' : 'No'}</p>
              <p><strong>Role:</strong> {debugInfo?.role || 'None'}</p>
              <p><strong>isStudent:</strong> {debugInfo?.isStudent ? 'Yes' : 'No'}</p>
              <p><strong>isTeacher:</strong> {debugInfo?.isTeacher ? 'Yes' : 'No'}</p>
              {debugInfo?.error && (
                <p><strong>Error:</strong> {debugInfo.error}</p>
              )}
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold">User Metadata:</h4>
            <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto">
              {user ? JSON.stringify(user, null, 2) : 'No user'}
            </pre>
          </div>
          
          <div className="mt-4">
            <h4 className="font-semibold">Profile Data:</h4>
            <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto">
              {profile ? JSON.stringify(profile, null, 2) : 'No profile'}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuthDebug;