import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

// Login.jsx - handleSubmit funksiyasini shunday o'zgartiring
const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    const res = await fetch("http://localhost:5000/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    console.log("Server response:", data); // Responseni to'liq ko'rish

    if (res.ok && data.success) {
      // ✅ XATOLIKNI OLDINI OLISH: data strukturasini tekshirish
      if (!data.data || !data.data.user) {
        throw new Error("Serverdan noto'g'ri ma'lumot qaytdi");
      }

      const { user, accessToken, refreshToken } = data.data;

      // ✅ XATOLIKNI OLDINI OLISH: user va role mavjudligini tekshirish
      if (!user || !user.role) {
        throw new Error("Foydalanuvchi ma'lumotlari to'liq emas");
      }

      // Token va rolni saqlash
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);
      localStorage.setItem("role", user.role);
      localStorage.setItem("user", JSON.stringify(user));
      
      // Rolga qarab yo'naltirish
      if (user.role === "student") {
        navigate("/student/dashboard");
      } else if (user.role === "teacher") {
        navigate("/teacher/dashboard");
      } else if (user.role === "admin") {
        navigate("/admin/dashboard");
      } else {
        navigate("/"); // fallback
      }
    } else {
      setMessage(data.message || "Login xatosi");
    }
  } catch (err) {
    console.error("Login error:", err);
    setMessage(err.message || "Server bilan ulanishda xatolik");
  }
};

  return (
    <div className="max-w-md p-6 mx-auto mt-10 bg-white shadow-lg rounded-xl">
      <h2 className="mb-4 text-2xl font-bold text-center">Login</h2>
      {message && <p className="text-sm text-center text-red-500">{message}</p>}
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-2 border rounded"
          required
        />
        <input
          type="password"
          placeholder="Parol"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-2 border rounded"
          required
        />
        <button
          type="submit"
          className="w-full p-2 text-white bg-blue-600 rounded hover:bg-blue-700"
        >
          Login
        </button>
      </form>
    </div>
  );
};

export default Login;
