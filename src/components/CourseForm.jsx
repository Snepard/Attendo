import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { createCourse } from '../utils/supabaseClient';

const CourseForm = ({ onCourseCreated }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    schedule: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setIsLoading(true);
      setError('');

      const { error } = await createCourse({
        ...formData,
        teacher_id: user.id
      });

      if (error) {
        throw error;
      }

      // Reset form
      setFormData({
        name: '',
        code: '',
        description: '',
        schedule: ''
      });

      // Notify parent component
      if (onCourseCreated) {
        onCourseCreated();
      }
    } catch (error) {
      console.error('Error creating course:', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold mb-4">Create New Course</h3>
      
      {error && (
        <div className="mb-4 bg-red-50 border-l-4 border-red-400 p-4 text-sm text-red-700">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="label">Course Name</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="input"
            required
          />
        </div>
        
        <div>
          <label htmlFor="code" className="label">Course Code</label>
          <input
            type="text"
            id="code"
            name="code"
            value={formData.code}
            onChange={handleChange}
            className="input"
            required
          />
        </div>
        
        <div>
          <label htmlFor="description" className="label">Description</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="input"
            rows={3}
          />
        </div>
        
        <div>
          <label htmlFor="schedule" className="label">Schedule</label>
          <input
            type="text"
            id="schedule"
            name="schedule"
            value={formData.schedule}
            onChange={handleChange}
            className="input"
            placeholder="e.g., Mon, Wed 10:00 AM - 11:30 AM"
          />
        </div>
        
        <button
          type="submit"
          disabled={isLoading}
          className="btn btn-primary w-full"
        >
          {isLoading ? 'Creating...' : 'Create Course'}
        </button>
      </form>
    </div>
  );
};

export default CourseForm;