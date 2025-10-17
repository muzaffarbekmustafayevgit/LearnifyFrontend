import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
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
    setMessage("Tekshirilmoqda...");

    try {
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Xato yuz berdi");
      }

      // Ma'lumotlarni saqlash
      localStorage.setItem("accessToken", data.data.accessToken);
      localStorage.setItem("role", data.data.user.role);
      localStorage.setItem("user", JSON.stringify(data.data.user));

      setMessage("Muvaffaqiyatli!");
if (data.data.user.role==="student"){
  navigate('/student/dashboard')
}
if (data.data.user.role==="teacher"){
  navigate('/teacher/dashboard')
}
if (data.data.user.role==="admin"){
  navigate('/admin/dashboard')
}

    } catch (err) {
      setMessage(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md p-6 mx-auto mt-10 bg-white rounded-lg shadow-md">
      <h2 className="mb-4 text-2xl font-bold text-center">Tizimga kirish</h2>

      {message && (
        <div className={`p-3 mb-4 rounded text-center ${
          message.includes("Muvaffaqiyatli") 
            ? "bg-green-100 text-green-700" 
            : "bg-red-100 text-red-700"
        }`}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          className="w-full p-3 border rounded"
          required
        />
        
        <input
          type="password"
          name="password"
          placeholder="Parol"
          value={form.password}
          onChange={handleChange}
          className="w-full p-3 border rounded"
          required
        />
        
        <button
          type="submit"
          disabled={isLoading}
          className="w-full p-3 text-white bg-blue-600 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {isLoading ? "Kutilmoqda..." : "Kirish"}
        </button>
      </form>
    </div>
  );
}