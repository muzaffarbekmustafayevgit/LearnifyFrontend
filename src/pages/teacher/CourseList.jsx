import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function CourseList() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // 🧭 Kurslarni yuklash
  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        alert("Token topilmadi, iltimos qayta kiring!");
        navigate("/login");
        return;
      }

      const res = await fetch("http://localhost:5000/api/courses/my-courses", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      console.log("📦 Keldi:", data);

      if (!res.ok) throw new Error(data.message || "So‘rov xatosi");

      // Backend javobiga moslashuvchan parsing
      const foundCourses = data?.data?.courses || data?.courses || data || [];

      setCourses(Array.isArray(foundCourses) ? foundCourses : []);
    } catch (err) {
      console.error("❌ Kurslarni olishda xatolik:", err);
    } finally {
      setLoading(false);
    }
  };

  // ✏️ Kursni tahrirlash
  const handleEdit = (id) => {
    navigate(`/teacher/courses/${id}/edit`);
  };

  // ❌ Kursni o‘chirish
  const handleDelete = async (id) => {
    if (!window.confirm("Haqiqatan ham ushbu kursni o‘chirmoqchimisiz?")) return;

    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch(`http://localhost:5000/api/courses/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "O‘chirishda xatolik");

      alert("✅ Kurs muvaffaqiyatli o‘chirildi!");
      fetchCourses();
    } catch (err) {
      console.error("❌ Kursni o‘chirishda xatolik:", err);
      alert("Xatolik yuz berdi: " + err.message);
    }
  };

  // 🧱 UI qismi
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen text-lg">
        ⏳ Kurslar yuklanmoqda...
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">
        📚 Mening Kurslarim
      </h1>

      {courses.length === 0 ? (
        <div className="text-center text-gray-600 py-20">
          <p>Hali kurslar mavjud emas.</p>
          <button
            onClick={() => navigate("/teacher/create-course")}
            className="mt-4 px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            ➕ Yangi kurs yaratish
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto bg-white shadow rounded-lg">
          <table className="min-w-full border-collapse">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="p-3 text-left">#</th>
                <th className="p-3 text-left">Sarlavha</th>
                <th className="p-3 text-left">Status</th>
                <th className="p-3 text-left">O‘qituvchi</th>
                <th className="p-3 text-center">Harakatlar</th>
              </tr>
            </thead>
            <tbody>
              {courses.map((course, index) => (
                <tr
                  key={course._id || index}
                  className="border-t hover:bg-gray-50 transition"
                >
                  <td className="p-3">{index + 1}</td>
                  <td className="p-3 font-medium text-gray-800">
                    {course.title || "Nomlanmagan kurs"}
                  </td>
                  <td className="p-3">
                    <span
                      className={`px-3 py-1 rounded-full text-sm ${
                        course.status === "published"
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {course.status === "published" ? "Aktiv" : "Qoralama"}
                    </span>
                  </td>
                  <td className="p-3 text-gray-700">
                    {course.teacher?.name || "Noma’lum"}
                  </td>
                  <td className="p-3 text-center">
                    <button
                      onClick={() => handleEdit(course._id)}
                      className="px-3 py-1 mr-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      ✏️ Tahrirlash
                    </button>
                    <button
                      onClick={() => handleDelete(course._id)}
                      className="px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700"
                    >
                      🗑️ O‘chirish
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
