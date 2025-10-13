import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function StudentDashboard() {
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // 📦 Kurslarni olish
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("accessToken");

        const res = await fetch("http://localhost:5000/api/courses", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Cache-Control": "no-cache",
            "Pragma": "no-cache",
          },
        });

        const data = await res.json();
        // console.log("📦 Backend javobi:", data);

        if (!res.ok) throw new Error(data.message || "Kurslarni olishda xatolik");

        // 🔹 Backend turiga qarab moslashuv
        const coursesArray =
          data?.courses || data?.data?.courses || [];

        setCourses(coursesArray);
        setFilteredCourses(coursesArray);
      } catch (err) {
        console.error("❌ Xatolik:", err.message);
        setError(err.message);
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
        c.title?.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (category !== "all") {
      filtered = filtered.filter((c) => c.category === category);
    }

    setFilteredCourses(filtered);
  }, [search, category, courses]);

  // 💬 Yuklanish yoki xato holatlari
  if (loading)
    return <div className="p-8 text-gray-500">⏳ Kurslar yuklanmoqda...</div>;

  if (error)
    return (
      <div className="p-8 text-red-600 font-semibold">
        ❌ Xatolik: {error}
      </div>
    );

  // 🧭 Natijani chizish
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">🎓 Barcha Kurslar</h1>

      {/* 🔍 Qidiruv va filtr paneli */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <input
          type="text"
          placeholder="🔎 Kurs nomi bo‘yicha qidirish..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border border-gray-300 rounded-xl px-4 py-2 w-full sm:w-1/2 focus:ring focus:ring-blue-200 outline-none"
        />

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="border border-gray-300 rounded-xl px-4 py-2 w-full sm:w-1/4 focus:ring focus:ring-blue-200 outline-none"
        >
          <option value="all">Barcha toifalar</option>
          <option value="programming">👨‍💻 Dasturlash</option>
          <option value="design">🎨 Dizayn</option>
          <option value="marketing">📈 Marketing</option>
          <option value="business">💼 Biznes</option>
        </select>
      </div>

      {/* 📚 Kurslar ro‘yxati */}
      {filteredCourses.length === 0 ? (
        <p className="text-gray-500 italic">Hech qanday kurs topilmadi...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
            <div
              key={course._id}
              onClick={() => {
                // console.log("➡️ Navigatsiya:", course._id);
                navigate(`/student/course/${course._id}`);
              }}
              className="cursor-pointer border rounded-2xl shadow hover:shadow-lg hover:-translate-y-1 transition-all duration-300 bg-white"
            >
              <img
                src={course.thumbnail || "/default-course.jpg"}
                alt={course.title}
                className="w-full h-40 object-cover rounded-t-2xl"
              />
              <div className="p-4">
                <h3 className="text-lg font-semibold mb-1">
                  {course.title}
                </h3>
                <p className="text-sm text-gray-600 line-clamp-2">
                  {course.description || "Tavsif mavjud emas"}
                </p>
                <p className="text-xs text-gray-400 mt-2">
                  🏷️ {course.category || "Kategoriya yo‘q"}
                </p>
                <div className="mt-3 text-right">
                  <button className="text-blue-600 font-medium hover:underline">
                    Batafsil →
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
