// AuthContext.jsx
import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  // 🔹 Login qilganda tokenni saqlash
  const handleLogin = (token) => {
    localStorage.setItem("token", token);
    fetchProfile(token);
  };

  // 🔹 Logout qilish
  const handleLogout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  // 🔹 Profil olish funksiyasi
  const fetchProfile = async (token) => {
    try {
      const res = await fetch("http://localhost:5000/api/auth/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data);
      } else {
        handleLogout(); // Token eskirgan bo‘lsa chiqib ketadi
      }
    } catch (err) {
      console.error("Profile fetch error:", err);
      handleLogout();
    }
  };

  // 🔹 Sahifa refresh bo‘lganda tokenni tekshirish
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) fetchProfile(token);
  }, []);

  return (
    <AuthContext.Provider value={{ user, handleLogin, handleLogout }}>
      {children}
    </AuthContext.Provider>
  );
};

// ✅ Custom hook
export const useAuth = () => useContext(AuthContext);

// ✅ Default export (Fast Refresh uchun muhim)
export default AuthContext;
