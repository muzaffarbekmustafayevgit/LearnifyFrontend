// pages/teacher/CourseList.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const CourseList = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all'); // all, published, draft
  const navigate = useNavigate();

  const fetchCourses = async () => {
    try {
      const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/courses/my-courses?status=${filter}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Kurslarni olishda xatolik');

      const data = await response.json();
      setCourses(data.data.courses || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, [filter]);

  const handleDelete = async (courseId) => {
    if (!window.confirm('Kursni o\'chirishni tasdiqlaysizmi?')) return;

    try {
      const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/courses/${courseId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('O\'chirishda xatolik');

      alert('Kurs muvaffaqiyatli o\'chirildi');
      fetchCourses();
    } catch (err) {
      alert(err.message);
    }
  };

  const handlePublish = async (courseId) => {
    try {
      const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/courses/${courseId}/publish`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Nashr qilishda xatolik');

      alert('Kurs muvaffaqiyatli nashr qilindi');
      fetchCourses();
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-12 h-12 border-b-2 border-blue-600 rounded-full animate-spin"></div>
    </div>
  );

  if (error) return (
    <div className="p-4 text-red-700 bg-red-100 rounded-lg">
      {error}
    </div>
  );

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Mening Kurslarim</h1>
            <p className="text-gray-600">Barcha yaratilgan kurslaringiz</p>
          </div>
          <Link
            to="/teacher/create-course"
            className="px-6 py-3 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
          >
            + Yangi Kurs
          </Link>
        </div>

        {/* Filtrlar */}
        <div className="flex gap-4 mb-6">
          {['all', 'published', 'draft'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg ${
                filter === status
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 border'
              }`}
            >
              {status === 'all' && 'Barchasi'}
              {status === 'published' && 'Nashr qilingan'}
              {status === 'draft' && 'Qoralama'}
            </button>
          ))}
        </div>

        {/* Kurslar grid */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <div key={course._id} className="overflow-hidden bg-white rounded-lg shadow-md">
              {course.thumbnail && (
                <img
                  src={course.thumbnail}
                  alt={course.title}
                  className="object-cover w-full h-48"
                />
              )}
              <div className="p-6">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">{course.title}</h3>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    course.status === 'published' 
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {course.status === 'published' ? 'Nashr' : 'Qoralama'}
                  </span>
                </div>
                
                <p className="mb-4 text-sm text-gray-600 line-clamp-2">
                  {course.shortDescription || course.description}
                </p>

                <div className="flex items-center justify-between mb-4 text-sm text-gray-500">
                  <span>{course.level}</span>
                  <span>{course.price?.isFree ? 'Bepul' : `${course.price?.amount} so'm`}</span>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => navigate(`/teacher/courses/${course._id}`)}
                    className="flex-1 px-3 py-2 text-sm text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50"
                  >
                    Tahrirlash
                  </button>
                  
                  {course.status === 'draft' && (
                    <button
                      onClick={() => handlePublish(course._id)}
                      className="flex-1 px-3 py-2 text-sm text-green-600 border border-green-600 rounded-lg hover:bg-green-50"
                    >
                      Nashr qilish
                    </button>
                  )}
                  
                  <button
                    onClick={() => handleDelete(course._id)}
                    className="px-3 py-2 text-sm text-red-600 border border-red-600 rounded-lg hover:bg-red-50"
                  >
                    O'chirish
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {courses.length === 0 && (
          <div className="py-12 text-center bg-white rounded-lg">
            <div className="text-gray-400">
              <svg className="w-24 h-24 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h3 className="mb-2 text-lg font-medium text-gray-900">Kurslar topilmadi</h3>
            <p className="mb-4 text-gray-500">Hali hech qanday kurs yaratilmagan</p>
            <Link
              to="/teacher/create-course"
              className="px-6 py-3 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
            >
              Birinchi kursni yaratish
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseList;