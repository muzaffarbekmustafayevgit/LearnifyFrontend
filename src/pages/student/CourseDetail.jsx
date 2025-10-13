import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import CourseView from "./CourseView"; // Yangi komponent

export default function CourseDetail() {
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCourseView, setShowCourseView] = useState(false);
  
  const { courseId } = useParams();
  const navigate = useNavigate();

  // Kurs ma'lumotlarini olish
  useEffect(() => {
    if (!courseId) return;

    const fetchCourse = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("accessToken");

        const res = await fetch(`http://localhost:5000/api/courses/${courseId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();

        if (!res.ok) throw new Error(data.message || "Kurs ma'lumotlarini olishda xatolik");

        if (data.success) {
          setCourse(data.data.course);
        } else {
          throw new Error("Kurs topilmadi");
        }
      } catch (err) {
        console.error("Xato:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [courseId]);

  // Ko'rish tugmasi bosilganda
  const handleViewCourse = () => {
    setShowCourseView(true);
  };

  // Yuklanish holati
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500">⏳ Kurs ma'lumotlari yuklanmoqda...</div>
      </div>
    );
  }

  // Xato holati
  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <strong>❌ Xatolik:</strong> {error}
          <button 
            onClick={() => navigate("/student/dashboard")}
            className="ml-4 bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
          >
            Dashboardga qaytish
          </button>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="p-8">
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
          <strong>⚠️ Diqqat:</strong> Kurs topilmadi
        </div>
      </div>
    );
  }

  // Agar CourseView ko'rsatilishi kerak bo'lsa
  if (showCourseView) {
    return <CourseView courseId={courseId} course={course} />;
  }

  // Asosiy kurs ma'lumotlari sahifasi
  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Kurs kartasi */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Kurs rasmi */}
        <div className="h-64 bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
          {course.thumbnail ? (
            <img 
              src={course.thumbnail} 
              alt={course.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="text-white text-6xl">📚</div>
          )}
        </div>

        {/* Kurs ma'lumotlari */}
        <div className="p-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">{course.title}</h1>
          <p className="text-gray-600 text-lg mb-6 leading-relaxed">{course.description}</p>

          {/* Kurs statistikasi */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">👨‍🏫</div>
              <div className="text-sm text-gray-600 mt-1">O'qituvchi</div>
              <div className="font-semibold">{course.teacher?.name || "Noma'lum"}</div>
            </div>
            
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">🏷️</div>
              <div className="text-sm text-gray-600 mt-1">Kategoriya</div>
              <div className="font-semibold">{course.category}</div>
            </div>
            
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">📊</div>
              <div className="text-sm text-gray-600 mt-1">Daraja</div>
              <div className="font-semibold capitalize">{course.level}</div>
            </div>
            
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">⭐</div>
              <div className="text-sm text-gray-600 mt-1">Reyting</div>
              <div className="font-semibold">{course.rating?.average || 0}/5</div>
            </div>
          </div>

          {/* Kurs tavsifi */}
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-3">📝 Kurs haqida</h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-gray-700">
                {course.shortDescription || "Ushbu kurs sizga yangi bilim va ko'nikmalarni o'rgatadi."}
              </p>
            </div>
          </div>

          {/* O'rganiladigan mavzular */}
          {course.learningOutcomes && course.learningOutcomes.length > 0 && (
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-3">🎯 O'rganiladigan mavzular</h3>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {course.learningOutcomes.map((outcome, index) => (
                  <li key={index} className="flex items-center text-gray-700">
                    <span className="text-green-500 mr-2">✓</span>
                    {outcome}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Talablar */}
          {course.requirements && course.requirements.length > 0 && (
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-gray-800 mb-3">📋 Talablar</h3>
              <ul className="space-y-2">
                {course.requirements.map((requirement, index) => (
                  <li key={index} className="flex items-center text-gray-600">
                    <span className="text-blue-500 mr-2">•</span>
                    {requirement}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Harakatlar */}
          <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200">
            <button
              onClick={handleViewCourse}
              className="flex-1 bg-blue-600 text-white py-4 px-6 rounded-lg font-semibold text-lg hover:bg-blue-700 transition duration-300 flex items-center justify-center"
            >
              <span className="mr-2">👁️</span>
              Kursni Ko'rish
            </button>
            
            <button
              onClick={() => navigate("/student/dashboard")}
              className="flex-1 bg-gray-600 text-white py-4 px-6 rounded-lg font-semibold text-lg hover:bg-gray-700 transition duration-300 flex items-center justify-center"
            >
              <span className="mr-2">←</span>
              Ortga Qaytish
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}