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
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        console.error("Token topilmadi");
        navigate("/login");
        return;
      }

      const response = await fetch("http://localhost:5000/api/courses/my-courses", {
        method: "GET",
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem("accessToken");
          navigate("/login");
          return;
        }
        throw new Error(`HTTP xatolik! Status: ${response.status}`);
      }

      const result = await response.json();
      
      const courses = Array.isArray(result.data?.courses) 
        ? result.data.courses 
        : Array.isArray(result.courses) 
        ? result.courses 
        : Array.isArray(result) 
        ? result 
        : [];

      const totalStudents = courses.reduce(
        (acc, course) => acc + (course.enrolledStudents || course.students || 0),
        0
      );
      const totalEarnings = courses.reduce(
        (acc, course) => acc + (course.earnings || course.price || 0),
        0
      );

      setStats({
        totalCourses: courses.length,
        totalStudents,
        totalEarnings,
        activeCourses: courses.filter((c) => 
          c.status === "published" || c.isPublished === true
        ).length,
      });

      setRecentCourses(courses.slice(0, 5));
    } catch (error) {
      console.error("Dashboard ma'lumotlarini yuklashda xatolik:", error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon, color }) => (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <div className="flex items-center">
        <div className={`p-3 rounded-full ${color}`}>{icon}</div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  );

  // Frontend navigation funksiyalari - bu backend API emas
  const handleCreateCourse = () => {
    navigate("/teacher/create-course"); // Bu frontend route
  };

  const handleEditCourse = (courseId) => {
    navigate(`/teacher/courses/${courseId}/edit`); // Bu frontend route
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">⏳ Yuklanmoqda...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Sarlavha */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            O'qituvchi Dashboard
          </h1>
          <p className="mt-2 text-gray-600">
            Kursingiz va o'quvchilaringizni boshqaring
          </p>
        </div>

        {/* Statistikalar */}
        <div className="grid grid-cols-1 gap-6 mb-8 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Jami Kurslar"
            value={stats.totalCourses}
            color="bg-blue-100 text-blue-600"
            icon={<span>📚</span>}
          />
          <StatCard
            title="O'quvchilar"
            value={stats.totalStudents}
            color="bg-green-100 text-green-600"
            icon={<span>👥</span>}
          />
          <StatCard
            title="Daromad"
            value={`${stats.totalEarnings.toLocaleString()} so'm`}
            color="bg-purple-100 text-purple-600"
            icon={<span>💎</span>}
          />
          <StatCard
            title="Aktiv Kurslar"
            value={stats.activeCourses}
            color="bg-orange-100 text-orange-600"
            icon={<span>🔥</span>}
          />
        </div>

        {/* Harakatlar */}
        <div className="grid grid-cols-1 gap-6 mb-8 lg:grid-cols-2">
          {/* Tezkor Harakatlar */}
          <div className="p-6 bg-white rounded-lg shadow-md">
            <h2 className="mb-4 text-xl font-bold text-gray-900">
              Tezkor Harakatlar
            </h2>
            <div className="space-y-3">
              <button
                onClick={handleCreateCourse}
                className="flex items-center w-full p-4 text-left transition duration-200 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300"
              >
                <span className="p-2 mr-4 text-white bg-blue-600 rounded-lg">
                  ➕
                </span>
                <div>
                  <p className="font-medium text-gray-900">
                    Yangi Kurs Yaratish
                  </p>
                  <p className="text-sm text-gray-600">
                    Yangi kurs qo'shing
                  </p>
                </div>
              </button>

              <button
                onClick={() => navigate("/teacher/courses")}
                className="flex items-center w-full p-4 text-left transition duration-200 border border-gray-200 rounded-lg hover:bg-green-50 hover:border-green-300"
              >
                <span className="p-2 mr-4 text-white bg-green-600 rounded-lg">
                  📋
                </span>
                <div>
                  <p className="font-medium text-gray-900">
                    Kurslarni Boshqarish
                  </p>
                  <p className="text-sm text-gray-600">
                    Barcha kurslarni ko'rish
                  </p>
                </div>
              </button>

              <button
                onClick={() => navigate("/teacher/progress")}
                className="flex items-center w-full p-4 text-left transition duration-200 border border-gray-200 rounded-lg hover:bg-purple-50 hover:border-purple-300"
              >
                <span className="p-2 mr-4 text-white bg-purple-600 rounded-lg">
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
          <div className="p-6 bg-white rounded-lg shadow-md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">
                So'nggi Kurslar
              </h2>
              <Link
                to="/teacher/courses"
                className="text-blue-600 hover:text-blue-800"
              > 
                Barchasini ko'rish
              </Link>
            </div>
            <div className="space-y-4">
              {recentCourses.length > 0 ? (
                recentCourses.map((course) => (
                  <div
                    key={course._id || course.id}
                    className="flex items-center p-3 border border-gray-200 rounded-lg"
                  >
                    <img
                      src={course.image || course.thumbnail || "/default-course.jpg"}
                      alt={course.title}
                      className="w-12 h-12 rounded-lg object-cover"
                      onError={(e) => {
                        e.target.src = "/default-course.jpg";
                      }}
                    />
                    <div className="ml-3 flex-1">
                      <p className="font-medium text-gray-900">{course.title}</p>
                      <p className="text-sm text-gray-600">
                        {course.enrolledStudents || course.students || 0} o'quvchi •{" "}
                        {course.status === "published" || course.isPublished ? "Aktiv" : "Qoralama"}
                      </p>
                    </div>
                    <button
                      onClick={() => handleEditCourse(course._id || course.id)}
                      className="p-2 text-gray-600 transition duration-200 rounded-lg hover:bg-gray-100"
                    >
                      ✏️
                    </button>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-600">Hali kurslar mavjud emas</p>
                  <button
                    onClick={handleCreateCourse}
                    className="mt-2 text-blue-600 hover:text-blue-800"
                  >
                    Birinchi kursingizni yarating
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Statistika */}
        <div className="p-6 bg-white rounded-lg shadow-md">
          <h2 className="mb-4 text-xl font-bold text-gray-900">
            O'quvchilar Progressi
          </h2>
          <div className="text-center py-8 text-gray-600">
            Bu yerda o'quvchilar progressi grafiklari ko'rsatiladi
          </div>
        </div>
      </div>
    </div>
  );
}