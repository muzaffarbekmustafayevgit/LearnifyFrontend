import React, { useState } from "react";

const ActivateAccount = () => {
  const [code, setCode] = useState("");
  const [message, setMessage] = useState("");

  // Emailni localStorage dan olish
  const email = localStorage.getItem("userEmail");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch("http://localhost:5000/api/auth/activate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }), // ✅ email ham yuborilyapti
      });

      const data = await res.json();
      if (res.ok) {
        setMessage("Account activated successfully!");
        // Login sahifasiga yo‘naltirish
        setTimeout(() => {
          window.location.href = "/login";
        }, 1500);
      } else {
        setMessage(data.message || "Activation failed");
      }
    } catch (err) {
      setMessage("Server error");
    }
  };

  return (
    <div className="max-w-md p-6 mx-auto mt-10 bg-white shadow-lg rounded-xl">
      <h2 className="mb-4 text-2xl font-bold text-center">Activate Account</h2>
      {message && <p className="text-sm text-center text-red-500">{message}</p>}
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="text"
          placeholder="Activation Code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="w-full p-2 border rounded"
          required
        />
        <button
          type="submit"
          className="w-full p-2 text-white bg-green-600 rounded hover:bg-green-700"
        >
          Activate
        </button>
      </form>
    </div>
  );
};

export default ActivateAccount;
