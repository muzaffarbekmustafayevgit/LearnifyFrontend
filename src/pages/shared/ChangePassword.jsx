import React, { useState } from "react";

const ChangePassword = () => {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleChangePassword = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("accessToken"); // login paytida saqlangan token
      const res = await fetch("http://localhost:5000/api/auth/change-password", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ oldPassword, newPassword }),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage("Parol muvaffaqiyatli yangilandi.");
      } else {
        setMessage(data.message || "Xatolik yuz berdi.");
      }
    } catch (err) {
      setMessage("Server bilan ulanishda xatolik.");
    }
  };

  return (
    <div className="max-w-md p-6 mx-auto mt-10 bg-white shadow-lg rounded-xl">
      <h2 className="mb-4 text-2xl font-bold text-center">Change Password</h2>
      {message && <p className="text-sm text-center text-red-500">{message}</p>}

      <form onSubmit={handleChangePassword} className="space-y-3">
        <input
          type="password"
          placeholder="Eski parol"
          value={oldPassword}
          onChange={(e) => setOldPassword(e.target.value)}
          className="w-full p-2 border rounded"
          required
        />
        <input
          type="password"
          placeholder="Yangi parol"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className="w-full p-2 border rounded"
          required
        />
        <button
          type="submit"
          className="w-full p-2 text-white bg-green-600 rounded hover:bg-green-700"
        >
          Yangilash
        </button>
      </form>
    </div>
  );
};

export default ChangePassword;
