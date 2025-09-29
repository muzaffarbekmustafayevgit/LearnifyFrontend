import { useEffect, useState } from "react";

export default function ManageCourses() {
  const [courses, setCourses] = useState([]);

useEffect(() => {
  fetch("http://localhost:5000/api/courses", {
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
  })
    .then((res) => res.json())
    .then((data) => {
      console.log("API response:", data);
      setCourses(Array.isArray(data.data) ? data.data : []); // 🔑
    })
    .catch((err) => console.error(err));
}, []);


  const handleDelete = async (id) => {
    try {
      const response = await fetch(`http://localhost:5000/api/courses/${id}`, {
        method: "DELETE",
        headers: { 
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json"
        }
      });
      
      const result = await response.json();
      
      if (result.success) {
        setCourses(courses.filter((c) => c._id !== id));
        alert("Kurs muvaffaqiyatli o'chirildi");
      } else {
        alert("O'chirishda xatolik: " + (result.message || "Noma'lum xatolik"));
      }
    } catch (error) {
      console.error("Delete xatosi:", error);
      alert("O'chirishda xatolik yuz berdi");
    }
  };

  return (
    <div className="p-6">
      <h1 className="mb-4 text-xl font-bold">📚 Manage Courses</h1>
      
      {courses.length === 0 ? (
        <p className="text-gray-500">Hech qanday kurs topilmadi</p>
      ) : (
        <ul className="space-y-3">
          {courses.map((c) => (
            <li key={c._id} className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <span className="font-medium">{c.title}</span>
                {c.description && (
                  <p className="mt-1 text-sm text-gray-600">{c.description}</p>
                )}
              </div>
              <button 
                onClick={() => handleDelete(c._id)} 
                className="px-3 py-1 text-white transition-colors bg-red-500 rounded hover:bg-red-600"
              >
                ❌ Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}