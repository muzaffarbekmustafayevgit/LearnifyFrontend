import { useEffect, useState } from "react";

export default function AchievementManager() {
  const [achievements, setAchievements] = useState([]);
  const [newAchievement, setNewAchievement] = useState("");

  useEffect(() => {
    fetch("/api/admin/achievements", {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    })
      .then((res) => res.json())
      .then((data) => setAchievements(data || []))
      .catch((err) => console.error(err));
  }, []);

  const handleAdd = () => {
    fetch("/api/admin/achievements", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({ title: newAchievement }),
    })
      .then((res) => res.json())
      .then((data) => setAchievements([...achievements, data]));
    setNewAchievement("");
  };

  return (
    <div className="p-6">
      <h1 className="mb-4 text-xl font-bold">🏆 Yutuqlarni boshqarish</h1>

      <div className="flex mb-4">
        <input
          type="text"
          className="flex-1 p-2 border rounded"
          placeholder="Yangi yutuq nomi"
          value={newAchievement}
          onChange={(e) => setNewAchievement(e.target.value)}
        />
        <button
          onClick={handleAdd}
          className="px-4 py-2 ml-2 text-white bg-blue-600 rounded"
        >
          ➕ Qo‘shish
        </button>
      </div>

      <ul className="space-y-2">
        {achievements.map((a) => (
          <li key={a._id} className="p-2 border rounded bg-gray-50">
            {a.title}
          </li>
        ))}
      </ul>
    </div>
  );
}
