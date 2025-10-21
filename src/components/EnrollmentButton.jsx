// components/EnrollmentButton.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function EnrollmentButton({ courseId, course }) {
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [enrollment, setEnrollment] = useState(null);
  const navigate = useNavigate();
  
  const token = localStorage.getItem('accessToken');
  const API_URL = 'http://localhost:5000/api';

  // Enrollment holatini tekshirish
  useEffect(() => {
    const checkEnrollment = async () => {
      try {
        const res = await fetch(`${API_URL}/enrollments/courses/${courseId}/enrollment`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (res.ok) {
          const data = await res.json();
          setIsEnrolled(true);
          setEnrollment(data.data.enrollment);
        }
      } catch (err) {
        console.error('Enrollment check error:', err);
      }
    };

    if (token && courseId) {
      checkEnrollment();
    }
  }, [courseId, token]);

  // Kursga yozilish
  const handleEnroll = async () => {
    if (!token) {
      navigate('/login');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/enrollments/courses/${courseId}/enroll`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await res.json();
      
      if (res.ok) {
        setIsEnrolled(true);
        setEnrollment(data.data.enrollment);
        alert('✅ Kursga muvaffaqiyatli yozildingiz!');
      } else {
        alert(data.message || 'Kursga yozilishda xatolik');
      }
    } catch (err) {
      console.error('Enrollment error:', err);
      alert('Server xatosi');
    } finally {
      setLoading(false);
    }
  };

  // Kursni ko'rish (agar yozilgan bo'lsa)
  const handleViewCourse = () => {
    navigate(`/learn/${courseId}`);
  };

  if (isEnrolled) {
    return (
      <div className="space-y-3">
        <button
          onClick={handleViewCourse}
          className="w-full px-6 py-3 font-semibold text-white transition bg-green-600 rounded-lg hover:bg-green-700"
        >
          📚 Kursni Davom Ettirish ({enrollment?.progress?.completionPercentage || 0}%)
        </button>
        
        {enrollment && (
          <div className="text-sm text-gray-600">
            <div className="w-full h-2 bg-gray-200 rounded-full">
              <div 
                className="h-2 transition-all bg-green-600 rounded-full"
                style={{ width: `${enrollment.progress?.completionPercentage || 0}%` }}
              ></div>
            </div>
            <div className="flex justify-between mt-1">
              <span>Progress:</span>
              <span>{enrollment.progress?.completedLessonsCount || 0} / {enrollment.progress?.totalLessons || 0} dars</span>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <button
      onClick={handleEnroll}
      disabled={loading}
      className={`w-full py-3 px-6 rounded-lg font-semibold transition ${
        loading
          ? 'bg-gray-400 cursor-not-allowed text-white'
          : 'bg-blue-600 hover:bg-blue-700 text-white'
      }`}
    >
      {loading ? (
        '⏳ Yozilmoqda...'
      ) : (
        '🎓 Bepul Kursga Yozilish'
      )}
    </button>
  );
}