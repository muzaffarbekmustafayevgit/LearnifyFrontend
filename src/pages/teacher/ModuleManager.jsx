import { useState, useEffect } from "react";

export default function ModuleManager() {
  const [modules, setModules] = useState([]);

  useEffect(() => {
    fetch("/api/modules", {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    })
      .then((res) => res.json())
      .then((data) => setModules(data.data || []));
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold">🧩 Modul boshqaruvi</h1>
      <ul className="mt-4 space-y-2">
        {modules.map((mod) => (
          <li key={mod._id} className="p-3 bg-white shadow rounded-xl">
            {mod.title}
          </li>
        ))}
      </ul>
    </div>
  );
}
