import { useEffect, useState } from "react";

export default function ManageCourses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  // 🔹 Kurslarni olish (faqat teacher uchun)
  useEffect(() => {
    const fetchMyCourses = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        if (!token) {
          setError("Avtorizatsiya talab qilinadi");
          setLoading(false);
          return;
        }

        console.log("🔄 Kurslar yuklanmoqda...");

        const res = await fetch("http://localhost:5000/api/courses/my-courses", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        console.log("📡 Javob statusi:", res.status);

        if (!res.ok) {
          throw new Error(`HTTP xatosi! Status: ${res.status}`);
        }

        const data = await res.json();
        console.log("📦 API javobi:", data);

        if (data.success && Array.isArray(data.data)) {
          setCourses(data.data);
          console.log("✅ Kurslar topildi:", data.data.length);
        } else {
          setError(data.message || "Kurslar topilmadi yoki format noto‘g‘ri.");
          setCourses([]);
        }
      } catch (err) {
        console.error("❌ Fetch xatosi:", err);
        setError(err.message || "Serverdan ma'lumot olishda xatolik yuz berdi.");
        setCourses([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMyCourses();
  }, []);

  // 🗑️ Kursni o‘chirish
  const handleDelete = async (id) => {
    if (!window.confirm("Haqiqatan ham o'chirmoqchimisiz?")) return;

    setDeletingId(id);
    try {
      const res = await fetch(`http://localhost:5000/api/courses/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });

      if (!res.ok) {
        throw new Error(`O'chirishda xatolik! Status: ${res.status}`);
      }

      setCourses((prev) => prev.filter((c) => c._id !== id));
      alert("✅ Kurs muvaffaqiyatli o'chirildi!");
    } catch (err) {
      alert("❌ Kursni o'chirishda muammo: " + err.message);
      console.error(err);
    } finally {
      setDeletingId(null);
    }
  };

  // 🔹 Holat ranglari
  const getStatusColor = (status) => {
    switch (status) {
      case "published":
        return "text-green-700 bg-green-100 px-2 py-1 rounded text-xs font-medium";
      case "draft":
        return "text-yellow-700 bg-yellow-100 px-2 py-1 rounded text-xs font-medium";
      case "pending":
        return "text-blue-700 bg-blue-100 px-2 py-1 rounded text-xs font-medium";
      default:
        return "text-gray-700 bg-gray-100 px-2 py-1 rounded text-xs font-medium";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "published":
        return "Nashr qilingan";
      case "draft":
        return "Qoralama";
      case "pending":
        return "Ko‘rib chiqilmoqda";
      default:
        return status || "Noma’lum";
    }
  };

  // 🔄 Yuklanish holati
  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
        <span className="ml-3 text-gray-600 text-lg">Kurslar yuklanmoqda...</span>
      </div>
    );
  }

  // ❗ Xatolik holati
  if (error) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg max-w-2xl mx-auto mt-8">
        <p className="text-red-700 font-semibold text-center">⚠️ {error}</p>
        <div className="flex justify-center mt-4">
          <button
            onClick={() => window.location.reload()}
            className="px-5 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
          >
            Qayta urinish
          </button>
        </div>
      </div>
    );
  }

  // 📚 Kurslar ro‘yxati
  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">📘 Mening kurslarim</h1>
          <p className="text-gray-500 mt-1">Jami: {courses.length} ta kurs</p>
        </div>
        <a
          href="/teacher/courses/create"
          className="px-5 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 transition"
        >
          <span>➕</span>
          <span>Yangi kurs</span>
        </a>
      </div>

      {courses.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-lg shadow-sm">
          <div className="text-6xl mb-4">📭</div>
          <p className="text-gray-600 text-lg mb-4">Hozircha kurslar mavjud emas.</p>
          <a
            href="/teacher/courses/create"
            className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Birinchi kursni yarating
          </a>
        </div>
      ) : (
        <div className="space-y-4">
          {courses.map((course) => (
            <div
              key={course._id}
              className="border border-gray-200 rounded-xl p-5 hover:shadow-lg bg-white transition-all"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-xl font-semibold text-gray-800">
                      {course.title}
                    </h2>
                    <span className={getStatusColor(course.status)}>
                      {getStatusText(course.status)}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-2">
                    <span>📂 {course.category || "Kategoriya yo‘q"}</span>
                    <span>👨‍🏫 {course.teacher?.name || "Siz"}</span>
                    {course.price?.amount >= 0 && (
                      <span>
                        💰{" "}
                        {course.price.amount === 0
                          ? "Bepul"
                          : `${course.price.amount} ${course.price.currency || "USD"}`}
                      </span>
                    )}
                  </div>

                  {course.description && (
                    <p className="text-gray-600 text-sm line-clamp-2">
                      {course.description}
                    </p>
                  )}
                </div>

                <div className="flex gap-2 flex-shrink-0">
                  <a
                    href={`/teacher/courses/${course._id}`}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center gap-2 transition"
                  >
                    ✏️ <span>Tahrirlash</span>
                  </a>
                  <button
                    onClick={() => handleDelete(course._id)}
                    disabled={deletingId === course._id}
                    className={`px-4 py-2 rounded-lg text-white flex items-center gap-2 transition ${
                      deletingId === course._id
                        ? "bg-red-300 cursor-not-allowed"
                        : "bg-red-500 hover:bg-red-600"
                    }`}
                  >
                    {deletingId === course._id ? (
                      <>
                        <div className="animate-spin h-4 w-4 border-b-2 border-white rounded-full"></div>
                        <span>O‘chirilmoqda...</span>
                      </>
                    ) : (
                      <>
                        🗑️ <span>O‘chirish</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap gap-4 mt-3 pt-3 border-t border-gray-100 text-xs text-gray-500">
                <span>ID: {course._id}</span>
                <span>
                  Yaratilgan: {new Date(course.createdAt).toLocaleDateString()}
                </span>
                {course.lessons && <span>Darslar: {course.lessons.length} ta</span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
