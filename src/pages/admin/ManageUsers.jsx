// src/pages/admin/ManageUsers.jsx
import React, { useEffect, useState } from "react";

export default function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "student" });
  const [editingUser, setEditingUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem("accessToken"); // login qilganda saqlangan token

  // 🔹 Barcha userlarni olish
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/users/admin/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setUsers(data.users || []);
    } catch (err) {
      console.error("Foydalanuvchilarni olishda xato:", err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // 🔹 Form inputlarini boshqarish
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // 🔹 Yangi user yaratish yoki mavjudini yangilash
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = editingUser
        ? `http://localhost:5000/api/users/admin/users/${editingUser._id}`
        : "http://localhost:5000/api/users/admin/users";

      const method = editingUser ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      console.log("Natija:", data);

      setForm({ name: "", email: "", password: "", role: "student" });
      setEditingUser(null);
      fetchUsers();
    } catch (err) {
      console.error("Xatolik:", err);
    }
  };

  // 🔹 Userni tahrirlash
  const handleEdit = (user) => {
    setForm({
      name: user.name,
      email: user.email,
      password: "",
      role: user.role,
    });
    setEditingUser(user);
  };

  // 🔹 Userni o‘chirish
  const handleDelete = async (id) => {
    if (!window.confirm("Foydalanuvchini o‘chirishni xohlaysizmi?")) return;

    try {
      await fetch(`http://localhost:5000/api/users/admin/users/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchUsers();
    } catch (err) {
      console.error("O‘chirishda xato:", err);
    }
  };

  return (
    <div className="p-6">
      <h1 className="mb-4 text-xl font-bold">👨‍💼 Manage Users</h1>

      {/* 🔹 User form */}
      <form onSubmit={handleSubmit} className="mb-6 space-y-2">
        <input
          type="text"
          name="name"
          placeholder="Ism"
          value={form.name}
          onChange={handleChange}
          className="w-full p-2 border"
          required
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          className="w-full p-2 border"
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Parol"
          value={form.password}
          onChange={handleChange}
          className="w-full p-2 border"
          required={!editingUser}
        />
        <select
          name="role"
          value={form.role}
          onChange={handleChange}
          className="w-full p-2 border"
        >
          <option value="student">Student</option>
          <option value="teacher">Teacher</option>
          <option value="admin">Admin</option>
        </select>
        <button
          type="submit"
          className="px-4 py-2 text-white bg-blue-600 rounded"
        >
          {editingUser ? "Yangilash" : "Qo‘shish"}
        </button>
        {editingUser && (
          <button
            type="button"
            onClick={() => {
              setEditingUser(null);
              setForm({ name: "", email: "", password: "", role: "student" });
            }}
            className="px-4 py-2 ml-2 text-white bg-gray-500 rounded"
          >
            Bekor qilish
          </button>
        )}
      </form>

      {/* 🔹 Users list */}
      {loading ? (
        <p>⏳ Yuklanmoqda...</p>
      ) : (
        <table className="w-full border">
          <thead>
            <tr className="bg-gray-200">
              <th className="px-2 py-1 border">Ism</th>
              <th className="px-2 py-1 border">Email</th>
              <th className="px-2 py-1 border">Role</th>
              <th className="px-2 py-1 border">Amallar</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u._id}>
                <td className="px-2 py-1 border">{u.name}</td>
                <td className="px-2 py-1 border">{u.email}</td>
                <td className="px-2 py-1 border">{u.role}</td>
                <td className="px-2 py-1 space-x-2 border">
                  <button
                    onClick={() => handleEdit(u)}
                    className="px-2 py-1 text-white bg-yellow-500 rounded"
                  >
                    ✏️ Edit
                  </button>
                  <button
                    onClick={() => handleDelete(u._id)}
                    className="px-2 py-1 text-white bg-red-600 rounded"
                  >
                    🗑️ Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
