import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useWeb3 } from '../../context/Web3Context';
import { User, Calendar, Mail, FileText, Clock, Award, Edit2, Save, X, Camera, Upload, Trash } from 'lucide-react';

const StudentProfile = () => {
  const { user, profile, updateProfile } = useAuth();
  const { walletAddress, formatAddress } = useWeb3();
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);
  
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    roll_number: '',
    email: '',
    bio: '',
  });
  
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPhotoOptions, setShowPhotoOptions] = useState(false);
  const [showCameraModal, setShowCameraModal] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [cameraStream, setCameraStream] = useState(null);
  
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
      
      // Set profile photo if it exists
      if (profile.photo_url) {
        setPhotoPreview(profile.photo_url);
      }
    }
  }, [profile, user]);

  // Clean up camera stream when component unmounts or modal closes
  useEffect(() => {
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [cameraStream]);

  // Stop camera when modal is closed
  useEffect(() => {
    if (!showCameraModal && cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
  }, [showCameraModal, cameraStream]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePhoto(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
      
      setShowPhotoOptions(false);
    }
  };
  
  const openCamera = async () => {
    try {
      setShowPhotoOptions(false);
      setShowCameraModal(true);
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: "user" },
        audio: false 
      });
      
      setCameraStream(stream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      setError("Could not access camera. Please check permissions.");
    }
  };
  
  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      // Set canvas dimensions to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      // Draw video frame to canvas
      const context = canvas.getContext('2d');
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Convert canvas to blob
      canvas.toBlob((blob) => {
        if (blob) {
          // Create a file from the blob
          const file = new File([blob], "camera-capture.jpg", { type: "image/jpeg" });
          setProfilePhoto(file);
          
          // Create preview URL
          const imageUrl = URL.createObjectURL(blob);
          setPhotoPreview(imageUrl);
          
          // Close camera modal and stop stream
          closeCamera();
        }
      }, 'image/jpeg', 0.95);
    }
  };
  
  const closeCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    setShowCameraModal(false);
  };
  
  const removePhoto = () => {
    setProfilePhoto(null);
    setPhotoPreview(null);
  };
  
  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setIsLoading(true);
      setError('');
      setSuccess('');
      
      // Create form data for API request
      const uploadData = new FormData();
      uploadData.append('first_name', formData.first_name);
      uploadData.append('last_name', formData.last_name);
      uploadData.append('bio', formData.bio);
      
      if (profilePhoto) {
        uploadData.append('profile_photo', profilePhoto);
      }
      
      // Update profile
      await updateProfile(uploadData);
      
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
    <div className="bg-purple-100 min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Information */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-100">
              <div className="p-6 bg-gradient-to-r from-purple-600 to-indigo-600 text-white relative">
                {!isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="absolute top-4 right-4 bg-white hover:bg-gray-100 text-purple-700 py-1 px-3 rounded-full flex items-center justify-center space-x-1 text-xs shadow-md transition-all duration-300 ease-in-out"
                  >
                    <Edit2 size={14} />
                    <span>Edit Profile</span>
                  </button>
                )}
                <div className="flex flex-col sm:flex-row items-center sm:items-start">
                  {isEditing ? (
                    <div className="relative">
                      <div 
                        className="h-24 w-24 rounded-full bg-white overflow-hidden mb-4 sm:mb-0 sm:mr-6 shadow-lg relative"
                        onClick={() => setShowPhotoOptions(!showPhotoOptions)}
                      >
                        {photoPreview ? (
                          <img 
                            src={photoPreview} 
                            alt="Profile Preview" 
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center text-purple-600 text-3xl font-bold">
                            {profile?.first_name?.[0] || user?.email?.[0]?.toUpperCase()}
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300">
                          <Camera size={24} className="text-white" />
                        </div>
                      </div>
                      
                      {/* Hidden file input */}
                      <input 
                        type="file" 
                        ref={fileInputRef}
                        onChange={handlePhotoUpload}
                        accept="image/*"
                        className="hidden"
                      />
                      
                      {/* Photo options dropdown */}
                      {showPhotoOptions && (
                        <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                          <div className="py-1">
                            <button
                              onClick={triggerFileInput}
                              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                            >
                              <Upload size={16} className="mr-2 text-purple-500" />
                              Upload from device
                            </button>
                            <button
                              onClick={openCamera}
                              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                            >
                              <Camera size={16} className="mr-2 text-purple-500" />
                              Take photo
                            </button>
                            {photoPreview && (
                              <button
                                onClick={removePhoto}
                                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 flex items-center"
                              >
                                <Trash size={16} className="mr-2" />
                                Remove photo
                              </button>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="h-24 w-24 rounded-full overflow-hidden bg-white text-purple-600 flex items-center justify-center text-3xl font-bold mb-4 sm:mb-0 sm:mr-6 shadow-lg">
                      {photoPreview ? (
                        <img 
                          src={photoPreview} 
                          alt="Profile" 
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        profile?.first_name?.[0] || user?.email?.[0]?.toUpperCase()
                      )}
                    </div>
                  )}
                  <div>
                    <h2 className="text-2xl font-bold">
                      {profile?.first_name} {profile?.last_name}
                    </h2>
                    <p className="text-purple-100">{profile?.role === 'student' ? 'Student' : 'Teacher'}</p>
                    
                    {profile?.roll_number && (
                      <div className="mt-2 flex items-center">
                        <span className="bg-purple-500 text-white px-2 py-1 rounded text-xs mr-2">
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
                        <label htmlFor="first_name" className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <User size={16} className="text-gray-400" />
                          </div>
                          <input
                            type="text"
                            id="first_name"
                            name="first_name"
                            value={formData.first_name}
                            onChange={handleChange}
                            className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring focus:ring-purple-500 focus:ring-opacity-50 text-sm"
                            required
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label htmlFor="last_name" className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <User size={16} className="text-gray-400" />
                          </div>
                          <input
                            type="text"
                            id="last_name"
                            name="last_name"
                            value={formData.last_name}
                            onChange={handleChange}
                            className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring focus:ring-purple-500 focus:ring-opacity-50 text-sm"
                            required
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Mail size={16} className="text-gray-400" />
                          </div>
                          <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            className="pl-10 block w-full rounded-md border-gray-300 bg-gray-100 shadow-sm text-sm text-gray-500"
                            disabled
                          />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                      </div>
                      
                      <div>
                        <label htmlFor="roll_number" className="block text-sm font-medium text-gray-700 mb-1">Roll Number</label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Calendar size={16} className="text-gray-400" />
                          </div>
                          <input
                            type="text"
                            id="roll_number"
                            name="roll_number"
                            value={formData.roll_number}
                            className="pl-10 block w-full rounded-md border-gray-300 bg-gray-100 shadow-sm text-sm text-gray-500"
                            disabled
                          />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Roll number cannot be changed</p>
                      </div>
                    </div>
                    
                    <div>
                      <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                      <textarea
                        id="bio"
                        name="bio"
                        value={formData.bio}
                        onChange={handleChange}
                        rows={4}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring focus:ring-purple-500 focus:ring-opacity-50 text-sm"
                        placeholder="Tell us a little about yourself"
                      ></textarea>
                    </div>
                    
                    <div className="flex justify-end space-x-4">
                      <button
                        type="button"
                        onClick={() => setIsEditing(false)}
                        className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                      >
                        <X size={16} className="mr-2" />
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isLoading}
                        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                      >
                        <Save size={16} className="mr-2" />
                        {isLoading ? 'Saving...' : 'Save Changes'}
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="text-sm font-medium text-gray-500 flex items-center">
                          <Mail size={16} className="mr-2 text-purple-500" />
                          Email
                        </h3>
                        <p className="mt-1 text-gray-900">{user?.email}</p>
                      </div>
                      
                      {profile?.roll_number && (
                        <div>
                          <h3 className="text-sm font-medium text-gray-500 flex items-center">
                            <Calendar size={16} className="mr-2 text-purple-500" />
                            Roll Number
                          </h3>
                          <p className="mt-1 text-gray-900">{profile.roll_number}</p>
                        </div>
                      )}
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 flex items-center">
                        <FileText size={16} className="mr-2 text-purple-500" />
                        Connected Wallet
                      </h3>
                      {walletAddress ? (
                        <p className="mt-1 text-gray-900 font-mono">
                          {formatAddress(walletAddress)}
                        </p>
                      ) : (
                        <p className="mt-1 text-gray-500 italic">No wallet connected</p>
                      )}
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 flex items-center">
                        <User size={16} className="mr-2 text-purple-500" />
                        Bio
                      </h3>
                      {profile?.bio ? (
                        <p className="mt-1 text-gray-900">{profile.bio}</p>
                      ) : (
                        <p className="mt-1 text-gray-500 italic">No bio provided</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Right Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Stats Card */}
            <div className="bg-white rounded-lg shadow-sm p-5 border border-gray-100">
              <div className="flex items-center space-x-2 mb-4">
                <Award size={18} className="text-purple-600" />
                <h2 className="font-semibold text-sm">Profile Status</h2>
              </div>
              
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-gray-500">Profile Completion</span>
                    <span className="text-xs font-medium text-purple-600">
                      {photoPreview && profile?.bio ? '100%' : photoPreview || profile?.bio ? '90%' : '80%'}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-purple-600 to-indigo-600 h-2 rounded-full" 
                      style={{ width: photoPreview && profile?.bio ? '100%' : photoPreview || profile?.bio ? '90%' : '80%' }}
                    ></div>
                  </div>
                </div>
                
                <div className="pt-2 border-t border-gray-100">
                  <div className="flex items-center space-x-2 text-xs mb-3">
                    <Clock size={14} className="text-purple-500" />
                    <span className="text-gray-500">Account created on</span>
                  </div>
                  <p className="text-sm font-medium">
                    {new Date().toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </p>
                </div>
              </div>
            </div>
            
            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm p-5 border border-gray-100">
              <div className="flex items-center space-x-2 mb-4">
                <Award size={18} className="text-purple-600" />
                <h2 className="font-semibold text-sm">Quick Actions</h2>
              </div>
              
              <div className="space-y-3">
                <button className="w-full text-left px-4 py-3 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-lg transition-colors flex items-center text-sm">
                  <Calendar size={16} className="mr-3 text-purple-500" />
                  View Attendance Records
                </button>
                
                <button className="w-full text-left px-4 py-3 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-lg transition-colors flex items-center text-sm">
                  <FileText size={16} className="mr-3 text-purple-500" />
                  Download Transcript
                </button>
                
                <button className="w-full text-left px-4 py-3 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-lg transition-colors flex items-center text-sm">
                  <User size={16} className="mr-3 text-purple-500" />
                  Update Password
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Camera Modal */}
      {showCameraModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
          <div className="bg-white rounded-lg shadow-lg overflow-hidden max-w-lg w-full">
            <div className="p-4 bg-purple-600 text-white flex justify-between items-center">
              <h3 className="font-medium">Take Profile Photo</h3>
              <button 
                onClick={closeCamera} 
                className="text-white hover:text-purple-200"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-4">
              <div className="relative bg-black rounded-lg overflow-hidden mb-4">
                <video 
                  ref={videoRef} 
                  autoPlay 
                  playsInline 
                  className="w-full h-64 object-cover"
                />
                <canvas ref={canvasRef} className="hidden" />
              </div>
              
              <div className="flex justify-center space-x-4">
                <button 
                  onClick={capturePhoto}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md flex items-center"
                >
                  <Camera size={16} className="mr-2" />
                  Capture Photo
                </button>
                <button 
                  onClick={closeCamera}
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-md"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentProfile;