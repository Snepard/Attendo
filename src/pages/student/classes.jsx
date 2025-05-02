import { Video } from 'lucide-react';
import { Link } from 'react-router-dom';

const courses = [
  {
    id: 1,
    title: 'Introduction to Computer Science',
    instructor: 'Harvard CS50',
    url: 'https://www.youtube.com/watch?v=8mAITcNt710',
    duration: '11 hours',
    thumbnail: 'https://i.ytimg.com/vi/8mAITcNt710/hqdefault.jpg',
    category: 'Computer Science'
  },
  {
    id: 2,
    title: 'Machine Learning Course',
    instructor: 'Andrew Ng',
    url: 'https://www.youtube.com/watch?v=PPLop4L2eGk',
    duration: '15 hours',
    thumbnail: 'https://i.ytimg.com/vi/PPLop4L2eGk/hqdefault.jpg',
    category: 'Data Science'
  },
  {
    id: 3,
    title: 'Web Development Bootcamp',
    instructor: 'Colt Steele',
    url: 'https://www.youtube.com/watch?v=fis26HvvDII',
    duration: '30 hours',
    thumbnail: 'https://i.ytimg.com/vi/fis26HvvDII/hqdefault.jpg',
    category: 'Web Development'
  },
  {
    id: 4,
    title: 'Data Structures & Algorithms',
    instructor: 'freeCodeCamp',
    url: 'https://www.youtube.com/watch?v=RBSGKlAvoiM',
    duration: '8 hours',
    thumbnail: 'https://i.ytimg.com/vi/RBSGKlAvoiM/hqdefault.jpg',
    category: 'Computer Science'
  },
  {
    id: 5,
    title: 'Python for Beginners',
    instructor: 'Programming with Mosh',
    url: 'https://www.youtube.com/watch?v=_uQrJ0TkZlc',
    duration: '6 hours',
    thumbnail: 'https://i.ytimg.com/vi/_uQrJ0TkZlc/hqdefault.jpg',
    category: 'Programming'
  },
  {
    id: 6,
    title: 'React JS Course',
    instructor: 'Academind',
    url: 'https://www.youtube.com/watch?v=Dorf8i6lCuk',
    duration: '7 hours',
    thumbnail: 'https://i.ytimg.com/vi/Dorf8i6lCuk/hqdefault.jpg',
    category: 'Web Development'
  }
];

const Classes = () => {
  const categories = [...new Set(courses.map(course => course.category))];

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Classes</h1>
            <p className="text-gray-600">Access pre-recorded lectures and courses</p>
          </div>
          <Link 
            to="/student" 
            className="flex items-center text-purple-600 hover:text-purple-800"
          >
            <span className="mr-2">Back to Dashboard</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Categories Sidebar */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-4 sticky top-4">
              <h3 className="font-medium mb-4">Categories</h3>
              <ul className="space-y-2">
                {categories.map((category, index) => (
                  <li key={index}>
                    <button className="text-sm text-gray-700 hover:text-purple-600">
                      {category}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Courses Grid */}
          <div className="md:col-span-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
              {courses.map(course => (
                <div key={course.id} className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                  <a href={course.url} target="_blank" rel="noopener noreferrer" className="block group">
                    <div className="relative pt-[56.25%]">
                      <img 
                        src={course.thumbnail} 
                        alt={course.title}
                        className="absolute top-0 left-0 w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="bg-black bg-opacity-70 rounded-full p-3">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-medium text-gray-900 group-hover:text-purple-600 transition-colors">
                        {course.title}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">{course.instructor}</p>
                      <div className="flex justify-between items-center mt-3">
                        <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full">
                          {course.category}
                        </span>
                        <span className="text-xs text-gray-400">{course.duration}</span>
                      </div>
                    </div>
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Classes;