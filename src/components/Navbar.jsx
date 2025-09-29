import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");
  const [userName, setUserName] = useState("");

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user?.name) setUserName(user.name);
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
  };

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("role");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <nav className="flex items-center justify-between p-4 bg-white shadow-md dark:bg-gray-900">
      {/* Logo */}
      <div className="text-xl font-bold cursor-pointer" onClick={() => navigate("/")}>
        MyAppLogo
      </div>

      {/* Right side */}
      <div className="flex items-center space-x-4">
        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="px-3 py-1 transition border rounded hover:bg-gray-200 dark:hover:bg-gray-700"
        >
          {theme === "light" ? "🌞" : "🌙"}
        </button>

        {/* User name */}
        <span className="font-medium">{userName}</span>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="px-3 py-1 text-white transition bg-red-500 rounded hover:bg-red-600"
        >
          Logout
        </button>
      </div>
    </nav>
  );
}
