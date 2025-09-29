import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function CreateCourse() {
  const [course, setCourse] = useState({ 
    title: "", 
    description: "",
    category: "",
    level: "beginner",
    price: 0,
    image: ""
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const levels = [
    { value: "beginner", label: "Boshlang'ich" },
    { value: "intermediate", label: "O'rta" },
    { value: "advanced", label: "Murakkab" }
  ];

  const categories = [
    "Dasturlash",
    "Dizayn",
    "Marketing",
    "Biznes",
    "Shaxsiy rivojlanish",
    "Sanoat",
    "Texnologiya",
    "Boshqa"
  ];

  useEffect(() => {
    // Token ni tekshirish - barcha mumkin bo'lgan nomlar
    const token = localStorage.getItem("accessToken") || localStorage.getItem("token");
    const userRole = localStorage.getItem("userRole");
    
    console.log("Token:", token); // Debug
    console.log("UserRole:", userRole); // Debug
    
    if (!token) {
      alert("❌ Iltimos, avval tizimga kiring");
      navigate("/login");
      return;
    }

    if (userRole && !["teacher", "admin"].includes(userRole)) {
      alert("❌ Sizda kurs yaratish uchun ruxsat yo'q");
      navigate(-1);
    }
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCourse(prev => ({
      ...prev,
      [name]: name === "price" ? Number(value) : value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!course.title.trim()) {
      newErrors.title = "Kurs nomi talab qilinadi";
    } else if (course.title.length < 3) {
      newErrors.title = "Kurs nomi kamida 3 ta belgidan iborat bo'lishi kerak";
    }

    if (!course.description.trim()) {
      newErrors.description = "Kurs tavsifi talab qilinadi";
    } else if (course.description.length < 10) {
      newErrors.description = "Kurs tavsifi kamida 10 ta belgidan iborat bo'lishi kerak";
    }

    if (!course.category) {
      newErrors.category = "Kategoriya talab qilinadi";
    }

    if (course.price < 0) {
      newErrors.price = "Narx manfiy bo'lishi mumkin emas";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    // Token ni olish - barcha mumkin bo'lgan nomlar
    const token = localStorage.getItem("accessToken") || localStorage.getItem("token");
    
    console.log("Submit token:", token); // Debug

    if (!token) {
      alert("❌ Iltimos, avval tizimga kiring");
      navigate("/login");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("http://localhost:5000/api/courses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(course),
      });

      console.log("Response status:", response.status); // Debug

      // Avval status ni tekshirish
      if (response.status === 401) {
        // Token noto'g'ri yoki muddati o'tgan
        localStorage.removeItem("accessToken");
        localStorage.removeItem("token");
        localStorage.removeItem("userRole");
        alert("❌ Kirish vaqti tugadi. Iltimos, qaytadan kiring");
        navigate("/login");
        return;
      }

      if (response.status === 403) {
        alert("❌ Sizda kurs yaratish uchun ruxsat yo'q. Faqat o'qituvchilar va adminlar kurs yarata oladi.");
        return;
      }

      const data = await response.json();
      console.log("Response data:", data); // Debug

      if (!response.ok) {
        throw new Error(data.message || data.error || `HTTP xatolik! Status: ${response.status}`);
      }

      alert("✅ Kurs muvaffaqiyatli yaratildi!");
      
      // Formani tozalash
      setCourse({ 
        title: "", 
        description: "",
        category: "",
        level: "beginner",
        price: 0,
        image: ""
      });
      
      // Teacher dashboardga yo'naltirish
      setTimeout(() => {
        navigate("/teacher/dashboard");
      }, 1500);
      
    } catch (error) {
      console.error("Xatolik:", error);
      alert(`❌ Kurs yaratishda xatolik yuz berdi: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (window.confirm("Kurs yaratish bekor qilinsinmi?")) {
      navigate("/teacher/dashboard");
    }
  };

  return (
    <div className="min-h-screen py-8 bg-gray-50">
      <div className="max-w-2xl px-4 mx-auto sm:px-6 lg:px-8">
        <div className="overflow-hidden bg-white rounded-lg shadow-md">
          <div className="px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600">
            <h1 className="text-2xl font-bold text-white">➕ Yangi Kurs Yaratish</h1>
            <p className="mt-1 text-blue-100">
              Yangi kurs ma'lumotlarini to'ldiring va o'quvchilarga bilim bering
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Forma maydonlari oldingi kabi */}
            <div>
              <label htmlFor="title" className="block mb-2 text-sm font-medium text-gray-700">
                Kurs nomi *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={course.title}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.title ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Masalan: React.js - Zero to Hero"
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600">{errors.title}</p>
              )}
            </div>

            {/* Qolgan forma maydonlari... */}

            <div className="flex justify-end pt-4 space-x-4 border-t border-gray-200">
              <button
                type="button"
                onClick={handleCancel}
                className="px-6 py-2 text-gray-700 transition duration-200 border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                disabled={loading}
              >
                Bekor qilish
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex items-center px-6 py-2 text-white transition duration-200 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <svg className="w-5 h-5 mr-3 -ml-1 text-white animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Yaratilmoqda...
                  </>
                ) : (
                  "Kursni Yaratish"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}