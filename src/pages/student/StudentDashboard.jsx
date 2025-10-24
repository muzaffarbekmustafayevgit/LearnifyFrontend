import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function StudentDashboard() {
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [level, setLevel] = useState("all");
  const [enrollmentFilter, setEnrollmentFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [stats, setStats] = useState({ 
    total: 0, 
    filtered: 0,
    enrolled: 0,
    completed: 0
  });
  const [enrolling, setEnrolling] = useState({});
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [enrollmentsData, setEnrollmentsData] = useState([]);
  const navigate = useNavigate();

  // 📦 Kurslarni va yozilgan kurslarni olish
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError("");
        const token = localStorage.getItem("accessToken");

        console.log("🔄 Ma'lumotlar yuklanmoqda...");
        
        // Kurslarni olish
        const coursesRes = await fetch("http://localhost:5000/api/courses", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        console.log("📡 Courses response status:", coursesRes.status);
        
        if (!coursesRes.ok) {
          const errorText = await coursesRes.text();
          console.error("❌ Server error:", errorText);
          throw new Error(`Server xatosi: ${coursesRes.status}`);
        }

        const coursesData = await coursesRes.json();
        console.log("✅ Courses backend javobi:", coursesData);

        // 🔹 Backend turiga qarab moslashuv
        const coursesArray = coursesData?.courses || coursesData?.data?.courses || coursesData?.data || [];

        console.log(`📊 ${coursesArray.length} ta kurs topildi`);
        
        // Yozilgan kurslarni olish
        console.log("🔄 Yozilgan kurslar yuklanmoqda...");
        const enrollmentsRes = await fetch("http://localhost:5000/api/enrollments/my-enrollments", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        let enrolledCourseIds = [];
        let enrollmentsArray = [];
        
        if (enrollmentsRes.ok) {
          const enrollmentsData = await enrollmentsRes.json();
          console.log("✅ Enrollments backend javobi:", enrollmentsData);
          enrollmentsArray = enrollmentsData.data?.enrollments || enrollmentsData.enrollments || [];
          enrolledCourseIds = enrollmentsArray.map(enrollment => 
            enrollment.course?._id || enrollment.course
          );
        }

        if (coursesArray.length === 0) {
          setError("Hozircha kurslar mavjud emas");
        }

        setCourses(coursesArray);
        setEnrolledCourses(enrolledCourseIds);
        setEnrollmentsData(enrollmentsArray);
        
        // Statistikani hisoblash
        const completedCount = enrollmentsArray.filter(e => e.status === 'completed').length;
        
        setStats({
          total: coursesArray.length,
          filtered: coursesArray.length,
          enrolled: enrolledCourseIds.length,
          completed: completedCount
        });

      } catch (err) {
        console.error("❌ Xatolik:", err.message);
        setError(err.message || "Ma'lumotlarni yuklashda xatolik");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // 🔍 Filtrlash
  useEffect(() => {
    let filtered = [...courses];

    // Qidiruv bo'yicha filtrlash
    if (search.trim()) {
      filtered = filtered.filter((c) =>
        c.title?.toLowerCase().includes(search.toLowerCase()) ||
        c.description?.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Kategoriya bo'yicha filtrlash
    if (category !== "all") {
      filtered = filtered.filter((c) => c.category === category);
    }

    // Daraja bo'yicha filtrlash
    if (level !== "all") {
      filtered = filtered.filter((c) => c.level === level);
    }

    // Enrollment statusi bo'yicha filtrlash
    if (enrollmentFilter === "enrolled") {
      filtered = filtered.filter(course => enrolledCourses.includes(course._id));
    } else if (enrollmentFilter === "not-enrolled") {
      filtered = filtered.filter(course => !enrolledCourses.includes(course._id));
    }

    setFilteredCourses(filtered);
    setStats(prev => ({ 
      ...prev, 
      filtered: filtered.length 
    }));
  }, [search, category, level, enrollmentFilter, courses, enrolledCourses]);

  // 🎯 Kursga yozilish
// StudentDashboard.js - handleEnroll funksiyasini yangilaymiz

const handleEnroll = async (courseId, courseTitle) => {
  try {
    setEnrolling(prev => ({ ...prev, [courseId]: true }));
    setError("");
    
    const token = localStorage.getItem("accessToken");
    console.log(`🎯 Kursga yozilish: ${courseId}`);
    console.log(`📝 Kurs nomi: ${courseTitle}`);
    console.log(`🔑 Token mavjud: ${!!token}`);

    // Kurs ID ni tekshirish
    if (!courseId) {
      throw new Error("Kurs ID si noto‘g‘ri");
    }

    const res = await fetch(`http://localhost:5000/api/enrollments/courses/${courseId}/enroll`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    console.log("📡 Enrollment response status:", res.status);
    console.log("📡 Enrollment response headers:", res.headers);

    // Response ni o'qish
    const responseText = await res.text();
    console.log("📡 Enrollment response text:", responseText);

    let errorData;
    try {
      errorData = JSON.parse(responseText);
    } catch (e) {
      errorData = { message: responseText };
    }

    if (!res.ok) {
      console.error("❌ Enrollment error details:", {
        status: res.status,
        statusText: res.statusText,
        errorData: errorData
      });
      
      if (res.status === 404) {
        throw new Error(errorData.message || `"${courseTitle}" kursi topilmadi. Iltimos, admin bilan bog‘laning.`);
      } else if (res.status === 400 || res.status === 409) {
        throw new Error(errorData.message || `Siz allaqachon "${courseTitle}" kursiga yozilgansiz`);
      } else if (res.status === 403) {
        throw new Error("Kursga yozilish uchun ruxsat yo'q");
      } else {
        throw new Error(errorData.message || `Kursga yozilishda xatolik: ${res.status}`);
      }
    }

    const data = JSON.parse(responseText);
    console.log("✅ Enrollment muvaffaqiyatli:", data);

    // Yozilgan kurslar ro'yxatini yangilash
    setEnrolledCourses(prev => [...prev, courseId]);
    
    // Enrollment ma'lumotlarini yangilash
    if (data.data?.enrollment) {
      setEnrollmentsData(prev => [...prev, data.data.enrollment]);
    }
    
    // Statistikani yangilash
    setStats(prev => ({
      ...prev,
      enrolled: prev.enrolled + 1
    }));

    // Muvaffaqiyat xabari
    setError(`🎉 "${courseTitle}" kursiga muvaffaqiyatli yozildingiz!`);
    
    // 3 soniyadan so'ng xabarni yo'q qilish
    setTimeout(() => setError(""), 3000);

  } catch (err) {
    console.error("❌ Enrollment xatolik details:", {
      message: err.message,
      stack: err.stack
    });
    setError(err.message);
  } finally {
    setEnrolling(prev => ({ ...prev, [courseId]: false }));
  }
};

  // 🔄 Ma'lumotlarni qayta yuklash
  const refreshData = () => {
    setLoading(true);
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        
        // Kurslarni olish
        const coursesRes = await fetch("http://localhost:5000/api/courses", {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        const coursesData = await coursesRes.json();
        const coursesArray = coursesData?.courses || coursesData?.data?.courses || coursesData?.data || [];
        
        // Yozilgan kurslarni olish
        const enrollmentsRes = await fetch("http://localhost:5000/api/enrollments/my-enrollments", {
          headers: { Authorization: `Bearer ${token}` },
        });

        let enrolledCourseIds = [];
        let enrollmentsArray = [];
        
        if (enrollmentsRes.ok) {
          const enrollmentsData = await enrollmentsRes.json();
          enrollmentsArray = enrollmentsData.data?.enrollments || enrollmentsData.enrollments || [];
          enrolledCourseIds = enrollmentsArray.map(enrollment => 
            enrollment.course?._id || enrollment.course
          );
        }

        setCourses(coursesArray);
        setEnrolledCourses(enrolledCourseIds);
        setEnrollmentsData(enrollmentsArray);
        setError("");
        
        // Statistikani yangilash
        const completedCount = enrollmentsArray.filter(e => e.status === 'completed').length;
        setStats({
          total: coursesArray.length,
          filtered: coursesArray.length,
          enrolled: enrolledCourseIds.length,
          completed: completedCount
        });

      } catch (err) {
        setError("Ma'lumotlarni yangilashda xatolik");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  };

  // 🎯 Kursga o'tish (faqat yozilgan kurslar uchun)
  const handleCourseClick = (courseId, isEnrolled) => {
    if (!isEnrolled) {
      setError("Avval kursga yoziling!");
      return;
    }
    
    console.log("🎯 Kursga o'tilmoqda:", courseId);
    navigate(`/student/course/${courseId}`);
  };

  // 📊 Progress komponenti
  const CourseProgress = ({ enrollment, courseId }) => {
    if (!enrollment) return null;
    
    const percentage = enrollment.progress?.completionPercentage || 0;
    const completed = enrollment.progress?.completedLessonsCount || 0;
    const total = enrollment.progress?.totalLessons || 0;
    
    return (
      <div className="mt-3">
        <div className="flex items-center justify-between mb-2 text-xs text-gray-600">
          <span className="font-medium">Progress: {percentage}%</span>
          <span>{completed}/{total} dars</span>
        </div>
        <div className="w-full h-2 bg-gray-200 rounded-full">
          <div 
            className="h-2 transition-all duration-300 bg-green-600 rounded-full"
            style={{ width: `${percentage}%` }}
          ></div>
        </div>
        {enrollment.status === 'completed' && (
          <div className="mt-1 text-xs font-medium text-green-600">
            ✅ Kurs tugatildi!
          </div>
        )}
      </div>
    );
  };

  // 💬 Yuklanish komponenti
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="inline-block w-12 h-12 mb-4 border-b-2 border-blue-600 rounded-full animate-spin"></div>
          <p className="text-lg text-gray-600">Kurslar yuklanmoqda...</p>
          <p className="mt-2 text-sm text-gray-400">Bu biroz vaqt olishi mumkin</p>
        </div>
      </div>
    );
  }

  // ❌ Xato komponenti
  if (error && courses.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="max-w-md p-6 mx-auto text-center">
          <div className="mb-4 text-6xl text-red-500">⚠️</div>
          <h2 className="mb-2 text-xl font-bold text-gray-800">Xatolik yuz berdi</h2>
          <p className="mb-4 text-gray-600">{error}</p>
          <button
            onClick={refreshData}
            className="px-6 py-2 text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700"
          >
            🔄 Qayta urinish
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 bg-gray-50">
      <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        {/* Sarlavha va statistikalar */}
        <div className="mb-8">
          <div className="flex flex-col justify-between mb-6 md:flex-row md:items-center">
            <div>
              <h1 className="mb-2 text-3xl font-bold text-gray-900">🎓 O'quv Kurslari</h1>
              <p className="text-gray-600">
                O'zingizga mos kursni toping va bilimingizni oshiring
              </p>
            </div>
            <button
              onClick={refreshData}
              className="flex items-center gap-2 px-4 py-2 mt-4 text-sm font-medium text-gray-700 transition-colors bg-white border border-gray-300 rounded-lg hover:bg-gray-50 md:mt-0"
            >
              🔄 Yangilash
            </button>
          </div>
          
          {/* Statistikalar */}
          <div className="grid grid-cols-2 gap-4 mb-6 md:grid-cols-4">
            <div className="p-4 bg-white border rounded-lg shadow-sm">
              <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
              <div className="text-sm text-gray-500">Jami Kurslar</div>
            </div>
            <div className="p-4 bg-white border rounded-lg shadow-sm">
              <div className="text-2xl font-bold text-green-600">{stats.filtered}</div>
              <div className="text-sm text-gray-500">Topilgan</div>
            </div>
            <div className="p-4 bg-white border rounded-lg shadow-sm">
              <div className="text-2xl font-bold text-purple-600">{stats.enrolled}</div>
              <div className="text-sm text-gray-500">Yozilgan</div>
            </div>
            <div className="p-4 bg-white border rounded-lg shadow-sm">
              <div className="text-2xl font-bold text-orange-600">{stats.completed}</div>
              <div className="text-sm text-gray-500">Tugatilgan</div>
            </div>
          </div>
        </div>

        {/* 🔍 Filtr va qidiruv paneli */}
        <div className="p-6 mb-8 bg-white border shadow-sm rounded-2xl">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            {/* Qidiruv */}
            <div className="relative md:col-span-1">
              <input
                type="text"
                placeholder="🔎 Kurs nomi yoki tavsifi bo'yicha qidirish..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full px-4 py-3 pl-10 transition-all border border-gray-300 outline-none rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <div className="absolute text-gray-400 left-3 top-3">🔍</div>
            </div>

            {/* Kategoriya */}
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="px-4 py-3 border border-gray-300 outline-none rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">📚 Barcha toifalar</option>
              <option value="programming">👨‍💻 Dasturlash</option>
              <option value="design">🎨 Dizayn</option>
              <option value="marketing">📈 Marketing</option>
              <option value="business">💼 Biznes</option>
              <option value="language">🗣️ Tillar</option>
              <option value="science">🔬 Fan va Texnologiya</option>
            </select>

            {/* Daraja */}
            <select
              value={level}
              onChange={(e) => setLevel(e.target.value)}
              className="px-4 py-3 border border-gray-300 outline-none rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">🎯 Barcha darajalar</option>
              <option value="beginner">🟢 Boshlang'ich</option>
              <option value="intermediate">🟡 O'rta</option>
              <option value="advanced">🔴 Murakkab</option>
            </select>

            {/* Enrollment statusi */}
            <select
              value={enrollmentFilter}
              onChange={(e) => setEnrollmentFilter(e.target.value)}
              className="px-4 py-3 border border-gray-300 outline-none rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">📋 Barcha kurslar</option>
              <option value="enrolled">✅ Yozilgan kurslar</option>
              <option value="not-enrolled">➕ Yozilmagan kurslar</option>
            </select>
          </div>

          {/* Filtrlarni tozalash */}
          {(search || category !== "all" || level !== "all" || enrollmentFilter !== "all") && (
            <div className="flex items-center justify-between mt-4">
              <span className="text-sm text-gray-600">
                {stats.filtered} ta kurs topildi
              </span>
              <button
                onClick={() => {
                  setSearch("");
                  setCategory("all");
                  setLevel("all");
                  setEnrollmentFilter("all");
                }}
                className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-800"
              >
                🗑️ Barcha filtrlarni tozalash
              </button>
            </div>
          )}
        </div>

        {/* Xabarlar */}
        {error && (
          <div className={`p-4 mb-6 border rounded-xl ${
            error.includes("muvaffaqiyatli") 
              ? "bg-green-50 border-green-200" 
              : error.includes("yozilgansiz") || error.includes("topilmadi")
              ? "bg-yellow-50 border-yellow-200"
              : "bg-red-50 border-red-200"
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <span className={`mr-2 ${
                  error.includes("muvaffaqiyatli") ? "text-green-600" : 
                  error.includes("yozilgansiz") || error.includes("topilmadi") ? "text-yellow-600" : 
                  "text-red-600"
                }`}>
                  {error.includes("muvaffaqiyatli") ? "✅" : 
                   error.includes("yozilgansiz") || error.includes("topilmadi") ? "⚠️" : 
                   "❌"}
                </span>
                <span className={
                  error.includes("muvaffaqiyatli") ? "text-green-800" : 
                  error.includes("yozilgansiz") || error.includes("topilmadi") ? "text-yellow-800" : 
                  "text-red-800"
                }>
                  {error}
                </span>
              </div>
              <button 
                onClick={() => setError("")}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* 📚 Kurslar ro'yxati */}
        {filteredCourses.length === 0 ? (
          <div className="py-12 text-center">
            <div className="mb-4 text-6xl">📭</div>
            <h3 className="mb-2 text-xl font-semibold text-gray-700">Kurslar topilmadi</h3>
            <p className="mb-4 text-gray-500">
              {search || category !== "all" || level !== "all" || enrollmentFilter !== "all" 
                ? "Qidiruv shartlariga mos kurs topilmadi. Filtrlarni o'zgartirib ko'ring."
                : "Hozircha kurslar mavjud emas. Keyinroq koring."}
            </p>
            {(search || category !== "all" || level !== "all" || enrollmentFilter !== "all") && (
              <button
                onClick={() => {
                  setSearch("");
                  setCategory("all");
                  setLevel("all");
                  setEnrollmentFilter("all");
                }}
                className="px-6 py-2 text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700"
              >
                Barcha kurslarni ko'rsatish
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredCourses.map((course) => {
              const isEnrolled = enrolledCourses.includes(course._id);
              const enrollmentData = enrollmentsData.find(e => 
                e.course?._id === course._id || e.course === course._id
              );
              const isEnrolling = enrolling[course._id];
              
              return (
                <div
                  key={course._id}
                  className={`transition-all duration-300 bg-white border shadow-sm cursor-pointer rounded-2xl hover:shadow-lg hover:-translate-y-1 group ${
                    isEnrolled ? 'ring-2 ring-green-500' : ''
                  }`}
                >
                  {/* Kurs rasmi */}
                  <div className="relative overflow-hidden rounded-t-2xl">
                    <img
                      src={course.thumbnail || "/api/placeholder/300/160"}
                      alt={course.title}
                      className="object-cover w-full h-40 transition-transform duration-300 group-hover:scale-105"
                      onError={(e) => {
                        e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='160' viewBox='0 0 300 160'%3E%3Crect width='300' height='160' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='Arial' font-size='16' fill='%239ca3af'%3EKurs rasmi%3C/text%3E%3C/svg%3E";
                      }}
                    />
                    <div className="absolute top-3 left-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        course.level === 'beginner' ? 'bg-green-100 text-green-800' :
                        course.level === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {course.level === 'beginner' ? '🟢 Boshlang\'ich' :
                         course.level === 'intermediate' ? '🟡 O\'rta' :
                         '🔴 Murakkab'}
                      </span>
                    </div>
                    {isEnrolled && (
                      <div className="absolute top-3 right-3">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          enrollmentData?.status === 'completed' 
                            ? 'bg-purple-100 text-purple-800' 
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {enrollmentData?.status === 'completed' ? '✅ Tugatilgan' : '📚 Yozilgan'}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Kurs ma'lumotlari */}
                  <div className="p-4">
                    <h3 className="mb-2 font-semibold text-gray-900 transition-colors line-clamp-2 group-hover:text-blue-600">
                      {course.title}
                    </h3>
                    <p className="mb-3 text-sm text-gray-600 line-clamp-2">
                      {course.description || "Tavsif mavjud emas"}
                    </p>
                    
                    {/* Progress ko'rsatkich */}
                    {isEnrolled && enrollmentData && (
                      <CourseProgress enrollment={enrollmentData} courseId={course._id} />
                    )}
                    
                    <div className="flex items-center justify-between mb-3 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        📚 {course.category || "Umumiy"}
                      </span>
                      {course.teacher?.name && (
                        <span className="flex items-center gap-1">
                          👨‍🏫 {course.teacher.name}
                        </span>
                      )}
                    </div>

                    {/* Narx va action */}
                    <div className="flex items-center justify-between">
                      <div className="text-lg font-bold text-gray-900">
                        {course.price?.isFree ? "🆓 Bepul" : `💵 ${course.price?.amount || 0} ${course.price?.currency || 'USD'}`}
                      </div>
                      
                      {isEnrolled ? (
                        <button 
                          onClick={() => handleCourseClick(course._id, true)}
                          className={`px-4 py-2 text-sm font-medium text-white transition-colors rounded-lg ${
                            enrollmentData?.status === 'completed' 
                              ? 'bg-purple-600 hover:bg-purple-700' 
                              : 'bg-green-600 hover:bg-green-700'
                          }`}
                        >
                          {enrollmentData?.status === 'completed' ? '📚 Ko\'rib Chiqish' : '🎓 Davom Etish'}
                        </button>
                      ) : (
                        <button 
                          onClick={() => handleEnroll(course._id, course.title)}
                          disabled={isEnrolling}
                          className={`px-4 py-2 text-sm font-medium text-white transition-colors rounded-lg ${
                            isEnrolling 
                              ? 'bg-gray-400 cursor-not-allowed' 
                              : 'bg-blue-600 hover:bg-blue-700'
                          }`}
                        >
                          {isEnrolling ? (
                            <>
                              <div className="inline-block w-4 h-4 mr-2 border-b-2 border-white rounded-full animate-spin"></div>
                              Yozilmoqda...
                            </>
                          ) : (
                            'Kursga Yozilish'
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination yoki ko'proq yuklash (agar kerak bo'lsa) */}
        {filteredCourses.length > 0 && (
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600">
              {stats.filtered} ta kursdan {filteredCourses.length} tasi ko'rsatilmoqda
            </p>
          </div>
        )}
      </div>
    </div>
  );
}