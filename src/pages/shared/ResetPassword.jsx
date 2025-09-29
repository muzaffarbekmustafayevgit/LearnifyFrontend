import React, { useState } from "react";

const ResetPassword = () => {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [step, setStep] = useState(1); // 1 = email yuborish, 2 = kod kiritish
  const [message, setMessage] = useState("");

  const handleSendCode = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:5000/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        setStep(2);
        setMessage("Emailingizga tasdiqlash kodi yuborildi.");
      } else {
        setMessage(data.message || "Xatolik yuz berdi.");
      }
    } catch (err) {
      setMessage("Server bilan ulanishda xatolik.");
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:5000/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code, newPassword }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage("Parolingiz yangilandi. Endi login qilishingiz mumkin.");
      } else {
        setMessage(data.message || "Kod noto‘g‘ri yoki muddati o‘tgan.");
      }
    } catch (err) {
      setMessage("Server bilan ulanishda xatolik.");
    }
  };

  return (
    <div className="max-w-md p-6 mx-auto mt-10 bg-white shadow-lg rounded-xl">
      <h2 className="mb-4 text-2xl font-bold text-center">Reset Password</h2>
      {message && <p className="text-sm text-center text-red-500">{message}</p>}

      {step === 1 && (
        <form onSubmit={handleSendCode} className="space-y-3">
          <input
            type="email"
            placeholder="Emailingizni kiriting"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
          <button
            type="submit"
            className="w-full p-2 text-white bg-blue-600 rounded hover:bg-blue-700"
          >
            Kod yuborish
          </button>
        </form>
      )}

      {step === 2 && (
        <form onSubmit={handleResetPassword} className="space-y-3">
          <input
            type="text"
            placeholder="Tasdiqlash kodi"
            value={code}
            onChange={(e) => setCode(e.target.value)}
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
            Parolni tiklash
          </button>
        </form>
      )}
    </div>
  );
};

export default ResetPassword;
