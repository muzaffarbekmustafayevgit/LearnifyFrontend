import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function StudentDashboard() {
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [level, setLevel] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [stats, setStats] = useState({ total: 0, filtered: 0 });
  const navigate = useNavigate();

  // 📦 Kurslarni olish
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        setError("");
        const token = localStorage.getItem("accessToken");

        console.log("🔄 Kurslar yuklanmoqda...");
        const res = await fetch("http://localhost:5000/api/courses", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        console.log("📡 Response status:", res.status);
        
        if (!res.ok) {
          const errorText = await res.text();
          console.error("❌ Server error:", errorText);
          throw new Error(`Server xatosi: ${res.status}`);
        }

        const data = await res.json();
        console.log("✅ Backend javobi:", data);

        // 🔹 Backend turiga qarab moslashuv
        const coursesArray = data?.courses || data?.data?.courses || data?.data || [];

        console.log(`📊 ${coursesArray.length} ta kurs topildi`);
        
        if (coursesArray.length === 0) {
          setError("Hozircha kurslar mavjud emas");
        }

        setCourses(coursesArray);
        setFilteredCourses(coursesArray);
        setStats({
          total: coursesArray.length,
          filtered: coursesArray.length
        });
      } catch (err) {
        console.error("❌ Xatolik:", err.message);
        setError(err.message || "Kurslarni yuklashda xatolik");
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  // 🔍 Filtrlash
  useEffect(() => {
    let filtered = [...courses];

    if (search.trim()) {
      filtered = filtered.filter((c) =>
        c.title?.toLowerCase().includes(search.toLowerCase()) ||
        c.description?.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (category !== "all") {
      filtered = filtered.filter((c) => c.category === category);
    }

    if (level !== "all") {
      filtered = filtered.filter((c) => c.level === level);
    }

    setFilteredCourses(filtered);
    setStats(prev => ({ ...prev, filtered: filtered.length }));
  }, [search, category, level, courses]);

  // 🔄 Kurslarni qayta yuklash
  const refreshCourses = () => {
    setLoading(true);
    const fetchCourses = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        const res = await fetch("http://localhost:5000/api/courses", {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        const data = await res.json();
        const coursesArray = data?.courses || data?.data?.courses || data?.data || [];
        
        setCourses(coursesArray);
        setFilteredCourses(coursesArray);
        setError("");
      } catch (err) {
        setError("Yuklashda xatolik");
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  };

  // 🎯 Kursga o'tish
  const handleCourseClick = (courseId) => {
    console.log("🎯 Kursga o'tilmoqda:", courseId);
    navigate(`/student/course/${courseId}`);
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
            onClick={refreshCourses}
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
          <h1 className="mb-2 text-3xl font-bold text-gray-900">🎓 O'quv Kurslari</h1>
          <p className="mb-4 text-gray-600">
            O'zingizga mos kursni toping va bilimingizni oshiring
          </p>
          
          {/* Statistikalar */}
          <div className="flex flex-wrap gap-4 mb-6">
            <div className="bg-white rounded-lg shadow-sm border p-4 min-w-[150px]">
              <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
              <div className="text-sm text-gray-500">Jami Kurslar</div>
            </div>
            <div className="bg-white rounded-lg shadow-sm border p-4 min-w-[150px]">
              <div className="text-2xl font-bold text-green-600">{stats.filtered}</div>
              <div className="text-sm text-gray-500">Topilgan</div>
            </div>
          </div>
        </div>

        {/* 🔍 Filtr va qidiruv paneli */}
        <div className="p-6 mb-8 bg-white border shadow-sm rounded-2xl">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {/* Qidiruv */}
            <div className="relative">
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
          </div>

          {/* Filtrlarni tozalash */}
          {(search || category !== "all" || level !== "all") && (
            <div className="flex items-center justify-between mt-4">
              <span className="text-sm text-gray-600">
                {stats.filtered} ta kurs topildi
              </span>
              <button
                onClick={() => {
                  setSearch("");
                  setCategory("all");
                  setLevel("all");
                }}
                className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-800"
              >
                🗑️ Filtrlarni tozalash
              </button>
            </div>
          )}
        </div>

        {/* 📚 Kurslar ro'yxati */}
        {error && (
          <div className="p-4 mb-6 border border-yellow-200 bg-yellow-50 rounded-xl">
            <div className="flex items-center">
              <span className="mr-2 text-yellow-600">⚠️</span>
              <span className="text-yellow-800">{error}</span>
            </div>
          </div>
        )}

        {filteredCourses.length === 0 ? (
          <div className="py-12 text-center">
            <div className="mb-4 text-6xl">📭</div>
            <h3 className="mb-2 text-xl font-semibold text-gray-700">Kurslar topilmadi</h3>
            <p className="mb-4 text-gray-500">
              {search || category !== "all" || level !== "all" 
                ? "Qidiruv shartlariga mos kurs topilmadi. Filtrlarni o'zgartirib ko'ring."
                : "Hozircha kurslar mavjud emas. Keyinroq koring."}
            </p>
            {(search || category !== "all" || level !== "all") && (
              <button
                onClick={() => {
                  setSearch("");
                  setCategory("all");
                  setLevel("all");
                }}
                className="px-6 py-2 text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700"
              >
                Barcha kurslarni ko'rsatish
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredCourses.map((course) => (
              <div
                key={course._id}
                onClick={() => handleCourseClick(course._id)}
                className="transition-all duration-300 bg-white border shadow-sm cursor-pointer rounded-2xl hover:shadow-lg hover:-translate-y-1 group"
              >
                {/* Kurs rasmi */}
                <div className="relative overflow-hidden rounded-t-2xl">
                  <img
                    src={course.thumbnail || "/api/placeholder/300/160"}
                    alt={course.title}
                    className="object-cover w-full h-40 transition-transform duration-300 group-hover:scale-105"
                    onError={(e) => {
                      e.target.src = "/api/placeholder/300/160";
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
                </div>

                {/* Kurs ma'lumotlari */}
                <div className="p-4">
                  <h3 className="mb-2 font-semibold text-gray-900 transition-colors line-clamp-2 group-hover:text-blue-600">
                    {course.title}
                  </h3>
                  <p className="mb-3 text-sm text-gray-600 line-clamp-2">
                    {course.description || "Tavsif mavjud emas"}
                  </p>
                  
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
                    <button className="px-4 py-2 text-sm font-medium text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700">
                      Ko'rish →
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}