import React, { useState } from "react";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        // Tokenlarni va user ma’lumotlarini saqlash
        localStorage.setItem("accessToken", data.accessToken);
        localStorage.setItem("refreshToken", data.refreshToken);
        localStorage.setItem("user", JSON.stringify(data.user));

        setMessage("Login muvaffaqiyatli!");

        // Rolga qarab yo‘naltirish
        const role = data.user.role;
        if (role === "student") {
          window.location.href = "/student/dashboard";
        } else if (role === "teacher") {
          window.location.href = "/teacher/dashboard";
        } else if (role === "admin") {
          window.location.href = "/admin/dashboard";
        } else {
          window.location.href = "/"; // fallback
        }
      } else {
        setMessage(data.message || "Login xatosi");
      }
    } catch (err) {
      setMessage("Server xatosi");
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
