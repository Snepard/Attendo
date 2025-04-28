import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useWeb3 } from '../../context/Web3Context';

const StudentProfile = () => {
  const { user, profile, updateProfile } = useAuth();
  const { walletAddress, formatAddress } = useWeb3();
  
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    roll_number: '',
    email: '',
    bio: '',
  });
  
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Initialize form data with profile data
  useEffect(() => {
    if (profile) {
      setFormData({
        first_name: profile.first_name || '',
        last_name: profile.last_name || '',
        roll_number: profile.roll_number || '',
        email: user?.email || '',
        bio: profile.bio || '',
      });
    }
  }, [profile, user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setIsLoading(true);
      setError('');
      setSuccess('');
      
      // Update profile
      await updateProfile({
        first_name: formData.first_name,
        last_name: formData.last_name,
        bio: formData.bio,
      });
      
      setSuccess('Profile updated successfully');
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      setError('Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Your Profile</h1>
        <p className="text-gray-600">
          View and manage your profile information
        </p>
      </div>
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6 bg-primary-500 text-white">
          <div className="flex flex-col sm:flex-row items-center sm:items-start">
            <div className="h-24 w-24 rounded-full bg-white text-primary-500 flex items-center justify-center text-3xl font-bold mb-4 sm:mb-0 sm:mr-6">
              {profile?.first_name?.[0] || user?.email?.[0]?.toUpperCase()}
            </div>
            <div>
              <h2 className="text-2xl font-bold">
                {profile?.first_name} {profile?.last_name}
              </h2>
              <p className="text-primary-100">{profile?.role === 'student' ? 'Student' : 'Teacher'}</p>
              
              {profile?.roll_number && (
                <div className="mt-2 flex items-center">
                  <span className="bg-primary-400 text-white px-2 py-1 rounded text-xs mr-2">
                    Roll No.
                  </span>
                  <span>{profile.roll_number}</span>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="p-6">
          {error && (
            <div className="mb-4 bg-red-50 border-l-4 border-red-400 p-4 text-sm text-red-700">
              {error}
            </div>
          )}
          
          {success && (
            <div className="mb-4 bg-green-50 border-l-4 border-green-400 p-4 text-sm text-green-700">
              {success}
            </div>
          )}
          
          {isEditing ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="first_name" className="label">First Name</label>
                  <input
                    type="text"
                    id="first_name"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleChange}
                    className="input"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="last_name" className="label">Last Name</label>
                  <input
                    type="text"
                    id="last_name"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleChange}
                    className="input"
                    required
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="email" className="label">Email</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    className="input bg-gray-100"
                    disabled
                  />
                  <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                </div>
                
                <div>
                  <label htmlFor="roll_number" className="label">Roll Number</label>
                  <input
                    type="text"
                    id="roll_number"
                    name="roll_number"
                    value={formData.roll_number}
                    className="input bg-gray-100"
                    disabled
                  />
                  <p className="text-xs text-gray-500 mt-1">Roll number cannot be changed</p>
                </div>
              </div>
              
              <div>
                <label htmlFor="bio" className="label">Bio</label>
                <textarea
                  id="bio"
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  rows={4}
                  className="input"
                  placeholder="Tell us a little about yourself"
                ></textarea>
              </div>
              
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="btn bg-gray-200 text-gray-800 hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn btn-primary"
                >
                  {isLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Email</h3>
                  <p className="mt-1 text-gray-900">{user?.email}</p>
                </div>
                
                {profile?.roll_number && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Roll Number</h3>
                    <p className="mt-1 text-gray-900">{profile.roll_number}</p>
                  </div>
                )}
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">Connected Wallet</h3>
                {walletAddress ? (
                  <p className="mt-1 text-gray-900 font-mono">
                    {formatAddress(walletAddress)}
                  </p>
                ) : (
                  <p className="mt-1 text-gray-500 italic">No wallet connected</p>
                )}
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">Bio</h3>
                {profile?.bio ? (
                  <p className="mt-1 text-gray-900">{profile.bio}</p>
                ) : (
                  <p className="mt-1 text-gray-500 italic">No bio provided</p>
                )}
              </div>
              
              <div className="flex justify-end">
                <button
                  onClick={() => setIsEditing(true)}
                  className="btn btn-primary"
                >
                  Edit Profile
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentProfile;