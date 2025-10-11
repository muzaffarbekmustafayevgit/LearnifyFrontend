import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function CreateCourse() {
  const [course, setCourse] = useState({
    title: "",
    description: "",
    price: "",
    level: "beginner",
    category: "",
  });

  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setCourse({ ...course, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("http://localhost:5000/api/courses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
        body: JSON.stringify(course),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        alert("✅ Kurs muvaffaqiyatli yaratildi!");
        navigate("/teacher/my-courses");
      } else {
        alert(`❌ Xatolik: ${data.message || "Kurs yaratishda muammo yuz berdi"}`);
      }
    } catch (err) {
      console.error("Kurs yaratishda xatolik:", err);
      alert("⚠️ Server bilan aloqa xatosi!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-2xl mx-auto bg-white shadow rounded-2xl">
      <h1 className="text-2xl font-bold mb-6 text-gray-800 flex items-center">
        📘 Yangi kurs yaratish
      </h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-medium text-gray-700 mb-1">
            Kurs nomi:
          </label>
          <input
            type="text"
            name="title"
            value={course.title}
            onChange={handleChange}
            placeholder="Masalan: JavaScript asoslari"
            className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-400"
            required
          />
        </div>

        <div>
          <label className="block font-medium text-gray-700 mb-1">
            Tavsif:
          </label>
          <textarea
            name="description"
            value={course.description}
            onChange={handleChange}
            placeholder="Kurs haqida qisqacha ma'lumot"
            rows="4"
            className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-400"
            required
          ></textarea>
        </div>

        <div>
          <label className="block font-medium text-gray-700 mb-1">
            Narx (UZS):
          </label>
          <input
            type="number"
            name="price"
            value={course.price}
            onChange={handleChange}
            placeholder="Masalan: 120000"
            className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-400"
            required
          />
        </div>

        <div>
          <label className="block font-medium text-gray-700 mb-1">
            Daraja:
          </label>
          <select
            name="level"
            value={course.level}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-400"
          >
            <option value="beginner">Boshlang‘ich</option>
            <option value="intermediate">O‘rta</option>
            <option value="advanced">Murakkab</option>
          </select>
        </div>

        <div>
          <label className="block font-medium text-gray-700 mb-1">
            Kategoriya:
          </label>
          <input
            type="text"
            name="category"
            value={course.category}
            onChange={handleChange}
            placeholder="Masalan: Dasturlash, Dizayn, IT"
            className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-400"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-2 font-semibold text-white rounded-lg transition ${
            loading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {loading ? "⏳ Yaratilmoqda..." : "➕ Kurs yaratish"}
        </button>
      </form>
    </div>
  );
}
