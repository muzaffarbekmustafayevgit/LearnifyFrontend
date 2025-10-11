import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Logout = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // 🔐 Barcha saqlangan maʼlumotlarni o‘chirish
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("role");
    localStorage.removeItem("user");

    // 🔄 Login sahifaga qaytarish
    navigate("/");
  }, [navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen text-lg text-gray-700">
      Chiqmoqda...
    </div>
  );
};

export default Logout;
