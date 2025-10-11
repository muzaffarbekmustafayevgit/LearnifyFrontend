import { useEffect, useState } from "react";

export default function AdminCourses() {
  const [courses, setCourses] = useState([]);
 const [form, setForm] = useState({
  title: "",
  description: "",
  category: "",
  status: "draft",
});


  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("accessToken");
  const API_URL = "http://localhost:5000/api/courses";

  useEffect(() => {
    fetchCourses();
  }, []);

  // 🟩 Barcha kurslarni olish
  const fetchCourses = async () => {
    try {
      setLoading(true);
      const res = await fetch(API_URL, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        const list = data.data?.courses || data.data || [];
        setCourses(list);
      } else {
        alert("Kurslarni olishda xatolik");
      }
    } catch (err) {
      console.error("Fetch error:", err);
      alert("Server bilan aloqa yo‘q!");
    } finally {
      setLoading(false);
    }
  };

  // ➕ Kurs yaratish yoki yangilash
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return alert("Kurs nomini kiriting!");

    try {
      const method = editingId ? "PUT" : "POST";
      const url = editingId ? `${API_URL}/${editingId}` : API_URL;
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (data.success) {
        alert(editingId ? "Kurs yangilandi!" : "Kurs qo‘shildi!");
        setForm({ title: "", description: "", status: "draft" });
        setEditingId(null);
        fetchCourses();
      } else {
        alert("Amalda xatolik: " + data.message);
      }
    } catch (err) {
      console.error("Submit error:", err);
    }
  };

  // ✏️ Kursni tahrirlash
  const handleEdit = (course) => {
    setForm({
      title: course.title,
      description: course.description || "",
      status: course.status || "draft",
    });
    setEditingId(course._id);
  };

  // ❌ Kursni o‘chirish
  const handleDelete = async (id) => {
    if (!window.confirm("Bu kursni o‘chirmoqchimisiz?")) return;
    try {
      const res = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        alert("Kurs o‘chirildi!");
        setCourses(courses.filter((c) => c._id !== id));
      } else {
        alert("O‘chirishda xatolik: " + data.message);
      }
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  // 🧹 Formani tozalash
  const clearForm = () => {
    setForm({ title: "", description: "", status: "draft" });
    setEditingId(null);
  };

 return (
  <div className="max-w-5xl p-6 mx-auto">
    

    {/* 🔹 CREATE / UPDATE FORM */}
    <form
      onSubmit={handleSubmit}
      className="p-6 mb-10 bg-white border border-gray-200 rounded-2xl shadow-md"
    >
      <h2 className="mb-5 text-xl font-semibold text-gray-700">
        {editingId ? "✏️ Kursni tahrirlash" : "➕ Yangi kurs qo‘shish"}
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
        </select>
      </div>

      {/* Tugmalar */}
      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          className="px-5 py-2.5 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors duration-200"
        >
          {editingId ? "💾 Saqlash" : "➕ Qo‘shish"}
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
        <p className="text-center text-gray-500">⏳ Kurslar yuklanmoqda...</p>
      ) : courses.length === 0 ? (
        <p className="text-center text-gray-500">
          📭 Hech qanday kurs topilmadi
        </p>
      ) : (
        <ul className="space-y-4">
          {courses.map((c) => (
            <li
              key={c._id}
              className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-800">
                  {c.title}
                </h3>
                <p className="text-sm text-gray-600 line-clamp-2">
                  {c.description || "Tavsif kiritilmagan"}
                </p>
                <div className="mt-1 text-xs text-gray-500 flex flex-wrap gap-2">
                  <span>📂 {c.category}</span>
                  <span>📈 Status: {c.status}</span>
                </div>
              </div>

              <div className="flex gap-2 mt-3 sm:mt-0">
                <button
                  onClick={() => handleEdit(c)}
                  className="px-3 py-1.5 text-sm text-white bg-yellow-500 rounded hover:bg-yellow-600 transition-colors"
                >
                  ✏️ Edit
                </button>
                <button
                  onClick={() => handleDelete(c._id)}
                  className="px-3 py-1.5 text-sm text-white bg-red-500 rounded hover:bg-red-600 transition-colors"
                >
                  ❌ Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  </div>
);

}
