// src/pages/admin/AdminStatistics.jsx
import { useEffect, useState } from "react";

export default function Statistics() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/admin/statistics", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`, // token bilan
          },
        });

        const data = await res.json();
        setStats(data);
      } catch (err) {
        console.error("❌ Statistikani olishda xatolik:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return <p className="p-6">⏳ Statistikalar yuklanmoqda...</p>;
  }

  if (!stats) {
    return <p className="p-6 text-red-500">❌ Statistikalar topilmadi</p>;
  }

  return (
    <div className="p-6">
      <h1 className="mb-6 text-xl font-bold">📊 Admin Statistikasi</h1>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="p-4 bg-blue-100 shadow rounded-2xl">
          <h2 className="text-lg font-semibold">👥 Foydalanuvchilar</h2>
          <p className="text-2xl font-bold">{stats.usersCount}</p>
        </div>

        <div className="p-4 bg-green-100 shadow rounded-2xl">
          <h2 className="text-lg font-semibold">📚 Kurslar</h2>
          <p className="text-2xl font-bold">{stats.coursesCount}</p>
        </div>

        <div className="p-4 bg-purple-100 shadow rounded-2xl">
          <h2 className="text-lg font-semibold">👨‍🏫 O‘qituvchilar</h2>
          <p className="text-2xl font-bold">{stats.teachersCount}</p>
        </div>
      </div>
    </div>
  );
}
