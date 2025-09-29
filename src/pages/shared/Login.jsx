import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");

    try {
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      console.log("🔑 Server response:", data);

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Xatolik yuz berdi");
      }

      const { user, accessToken, refreshToken } = data.data;

      if (!accessToken || !user) {
        throw new Error("Token yoki foydalanuvchi maʼlumotlari mavjud emas");
      }

      // ✅ LocalStorage ga saqlash
      localStorage.setItem("accessToken", accessToken);
      if (refreshToken) localStorage.setItem("refreshToken", refreshToken);
      localStorage.setItem("role", user.role);
      localStorage.setItem("user", JSON.stringify(user));

      // ✅ Yo‘naltirish
      const roleRoutes = {
        student: "/student/dashboard",
        teacher: "/teacher/dashboard",
        admin: "/admin/dashboard",
      };
      navigate(roleRoutes[user.role] || "/");

    } catch (err) {
      console.error("❌ Login error:", err);
      setMessage(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md p-6 mx-auto mt-10 bg-white shadow-lg rounded-xl">
      <h2 className="mb-4 text-2xl font-bold text-center">🔐 Tizimga kirish</h2>

      {message && (
        <div
          className={`p-3 mb-4 rounded text-center text-sm ${
            message.includes("Xatolik") || message.includes("❌")
              ? "bg-red-100 text-red-700"
              : "bg-green-100 text-green-700"
          }`}
        >
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            type="email"
            name="email"
            placeholder="Elektron pochta manzilingiz"
            value={form.email}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            required
            disabled={isLoading}
          />
        </div>

        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700">
            Parol
          </label>
          <input
            type="password"
            name="password"
            placeholder="Parolingiz"
            value={form.password}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            required
            disabled={isLoading}
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full p-3 text-white transition duration-200 bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {isLoading ? "⏳ Kirilmoqda..." : "Kirish"}
        </button>
      </form>

      <div className="mt-4 space-y-2 text-center">
        <button
          type="button"
          onClick={() => navigate("/forgot-password")}
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          Parolni unutdingizmi?
        </button>
        <br />
        <button
          type="button"
          onClick={() => navigate("/register")}
          className="text-sm text-gray-600 hover:text-gray-800"
        >
          Hisobingiz yo‘qmi? Ro‘yxatdan o‘ting
        </button>
      </div>
    </div>
  );
};

export default Login;
