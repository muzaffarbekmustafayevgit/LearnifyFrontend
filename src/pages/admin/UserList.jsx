import { useEffect, useState } from "react";

export default function UserList() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetch("/api/admin/users", {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    })
      .then((res) => res.json())
      .then((data) => setUsers(data.users || []))
      .catch((err) => console.error(err));
  }, []);

  return (
    <div className="p-6">
      <h1 className="mb-4 text-xl font-bold">👥 Foydalanuvchilar ro‘yxati</h1>
      <ul className="space-y-2">
        {users.map((u) => (
          <li key={u._id} className="p-2 border rounded bg-gray-50">
            <a href={`/admin/users/${u._id}`} className="text-blue-600 hover:underline">
              {u.name} ({u.email})
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
