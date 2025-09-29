import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

export default function UserDetails() {
  const { id } = useParams();
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetch(`/api/admin/users/${id}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    })
      .then((res) => res.json())
      .then((data) => setUser(data))
      .catch((err) => console.error(err));
  }, [id]);

  if (!user) return <p className="p-6">⏳ Yuklanmoqda...</p>;

  return (
    <div className="p-6">
      <h1 className="mb-4 text-xl font-bold">👤 {user.name} ma’lumotlari</h1>
      <p><strong>Email:</strong> {user.email}</p>
      <p><strong>Rol:</strong> {user.role}</p>
      <p><strong>Holat:</strong> {user.isActive ? "✅ Aktiv" : "❌ Bloklangan"}</p>
    </div>
  );
}
