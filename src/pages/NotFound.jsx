import React from "react";
import { useNavigate } from "react-router-dom";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-gray-800 bg-gray-100 dark:bg-gray-900 dark:text-gray-100">
      <h1 className="mb-4 text-6xl font-bold">404</h1>
      <p className="mb-6 text-xl">Sahifa topilmadi</p>
      <button
        onClick={() => navigate("/")}
        className="px-4 py-2 text-white transition bg-blue-600 rounded hover:bg-blue-700"
      >
        Bosh sahifaga qaytish
      </button>
    </div>
  );
}
