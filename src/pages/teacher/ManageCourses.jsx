import { useEffect, useState } from "react";

export default function ManageCourses() {
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    fetch("/api/courses", {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    })
      .then((res) => res.json())
      .then((data) => setCourses(data.data || []))
      .catch((err) => console.error("Error fetching courses:", err));
  }, []);

  const handleDelete = async (id) => {
    await fetch(`/api/courses/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    setCourses(courses.filter((c) => c._id !== id));
  };

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold">📚 Kurslarni boshqarish</h1>
      <ul className="mt-4 space-y-2">
        {courses.map((c) => (
          <li
            key={c._id}
            className="flex items-center justify-between p-3 border rounded"
          >
            <span>{c.title}</span>
            <div className="space-x-2">
              <a
                href={`/teacher/courses/${c._id}`}
                className="px-3 py-1 text-white bg-blue-500 rounded"
              >
                ✏️ Edit
              </a>
              <button
                onClick={() => handleDelete(c._id)}
                className="px-3 py-1 text-white bg-red-500 rounded"
              >
                ❌ Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
