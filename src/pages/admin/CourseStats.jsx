import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

export default function CourseStats() {
  const { id } = useParams();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetch(`/api/admin/course-stats/${id}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    })
      .then((res) => res.json())
      .then((data) => setStats(data))
      .catch((err) => console.error(err));
  }, [id]);

  if (!stats) return <p className="p-6">⏳ Yuklanmoqda...</p>;

  return (
    <div className="p-6">
      <h1 className="mb-4 text-xl font-bold">📊 Kurs statistikasi</h1>
      <p><strong>Kurs nomi:</strong> {stats.courseName}</p>
      <p><strong>Talabalar soni:</strong> {stats.studentCount}</p>
      <p><strong>O‘rtacha baho:</strong> {stats.averageRating}</p>
    </div>
  );
}
