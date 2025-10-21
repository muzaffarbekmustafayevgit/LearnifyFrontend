// src/pages/admin/ManageCourses.jsx - TO'G'RILANGAN
import { useEffect, useState } from "react";

export default function ManageCourses() {
  const [courses, setCourses] = useState([]);
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "",
    status: "draft",
  });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const token = localStorage.getItem("accessToken");
  const API_URL = "http://localhost:5000/api/courses";

  useEffect(() => {
    fetchCourses();
  }, []);

  // 🟩 Barcha kurslarni olish (ADMIN uchun)
  const fetchCourses = async () => {
    try {
      setLoading(true);
      setError("");
      
      console.log('Fetching admin courses...');
      const res = await fetch(`${API_URL}/admin/all-courses`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
      });
      
      console.log('Response status:', res.status);
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ message: 'Unknown error' }));
        console.log('Error response:', errorData);
        throw new Error(errorData.message || `HTTP xatolik! Status: ${res.status}`);
      }
      
      const data = await res.json();
      console.log("Courses data:", data);
      
      if (data.success) {
        setCourses(data.courses || []);
      } else {
        throw new Error(data.message || "Ma'lumotlarni olishda xatolik");
      }
    } catch (err) {
      console.error("Fetch error:", err);
      setError(`❌ ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // ➕ Kurs yaratish yoki yangilash
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return alert("Kurs nomini kiriting!");

    try {
      setError("");
      const method = editingId ? "PUT" : "POST";
      const url = editingId ? `${API_URL}/${editingId}` : API_URL;
      
      console.log('Submitting course:', { method, url, form });
      
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      console.log("Submit response:", data);

      if (!res.ok) {
        throw new Error(data.message || "So'rov bajarilmadi");
      }

      if (data.success) {
        alert(editingId ? "Kurs yangilandi!" : "Kurs qo'shildi!");
        setForm({ title: "", description: "", category: "", status: "draft" });
        setEditingId(null);
        fetchCourses();
      } else {
        throw new Error(data.message || "Amalda xatolik");
      }
    } catch (err) {
      console.error("Submit error:", err);
      setError(`❌ ${err.message}`);
    }
  };

  // ✏️ Kursni tahrirlash
  const handleEdit = (course) => {
    setForm({
      title: course.title,
      description: course.description || "",
      category: course.category || "",
      status: course.status || "draft",
    });
    setEditingId(course._id);
    setError("");
  };

  // ❌ Kursni o'chirish
  const handleDelete = async (id) => {
    if (!window.confirm("Bu kursni o'chirmoqchimisiz?")) return;
    try {
      setError("");
      const res = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
      });
      
      const data = await res.json();
      console.log("Delete response:", data);

      if (!res.ok) {
        throw new Error(data.message || "O'chirish amalga oshirilmadi");
      }

      if (data.success) {
        alert("Kurs o'chirildi!");
        fetchCourses();
      } else {
        throw new Error(data.message || "O'chirishda xatolik");
      }
    } catch (err) {
      console.error("Delete error:", err);
      setError(`❌ ${err.message}`);
    }
  };

  // 🧹 Formani tozalash
  const clearForm = () => {
    setForm({ title: "", description: "", category: "", status: "draft" });
    setEditingId(null);
    setError("");
  };

  return (
    <div className="max-w-5xl p-6 mx-auto">
      <h1 className="mb-6 text-2xl font-bold text-gray-800">👑 Admin - Barcha Kurslar</h1>

      {/* Xatolik ko'rsatish */}
      {error && (
        <div className="p-3 mb-4 text-red-700 bg-red-100 border border-red-300 rounded">
          {error}
        </div>
      )}

      {/* 🔹 CREATE / UPDATE FORM */}
      <form
        onSubmit={handleSubmit}
        className="p-6 mb-10 bg-white border border-gray-200 shadow-md rounded-2xl"
      >
        <h2 className="mb-5 text-xl font-semibold text-gray-700">
          {editingId ? "✏️ Kursni tahrirlash" : "➕ Yangi kurs qo'shish"}
        </h2>

        {/* Kurs nomi */}
        <div className="mb-4">
          <label className="block mb-1 text-sm font-medium text-gray-700">
            Kurs nomi:
          </label>
          <input
            type="text"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="w-full p-2.5 border rounded-lg border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            placeholder="Masalan: Web Dasturlash Asoslari"
            required
          />
        </div>

        {/* Tavsif */}
        <div className="mb-4">
          <label className="block mb-1 text-sm font-medium text-gray-700">
            Tavsif:
          </label>
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full p-2.5 border rounded-lg border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            rows="3"
            placeholder="Kurs haqida qisqacha..."
          />
        </div>

        {/* Kategoriya */}
        <div className="mb-4">
          <label className="block mb-1 text-sm font-medium text-gray-700">
            Kategoriya:
          </label>
          <select
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            className="w-full p-2.5 border rounded-lg border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            <option value="">Tanlang...</option>
            <option value="programming">💻 Dasturlash</option>
            <option value="design">🎨 Dizayn</option>
            <option value="marketing">📢 Marketing</option>
            <option value="business">💼 Biznes</option>
            <option value="language">🗣️ Til</option>
            <option value="science">🔬 Fan</option>
          </select>
        </div>

        {/* Holati */}
        <div className="mb-6">
          <label className="block mb-1 text-sm font-medium text-gray-700">
            Holati:
          </label>
          <select
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value })}
            className="w-full p-2.5 border rounded-lg border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            <option value="draft">📝 Draft</option>
            <option value="published">✅ Published</option>
            <option value="pending">🕓 Pending</option>
            <option value="archived">📦 Archived</option>
          </select>
        </div>

        {/* Tugmalar */}
        <div className="flex flex-wrap gap-3">
          <button
            type="submit"
            className="px-5 py-2.5 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors duration-200"
            disabled={loading}
          >
            {loading ? "⏳" : editingId ? "💾 Saqlash" : "➕ Qo'shish"}
          </button>

          {editingId && (
            <button
              type="button"
              onClick={clearForm}
              className="px-5 py-2.5 text-white bg-gray-500 rounded-lg hover:bg-gray-600 transition-colors duration-200"
            >
              Bekor qilish
            </button>
          )}
        </div>
      </form>

      {/* 🔹 COURSES LIST */}
      <section className="space-y-3">
        {loading ? (
          <div className="text-center">
            <div className="inline-block w-8 h-8 border-b-2 border-blue-600 rounded-full animate-spin"></div>
            <p className="mt-2 text-gray-600">Kurslar yuklanmoqda...</p>
          </div>
        ) : courses.length === 0 ? (
          <div className="p-8 text-center text-gray-500 bg-white border rounded-lg">
            <p className="text-lg">📭 Hech qanday kurs topilmadi</p>
            <p className="mt-2 text-sm">Yangi kurs qo'shish uchun yuqoridagi formadan foydalaning</p>
          </div>
        ) : (
          <div className="space-y-4">
            {courses.map((course) => (
              <div
                key={course._id}
                className="flex flex-col p-4 transition-shadow bg-white border border-gray-200 shadow-sm sm:flex-row sm:items-center sm:justify-between rounded-xl hover:shadow-md"
              >
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-800">
                    {course.title}
                  </h3>
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {course.description || "Tavsif kiritilmagan"}
                  </p>
                  <div className="flex flex-wrap gap-2 mt-1 text-xs text-gray-500">
                    <span>📂 {course.category || "Kategoriya yo'q"}</span>
                    <span className={`px-2 py-1 rounded ${
                      course.status === 'published' ? 'bg-green-100 text-green-800' :
                      course.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                      course.status === 'pending' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {course.status}
                    </span>
                    {course.teacher && (
                      <span>👨‍🏫 {course.teacher.name}</span>
                    )}
                    {course.students && (
                      <span>👥 {course.students.length} o'quvchi</span>
                    )}
                  </div>
                </div>

                <div className="flex gap-2 mt-3 sm:mt-0">
                  <button
                    onClick={() => handleEdit(course)}
                    className="px-3 py-1.5 text-sm text-white bg-yellow-500 rounded hover:bg-yellow-600 transition-colors"
                  >
                    ✏️ Tahrirlash
                  </button>
                  <button
                    onClick={() => handleDelete(course._id)}
                    className="px-3 py-1.5 text-sm text-white bg-red-500 rounded hover:bg-red-600 transition-colors"
                  >
                    ❌ O'chirish
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}