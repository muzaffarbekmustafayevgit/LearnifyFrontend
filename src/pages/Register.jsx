import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Register = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "student",
    subject: "",
    faculty: "",
    experienceYears: 0,
  });

  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]:
        e.target.name === "experienceYears"
          ? Number(e.target.value)
          : e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const res = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });localStorage.setItem("userEmail", formData.email);

      const data = await res.json();

      if (res.ok) {
        setMessage("Registration successful! Please check your email.");
        navigate("/activate"); // 🔹 Email tasdiqlash sahifasiga yo‘naltirish
      } else {
        setMessage(data.message || "Registration failed");
      }
    } catch (err) {
      setMessage("Server error");
    }
  };

  return (
    <div className="max-w-md p-6 mx-auto mt-10 bg-white shadow-lg rounded-xl">
      <h2 className="mb-4 text-2xl font-bold text-center">Register</h2>
      {message && <p className="text-sm text-center text-red-500">{message}</p>}
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="text"
          name="name"
          placeholder="Full Name"
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        />
        <select
          name="role"
          onChange={handleChange}
          className="w-full p-2 border rounded"
        >
          <option value="student">Student</option>
          <option value="teacher">Teacher</option>
          <option value="admin">Admin</option>
        </select>

        {formData.role === "teacher" && (
          <>
            <input
              type="text"
              name="subject"
              placeholder="Subject"
              onChange={handleChange}
              className="w-full p-2 border rounded"
            />
            <input
              type="text"
              name="faculty"
              placeholder="Faculty"
              onChange={handleChange}
              className="w-full p-2 border rounded"
            />
            <input
              type="number"
              name="experienceYears"
              placeholder="Experience (Years)"
              onChange={handleChange}
              className="w-full p-2 border rounded"
            />
          </>
        )}

        <button
          type="submit"
          className="w-full p-2 text-white bg-blue-600 rounded hover:bg-blue-700"
        >
          Register
        </button>
      </form>
    </div>
  );
};

export default Register;
