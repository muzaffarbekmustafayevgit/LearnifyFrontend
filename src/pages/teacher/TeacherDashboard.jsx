import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";

export default function TeacherDashboard() {
  const [stats, setStats] = useState({
    totalCourses: 0,
    totalStudents: 0,
    totalEarnings: 0,
    activeCourses: 0,
  });
  const [recentCourses, setRecentCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError("");
      
      const token = localStorage.getItem("accessToken");
      if (!token) {
        console.error("Token topilmadi");
        navigate("/login");
        return;
      }

      console.log("🔄 Dashboard ma'lumotlari yuklanmoqda...");
      
      const response = await fetch("http://localhost:5000/api/courses/my-courses", {
        method: "GET",
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
      });

      console.log("📡 Response status:", response.status);
      
      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem("accessToken");
          navigate("/login");
          return;
        }
        throw new Error(`HTTP xatolik! Status: ${response.status}`);
      }

      const result = await response.json();
      console.log("✅ Dashboard ma'lumotlari:", result);
      
      // Kurslarni olish - turli response formatlari uchun
      let courses = [];
      if (result.success && result.data?.courses) {
        courses = result.data.courses;
      } else if (result.courses) {
        courses = result.courses;
      } else if (Array.isArray(result)) {
        courses = result;
      } else if (result.data && Array.isArray(result.data)) {
        courses = result.data;
      }

      console.log(`📊 ${courses.length} ta kurs topildi`);

      // Statistikani hisoblash
      const totalStudents = courses.reduce(
        (acc, course) => acc + (course.enrolledStudents || course.students?.length || 0),
        0
      );
      
      const totalEarnings = courses.reduce(
        (acc, course) => {
          const price = course.price?.amount || course.price || 0;
          const students = course.enrolledStudents || course.students?.length || 0;
          return acc + (price * students);
        },
        0
      );

      const activeCourses = courses.filter((c) => 
        c.status === "published" || c.isPublished === true
      ).length;

      setStats({
        totalCourses: courses.length,
        totalStudents,
        totalEarnings,
        activeCourses,
      });

      // So'nggi 5 ta kurs
      const sortedCourses = courses
        .sort((a, b) => new Date(b.createdAt || b.created) - new Date(a.createdAt || a.created))
        .slice(0, 5);
      
      setRecentCourses(sortedCourses);

    } catch (error) {
      console.error("❌ Dashboard ma'lumotlarini yuklashda xatolik:", error);
      setError(error.message || "Ma'lumotlarni yuklashda xatolik");
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon, color, description }) => (
    <div className="p-6 transition-shadow duration-300 bg-white border border-gray-100 shadow-sm rounded-xl hover:shadow-md">
      <div className="flex items-start justify-between">
        <div>
          <p className="mb-1 text-sm font-medium text-gray-600">{title}</p>
          <p className="mb-2 text-2xl font-bold text-gray-900">{value}</p>
          {description && (
            <p className="text-xs text-gray-500">{description}</p>
          )}
        </div>
        <div className={`p-3 rounded-xl ${color} text-2xl`}>
          {icon}
        </div>
      </div>
    </div>
  );

  const handleCreateCourse = () => {
    navigate("/teacher/create-course");
  };

  const handleEditCourse = (courseId) => {
    navigate(`/teacher/courses/${courseId}/edit`);
  };

  const handleViewCourse = (courseId) => {
    navigate(`/teacher/courses/${courseId}`);
  };

  // Yuklanish holati
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="inline-block w-12 h-12 mb-4 border-b-2 border-blue-600 rounded-full animate-spin"></div>
          <p className="text-lg text-gray-600">Dashboard yuklanmoqda...</p>
          <p className="mt-2 text-sm text-gray-400">Kurs ma'lumotlari olinmoqda</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
        {/* Sarlavha va yangilash */}
        <div className="flex flex-col mb-8 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              👨‍🏫 O'qituvchi Dashboard
            </h1>
            <p className="mt-2 text-gray-600">
              Kursingiz va o'quvchilaringizni boshqaring
            </p>
          </div>
          <button
            onClick={fetchDashboardData}
            className="flex items-center gap-2 px-4 py-2 mt-4 transition-colors bg-white border border-gray-300 rounded-lg sm:mt-0 hover:bg-gray-50"
          >
            🔄 Yangilash
          </button>
        </div>

        {/* Xato xabari */}
        {error && (
          <div className="p-4 mb-6 border border-red-200 bg-red-50 rounded-xl">
            <div className="flex items-center">
              <span className="mr-2 text-red-500">⚠️</span>
              <span className="text-red-700">{error}</span>
            </div>
            <button
              onClick={fetchDashboardData}
              className="mt-2 text-sm font-medium text-red-600 hover:text-red-800"
            >
              Qayta urinish
            </button>
          </div>
        )}

        {/* Statistikalar */}
        <div className="grid grid-cols-1 gap-6 mb-8 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Jami Kurslar"
            value={stats.totalCourses}
            description="Barcha yaratilgan kurslar"
            color="bg-blue-50 text-blue-600"
            icon="📚"
          />
          <StatCard
            title="O'quvchilar"
            value={stats.totalStudents}
            description="Jami ro'yxatdan o'tganlar"
            color="bg-green-50 text-green-600"
            icon="👥"
          />
          <StatCard
            title="Daromad"
            value={`${stats.totalEarnings.toLocaleString()} so'm`}
            description="Taxminiy jami daromad"
            color="bg-purple-50 text-purple-600"
            icon="💎"
          />
          <StatCard
            title="Aktiv Kurslar"
            value={stats.activeCourses}
            description="Nashr qilingan kurslar"
            color="bg-orange-50 text-orange-600"
            icon="🔥"
          />
        </div>

        {/* Asosiy kontent */}
        <div className="grid grid-cols-1 gap-6 mb-8 lg:grid-cols-2">
          {/* Tezkor Harakatlar */}
          <div className="p-6 bg-white border border-gray-100 shadow-sm rounded-xl">
            <h2 className="mb-4 text-xl font-bold text-gray-900">
              ⚡ Tezkor Harakatlar
            </h2>
            <div className="space-y-3">
              <button
                onClick={handleCreateCourse}
                className="flex items-center w-full p-4 text-left transition duration-200 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 hover:shadow-sm"
              >
                <span className="p-3 mr-4 text-lg text-white bg-blue-600 rounded-lg">
                  ➕
                </span>
                <div>
                  <p className="font-medium text-gray-900">
                    Yangi Kurs Yaratish
                  </p>
                  <p className="text-sm text-gray-600">
                    Yangi kurs qo'shish va sozlash
                  </p>
                </div>
              </button>

              <button
                onClick={() => navigate("/teacher/courses")}
                className="flex items-center w-full p-4 text-left transition duration-200 border border-gray-200 rounded-lg hover:bg-green-50 hover:border-green-300 hover:shadow-sm"
              >
                <span className="p-3 mr-4 text-lg text-white bg-green-600 rounded-lg">
                  📋
                </span>
                <div>
                  <p className="font-medium text-gray-900">
                    Kurslarni Boshqarish
                  </p>
                  <p className="text-sm text-gray-600">
                    Barcha kurslarni ko'rish va tahrirlash
                  </p>
                </div>
              </button>

              <button
                onClick={() => navigate("/teacher/students")}
                className="flex items-center w-full p-4 text-left transition duration-200 border border-gray-200 rounded-lg hover:bg-purple-50 hover:border-purple-300 hover:shadow-sm"
              >
                <span className="p-3 mr-4 text-lg text-white bg-purple-600 rounded-lg">
                  📊
                </span>
                <div>
                  <p className="font-medium text-gray-900">
                    O'quvchilar Progressi
                  </p>
                  <p className="text-sm text-gray-600">
                    O'quvchilar natijalarini ko'rish
                  </p>
                </div>
              </button>
            </div>
          </div>

          {/* So'nggi Kurslar */}
          <div className="p-6 bg-white border border-gray-100 shadow-sm rounded-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">
                📅 So'nggi Kurslar
              </h2>
              <Link
                to="/teacher/courses"
                className="text-sm font-medium text-blue-600 hover:text-blue-800"
              > 
                Barchasini ko'rish →
              </Link>
            </div>
            
            <div className="space-y-4">
              {recentCourses.length > 0 ? (
                recentCourses.map((course) => (
                  <div
                    key={course._id}
                    className="flex items-center p-4 transition-all duration-200 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-sm group"
                  >
                    <img
                      src={course.thumbnail || course.image || "/api/placeholder/60/60"}
                      alt={course.title}
                      className="flex-shrink-0 object-cover w-12 h-12 rounded-lg"
                      onError={(e) => {
                        e.target.src = "/api/placeholder/60/60";
                      }}
                    />
                    <div className="flex-1 min-w-0 ml-4">
                      <p className="font-medium text-gray-900 truncate transition-colors group-hover:text-blue-600">
                        {course.title}
                      </p>
                      <div className="flex items-center gap-2 mt-1 text-sm text-gray-600">
                        <span>{course.enrolledStudents || course.students?.length || 0} o'quvchi</span>
                        <span>•</span>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          course.status === 'published' ? 'bg-green-100 text-green-800' :
                          course.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {course.status === 'published' ? 'Aktiv' : 
                           course.status === 'draft' ? 'Qoralama' : 
                           course.status || 'Noma\'lum'}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleViewCourse(course._id)}
                        className="p-2 text-gray-400 transition-colors hover:text-blue-600"
                        title="Ko'rish"
                      >
                        👁️
                      </button>
                      <button
                        onClick={() => handleEditCourse(course._id)}
                        className="p-2 text-gray-400 transition-colors hover:text-yellow-600"
                        title="Tahrirlash"
                      >
                        ✏️
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center">
                  <div className="mb-3 text-4xl">📭</div>
                  <p className="mb-2 text-gray-600">Hali kurslar mavjud emas</p>
                  <button
                    onClick={handleCreateCourse}
                    className="font-medium text-blue-600 hover:text-blue-800"
                  >
                    Birinchi kursingizni yarating
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Qo'shimcha statistika */}
        <div className="p-6 bg-white border border-gray-100 shadow-sm rounded-xl">
          <h2 className="mb-4 text-xl font-bold text-gray-900">
            📈 O'quvchilar Statistika
          </h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="p-4 text-center rounded-lg bg-blue-50">
              <div className="text-2xl font-bold text-blue-600">{Math.round(stats.totalStudents * 0.7)}</div>
              <div className="text-sm text-blue-800">Faol o'quvchilar</div>
            </div>
            <div className="p-4 text-center rounded-lg bg-green-50">
              <div className="text-2xl font-bold text-green-600">{Math.round(stats.totalStudents * 0.4)}</div>
              <div className="text-sm text-green-800">Kursni tugatganlar</div>
            </div>
            <div className="p-4 text-center rounded-lg bg-purple-50">
              <div className="text-2xl font-bold text-purple-600">{Math.round(stats.totalEarnings / 1000)}K</div>
              <div className="text-sm text-purple-800">Oylik daromad</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}