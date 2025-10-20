// src/pages/admin/ManageUsers.jsx
import React, { useEffect, useState } from "react";

export default function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({ 
    name: "", 
    email: "", 
    password: "", 
    role: "student" 
  });
  const [editingUser, setEditingUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const token = localStorage.getItem("accessToken");

  // 🔹 Barcha userlarni olish
  const fetchUsers = async () => {
    setLoading(true);
    try {
      // TO'G'RI ENDPOINT: /api/users/admin/users
      const res = await fetch("http://localhost:5000/api/users/admin/users", {
        headers: { 
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
      });

      if (!res.ok) {
        throw new Error(`HTTP xatolik! Status: ${res.status}`);
      }

      const data = await res.json();
      
      if (data.success) {
        setUsers(data.data || data.users || []);
      } else {
        throw new Error(data.message || "Ma'lumotlarni olishda xatolik");
      }
    } catch (err) {
      console.error("Foydalanuvchilarni olishda xato:", err);
      setMessage(`❌ ${err.message}`);
    } finally {
      setLoading(false);
    }
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
    setMessage("");

    try {
      // TO'G'RI ENDPOINTLAR:
      const url = editingUser
        ? `http://localhost:5000/api/users/admin/users/${editingUser._id}`
        : "http://localhost:5000/api/users/admin/users";

      const method = editingUser ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "So'rov bajarilmadi");
      }

      setMessage(`✅ ${editingUser ? "Foydalanuvchi yangilandi" : "Yangi foydalanuvchi qo'shildi"}`);
      setForm({ name: "", email: "", password: "", role: "student" });
      setEditingUser(null);
      fetchUsers(); // Ro'yxatni yangilash

    } catch (err) {
      console.error("Xatolik:", err);
      setMessage(`❌ ${err.message}`);
    }
  };

  // 🔹 Userni tahrirlash
  const handleEdit = (user) => {
    setForm({
      name: user.name,
      email: user.email,
      password: "", // Parolni bo'sh qoldiramiz
      role: user.role,
    });
    setEditingUser(user);
    setMessage("");
  };

  // 🔹 Userni o'chirish
  const handleDelete = async (id) => {
    if (!window.confirm("Foydalanuvchini o'chirishni xohlaysizmi?")) return;

    try {
      // TO'G'RI ENDPOINT: /api/users/admin/users/:id
      const res = await fetch(`http://localhost:5000/api/users/admin/users/${id}`, {
        method: "DELETE",
        headers: { 
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
      });

      const data = await res.json();
console.log(data);

      if (!res.ok || !data.success) {
        throw new Error(data.message || "O'chirish amalga oshirilmadi");
      }

      setMessage("✅ Foydalanuvchi muvaffaqiyatli o'chirildi");
      fetchUsers(); // Ro'yxatni yangilash

    } catch (err) {
      console.error("O'chirishda xato:", err);
      setMessage(`❌ ${err.message}`);
    }
  };

  // 🔹 Tahrirlashni bekor qilish
  const cancelEdit = () => {
    setEditingUser(null);
    setForm({ name: "", email: "", password: "", role: "student" });
    setMessage("");
  };

  return (
    <div className="p-6">
      <h1 className="mb-6 text-2xl font-bold text-gray-800">👨‍💼 Foydalanuvchilarni Boshqarish</h1>

      {/* Xabar ko'rsatish */}
      {message && (
        <div className={`p-3 mb-4 rounded ${
          message.includes("❌") 
            ? "bg-red-100 text-red-700 border border-red-300" 
            : "bg-green-100 text-green-700 border border-green-300"
        }`}>
          {message}
        </div>
      )}

      {/* 🔹 Foydalanuvchi qo'shish/tahrirlash formasi */}
      <div className="p-4 mb-6 bg-white border border-gray-200 rounded-lg shadow-sm">
        <h2 className="mb-4 text-lg font-semibold">
          {editingUser ? "👤 Foydalanuvchini Tahrirlash" : "➕ Yangi Foydalanuvchi"}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <input
              type="text"
              name="name"
              placeholder="To'liq ism"
              value={form.name}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
            <input
              type="email"
              name="email"
              placeholder="Email manzil"
              value={form.email}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
            <input
              type="password"
              name="password"
              placeholder={editingUser ? "Yangi parol (agar o'zgartirmoqchi bo'lsangiz)" : "Parol"}
              value={form.password}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required={!editingUser}
            />
            <select
              name="role"
              value={form.role}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="student">🎓 Student</option>
              <option value="teacher">👨‍🏫 Teacher</option>
              <option value="admin">👨‍💼 Admin</option>
            </select>
          </div>
          
          <div className="flex space-x-3">
            <button
              type="submit"
              className="px-6 py-3 text-white transition bg-blue-600 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              {editingUser ? "💾 Yangilash" : "➕ Qo'shish"}
            </button>
            {editingUser && (
              <button
                type="button"
                onClick={cancelEdit}
                className="px-6 py-3 text-gray-700 transition bg-gray-200 rounded-lg hover:bg-gray-300 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              >
                ❌ Bekor qilish
              </button>
            )}
          </div>
        </form>
      </div>

      {/* 🔹 Foydalanuvchilar ro'yxati */}
      <div className="overflow-hidden bg-white border border-gray-200 rounded-lg shadow-sm">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold">📋 Barcha Foydalanuvchilar</h2>
        </div>

        {loading ? (
          <div className="p-8 text-center">
            <div className="inline-block w-8 h-8 border-b-2 border-blue-600 rounded-full animate-spin"></div>
            <p className="mt-2 text-gray-600">Yuklanmoqda...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            ❌ Hozircha foydalanuvchilar mavjud emas
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Ism</th>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Email</th>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Rol</th>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Amallar</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex items-center justify-center flex-shrink-0 w-8 h-8 text-sm font-medium text-white bg-blue-500 rounded-full">
                          {user.name?.charAt(0)?.toUpperCase()}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{user.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{user.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        user.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                        user.role === 'teacher' ? 'bg-green-100 text-green-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {user.role === 'admin' ? '👨‍💼 Admin' :
                         user.role === 'teacher' ? '👨‍🏫 O\'qituvchi' :
                         '🎓 Talaba'}
                      </span>
                    </td>
                    <td className="px-6 py-4 space-x-2 text-sm font-medium whitespace-nowrap">
                      <button
                        onClick={() => handleEdit(user)}
                        className="px-3 py-1 text-yellow-600 transition rounded-md hover:text-yellow-900 bg-yellow-50 hover:bg-yellow-100"
                      >
                        ✏️ Tahrirlash
                      </button>
                      <button
                        onClick={() => handleDelete(user._id)}
                        className="px-3 py-1 text-red-600 transition rounded-md hover:text-red-900 bg-red-50 hover:bg-red-100"
                      >
                        🗑️ O'chirish
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}