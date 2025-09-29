import { useState, useEffect } from "react";

export default function LessonManager() {
  const [lessons, setLessons] = useState([]);

  useEffect(() => {
    fetch("/api/lessons", {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    })
      .then((res) => res.json())
      .then((data) => setLessons(data.data || []));
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold">📖 Dars boshqaruvi</h1>
      <ul className="mt-4 space-y-2">
        {lessons.map((lesson) => (
          <li key={lesson._id} className="p-3 bg-white shadow rounded-xl">
            {lesson.title}
          </li>
        ))}
      </ul>
    </div>
  );
}
