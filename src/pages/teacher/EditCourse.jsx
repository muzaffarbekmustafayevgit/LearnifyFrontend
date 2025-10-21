import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

export default function EditCourse() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState({
    title: "",
    description: "",
    price: 0,
    level: "beginner",
    category: "",
    status: "draft",
  });
  const [modules, setModules] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [activeTab, setActiveTab] = useState("basic");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);

  // Yangi module/lesson formlari
  const [newModule, setNewModule] = useState({
    title: "",
    description: "",
    order: 0,
  });
  const [newLesson, setNewLesson] = useState({
    title: "",
    content: "",
    type: "text",
    duration: 0,
    order: 0,
    moduleId: "",
  });

  const token = localStorage.getItem("accessToken");
  const API_URL = "http://localhost:5000/api";

  // 🧩 Kurs va uning tarkibini yuklash
  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        setLoading(true);
        const [courseRes, modulesRes, lessonsRes] = await Promise.all([
          fetch(`${API_URL}/courses/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${API_URL}/modules/course/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${API_URL}/lessons/course/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        // Kurs ma'lumotlari
        const courseData = await courseRes.json();
        if (courseRes.ok && courseData.data?.course) {
          const c = courseData.data.course;
          setCourse({
            title: c.title || "",
            description: c.description || "",
            price: c.price?.amount || c.price || 0,
            level: c.level || "beginner",
            category: c.category || "",
            status: c.status || "draft",
          });
        } else {
          alert("⚠️ Kurs topilmadi yoki sizda huquq yo'q");
          navigate("/teacher/courses");
          return;
        }

        // Modullar
        const modulesData = await modulesRes.json();
        if (modulesData.success) {
          setModules(modulesData.data?.modules || modulesData.modules || []);
        }

        // Darslar
        const lessonsData = await lessonsRes.json();
        if (lessonsData.success) {
          setLessons(lessonsData.data?.lessons || lessonsData.lessons || []);
        }
      } catch (err) {
        console.error("Ma'lumotlarni olishda xatolik:", err);
        alert("Server bilan aloqa yo'q");
      } finally {
        setLoading(false);
      }
    };

    fetchCourseData();
  }, [id, navigate, token]);

  // ➕ Yangi module qo'shish
  const handleAddModule = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/modules`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: newModule.title,
          description: newModule.description,
          courseId: id,
          order: newModule.order || modules.length + 1,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        alert("✅ Modul qo'shildi!");
        setNewModule({ title: "", description: "", order: 0 });

        // Yangi modullarni yuklash
        const modulesRes = await fetch(`${API_URL}/modules/course/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const modulesData = await modulesRes.json();
        if (modulesData.success) {
          setModules(modulesData.data?.modules || modulesData.modules || []);
        }
      } else {
        alert("❌ Xatolik: " + (data.message || "Modul qo'shishda xatolik"));
      }
    } catch (error) {
      console.error("Modul qo'shishda xatolik:", error);
      alert("Server bilan aloqa xatosi!");
    }
  };

  // ➕ Yangi dars qo'shish
  const handleAddLesson = async (e) => {
    e.preventDefault();
    if (!newLesson.moduleId) {
      alert("Iltimos, modulni tanlang!");
      return;
    }

    if (!newLesson.type) {
      alert("Iltimos, dars turini tanlang!");
      return;
    }

    try {
      const lessonData = {
        title: newLesson.title,
        content: newLesson.content,
        type: newLesson.type,
        duration: newLesson.duration,
        courseId: id,
        moduleId: newLesson.moduleId,
        order:
          newLesson.order ||
          lessons.filter(
            (l) =>
              l.module === newLesson.moduleId ||
              l.moduleId === newLesson.moduleId
          ).length + 1,
      };

      console.log("Yuborilayotgan lesson ma'lumotlari:", lessonData);

      const res = await fetch(`${API_URL}/lessons`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(lessonData),
      });

      const data = await res.json();
      console.log("Server javobi:", data);

      if (res.ok && data.success) {
        alert("✅ Dars qo'shildi!");
        setNewLesson({
          title: "",
          content: "",
          type: "text",
          duration: 0,
          order: 0,
          moduleId: "",
        });

        // Yangi darslarni yuklash
        const lessonsRes = await fetch(`${API_URL}/lessons/course/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const lessonsData = await lessonsRes.json();
        if (lessonsData.success) {
          setLessons(lessonsData.data?.lessons || lessonsData.lessons || []);
        }
      } else {
        alert("❌ Xatolik: " + (data.message || "Dars qo'shishda xatolik"));
      }
    } catch (error) {
      console.error("Dars qo'shishda xatolik:", error);
      alert("Server bilan aloqa xatosi!");
    }
  };

  // 📝 Kursni yangilash
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch(`${API_URL}/courses/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: course.title,
          description: course.description,
          category: course.category,
          level: course.level,
          price: {
            amount: Number(course.price),
            currency: "USD",
            isFree: Number(course.price) === 0,
          },
        }),
      });

      const data = await res.json();

      if (res.ok) {
        alert("✅ Kurs muvaffaqiyatli yangilandi!");
      } else {
        alert(
          `❌ Xatolik: ${data.message || "Kursni yangilashda muammo yuz berdi"}`
        );
      }
    } catch (err) {
      console.error("Update error:", err);
      alert("⚠️ Server bilan aloqa xatosi!");
    } finally {
      setSaving(false);
    }
  };

  // ✏️ Modulni yangilash
  const handleUpdateModule = async (moduleId, field, value) => {
    try {
      const moduleToUpdate = modules.find((m) => m._id === moduleId);
      if (!moduleToUpdate) return;

      const res = await fetch(`${API_URL}/modules/${moduleId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: field === "title" ? value : moduleToUpdate.title,
          description:
            field === "description" ? value : moduleToUpdate.description,
          order: field === "order" ? value : moduleToUpdate.order,
        }),
      });

      if (res.ok) {
        // Local stateda yangilash
        const updatedModules = modules.map((module) =>
          module._id === moduleId ? { ...module, [field]: value } : module
        );
        setModules(updatedModules);
      } else {
        alert("Modulni yangilashda xatolik");
      }
    } catch (error) {
      console.error("Modul yangilash xatosi:", error);
      alert("Server bilan aloqa xatosi!");
    }
  };

  // ✏️ Darsni yangilash
  const handleUpdateLesson = async (lessonId, field, value) => {
    try {
      const lessonToUpdate = lessons.find((l) => l._id === lessonId);
      if (!lessonToUpdate) return;

      const res = await fetch(`${API_URL}/lessons/${lessonId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: field === "title" ? value : lessonToUpdate.title,
          content: field === "content" ? value : lessonToUpdate.content,
          type: field === "type" ? value : lessonToUpdate.type,
          duration: field === "duration" ? value : lessonToUpdate.duration,
          order: field === "order" ? value : lessonToUpdate.order,
          moduleId:
            field === "moduleId"
              ? value
              : lessonToUpdate.moduleId || lessonToUpdate.module?._id,
        }),
      });

      if (res.ok) {
        // Local stateda yangilash
        const updatedLessons = lessons.map((lesson) =>
          lesson._id === lessonId ? { ...lesson, [field]: value } : lesson
        );
        setLessons(updatedLessons);
      } else {
        alert("Darsni yangilashda xatolik");
      }
    } catch (error) {
      console.error("Dars yangilash xatosi:", error);
      alert("Server bilan aloqa xatosi!");
    }
  };

  // 🗑️ Modulni o'chirish
  const handleDeleteModule = async (moduleId) => {
    if (
      !window.confirm(
        "Bu modulni o'chirmoqchimisiz? Ichidagi barcha darslar ham o'chadi!"
      )
    )
      return;

    try {
      const res = await fetch(`${API_URL}/modules/${moduleId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (res.ok) {
        alert("✅ Modul o'chirildi!");
        // Yangilangan modullarni olish
        const modulesRes = await fetch(`${API_URL}/modules/course/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const modulesData = await modulesRes.json();
        if (modulesData.success) {
          setModules(modulesData.data?.modules || modulesData.modules || []);
        }
      } else {
        alert("❌ Xatolik: " + (data.message || "Modulni o'chirishda xatolik"));
      }
    } catch (error) {
      console.error("Modulni o'chirishda xatolik:", error);
      alert("Server bilan aloqa xatosi!");
    }
  };

  // 🗑️ Darsni o'chirish
  const handleDeleteLesson = async (lessonId) => {
    if (!window.confirm("Bu darsni o'chirmoqchimisiz?")) return;

    try {
      const res = await fetch(`${API_URL}/lessons/${lessonId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (res.ok) {
        alert("✅ Dars o'chirildi!");
        // Yangilangan darslarni olish
        const lessonsRes = await fetch(`${API_URL}/lessons/course/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const lessonsData = await lessonsRes.json();
        if (lessonsData.success) {
          setLessons(lessonsData.data?.lessons || lessonsData.lessons || []);
        }
      } else {
        alert("❌ Xatolik: " + (data.message || "Darsni o'chirishda xatolik"));
      }
    } catch (error) {
      console.error("Darsni o'chirishda xatolik:", error);
      alert("Server bilan aloqa xatosi!");
    }
  };

  // 📢 KURSNI NASHR QILISH
  const handlePublishCourse = async () => {
    // ✅ Kursni nashr qilish uchun minimal talablar
    if (!course.title || !course.description || !course.category) {
      alert("❌ Iltimos, kursning asosiy ma'lumotlarini to'ldiring (nomi, tavsif, kategoriya)");
      setActiveTab("basic");
      return;
    }

    if (modules.length === 0) {
      alert("❌ Kursda kamida bitta modul bo'lishi kerak!");
      setActiveTab("modules");
      return;
    }

    if (lessons.length === 0) {
      alert("❌ Kursda kamida bitta dars bo'lishi kerak!");
      setActiveTab("lessons");
      return;
    }

    // ✅ Har bir modulda kamida bitta dars borligini tekshirish
    const modulesWithoutLessons = modules.filter(module => {
      const moduleLessons = lessons.filter(
        lesson => lesson.module === module._id || lesson.moduleId === module._id
      );
      return moduleLessons.length === 0;
    });

    if (modulesWithoutLessons.length > 0) {
      alert(`❌ Quyidagi modullarda darslar mavjud emas: ${modulesWithoutLessons.map(m => m.title).join(', ')}`);
      setActiveTab("modules");
      return;
    }

    if (!window.confirm("Kursni nashr qilmoqchimisiz? Nashr qilingandan so'ng, kurs o'quvchilar uchun ko'rinadi.")) {
      return;
    }

    try {
      setPublishing(true);
      const res = await fetch(`${API_URL}/courses/${id}/publish`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (res.ok) {
        alert("✅ Kurs muvaffaqiyatli nashr qilindi!");
        // Statusni yangilash
        setCourse(prev => ({ ...prev, status: "published" }));
      } else {
        alert(`❌ Nashr qilishda xatolik: ${data.message || "Server xatosi"}`);
      }
    } catch (error) {
      console.error("Nashr qilish xatosi:", error);
      alert("❌ Server bilan aloqa xatosi!");
    } finally {
      setPublishing(false);
    }
  };

  // 🚫 KURSNI NASHRDAN OLISH (unpublish)
  const handleUnpublishCourse = async () => {
    if (!window.confirm("Kursni nashrdan olmoqchimisiz? Bu kurs endi o'quvchilar uchun ko'rinmaydi.")) {
      return;
    }

    try {
      setPublishing(true);
      const res = await fetch(`${API_URL}/courses/${id}/unpublish`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (res.ok) {
        alert("✅ Kurs nashrdan olindi!");
        setCourse(prev => ({ ...prev, status: "draft" }));
      } else {
        alert(`❌ Nashrdan olishda xatolik: ${data.message || "Server xatosi"}`);
      }
    } catch (error) {
      console.error("Nashrdan olish xatosi:", error);
      alert("❌ Server bilan aloqa xatosi!");
    } finally {
      setPublishing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-gray-600">
          ⏳ Kurs ma'lumotlari yuklanmoqda...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate("/teacher/courses")}
            className="flex items-center mb-4 text-blue-600 hover:text-blue-700"
          >
            ← Orqaga
          </button>
          
          {/* ✅ Status va Publish tugmalari */}
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                ✏️ {course.title}
              </h1>
              <p className="text-gray-600">
                Kursni boshqarish va tarkibini qo'shish
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Status badge */}
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                course.status === "published" 
                  ? "bg-green-100 text-green-800" 
                  : "bg-yellow-100 text-yellow-800"
              }`}>
                {course.status === "published" ? "📢 Nashr qilingan" : "📝 Qoralama"}
              </span>
              
              {/* Publish/Unpublish tugmalari */}
              {course.status === "published" ? (
                <button
                  onClick={handleUnpublishCourse}
                  disabled={publishing}
                  className={`px-4 py-2 rounded-lg font-medium ${
                    publishing
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-orange-500 hover:bg-orange-600 text-white"
                  }`}
                >
                  {publishing ? "⏳" : "🚫"} Nashrdan Olish
                </button>
              ) : (
                <button
                  onClick={handlePublishCourse}
                  disabled={publishing}
                  className={`px-4 py-2 rounded-lg font-medium ${
                    publishing
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-green-600 hover:bg-green-700 text-white"
                  }`}
                >
                  {publishing ? "⏳" : "📢"} Nashr Qilish
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6 bg-white border rounded-lg">
          <div className="flex overflow-x-auto border-b">
            {[
              { id: "basic", label: "Asosiy ma'lumotlar", icon: "📝" },
              { id: "modules", label: "Modullar", icon: "📚" },
              { id: "lessons", label: "Darslar", icon: "📖" },
              { id: "preview", label: "Ko'rib chiqish", icon: "👁️" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 min-w-0 py-4 px-4 text-center font-medium border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? "border-blue-500 text-blue-600 bg-blue-50"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>

          <div className="p-6">
            {/* 1. Asosiy ma'lumotlar */}
            {activeTab === "basic" && (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div>
                    <label className="block mb-2 font-medium text-gray-700">
                      Kurs nomi *
                    </label>
                    <input
                      type="text"
                      value={course.title}
                      onChange={(e) =>
                        setCourse({ ...course, title: e.target.value })
                      }
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block mb-2 font-medium text-gray-700">
                      Kategoriya *
                    </label>
                    <input
                      type="text"
                      value={course.category}
                      onChange={(e) =>
                        setCourse({ ...course, category: e.target.value })
                      }
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block mb-2 font-medium text-gray-700">
                      Narx (USD)
                    </label>
                    <input
                      type="number"
                      value={course.price}
                      onChange={(e) =>
                        setCourse({ ...course, price: e.target.value })
                      }
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                      min="0"
                      step="0.01"
                    />
                  </div>

                  <div>
                    <label className="block mb-2 font-medium text-gray-700">
                      Daraja
                    </label>
                    <select
                      value={course.level}
                      onChange={(e) =>
                        setCourse({ ...course, level: e.target.value })
                      }
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                    >
                      <option value="beginner">Boshlang'ich</option>
                      <option value="intermediate">O'rta</option>
                      <option value="advanced">Ilg'or</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block mb-2 font-medium text-gray-700">
                    Tavsif *
                  </label>
                  <textarea
                    value={course.description}
                    onChange={(e) =>
                      setCourse({ ...course, description: e.target.value })
                    }
                    rows="6"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                    required
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={saving}
                    className={`px-6 py-3 font-semibold text-white rounded-lg transition ${
                      saving
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-green-600 hover:bg-green-700"
                    }`}
                  >
                    {saving
                      ? "💾 Saqlanmoqda..."
                      : "✅ Asosiy ma'lumotlarni saqlash"}
                  </button>

                  {course.status === "draft" && (
                    <button
                      type="button"
                      onClick={handlePublishCourse}
                      disabled={publishing}
                      className={`px-6 py-3 font-semibold text-white rounded-lg transition ${
                        publishing
                          ? "bg-gray-400 cursor-not-allowed"
                          : "bg-blue-600 hover:bg-blue-700"
                      }`}
                    >
                      {publishing ? "⏳" : "📢"} Nashr Qilish
                    </button>
                  )}
                </div>
              </form>
            )}

            {/* 2. Modullar */}
            {activeTab === "modules" && (
              <div className="space-y-6">
                {/* Yangi modul qo'shish formi */}
                <div className="p-4 rounded-lg bg-gray-50">
                  <h3 className="mb-3 font-semibold">
                    ➕ Yangi Modul Qo'shish
                  </h3>
                  <form onSubmit={handleAddModule} className="space-y-3">
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                      <input
                        type="text"
                        placeholder="Modul nomi *"
                        value={newModule.title}
                        onChange={(e) =>
                          setNewModule({ ...newModule, title: e.target.value })
                        }
                        className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                        required
                      />
                      <input
                        type="number"
                        placeholder="Tartib raqami"
                        value={newModule.order}
                        onChange={(e) =>
                          setNewModule({
                            ...newModule,
                            order: parseInt(e.target.value) || 0,
                          })
                        }
                        className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                        min="0"
                      />
                    </div>
                    <textarea
                      placeholder="Modul tavsifi"
                      value={newModule.description}
                      onChange={(e) =>
                        setNewModule({
                          ...newModule,
                          description: e.target.value,
                        })
                      }
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                      rows="2"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 text-white transition bg-blue-600 rounded-lg hover:bg-blue-700"
                    >
                      ➕ Modul Qo'shish
                    </button>
                  </form>
                </div>

                {/* Modullar ro'yxati */}
                <div>
                  <h3 className="mb-3 font-semibold">
                    📚 Modullar ({modules.length})
                  </h3>
                  {modules.length === 0 ? (
                    <p className="py-4 text-center text-gray-500">
                      Hozircha modullar mavjud emas
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {modules.map((module) => (
                        <div
                          key={module._id}
                          className="p-4 bg-white border border-gray-200 rounded-lg"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <input
                                type="text"
                                value={module.title}
                                onChange={(e) =>
                                  handleUpdateModule(
                                    module._id,
                                    "title",
                                    e.target.value
                                  )
                                }
                                onBlur={(e) =>
                                  handleUpdateModule(
                                    module._id,
                                    "title",
                                    e.target.value
                                  )
                                }
                                className="w-full p-1 mb-2 text-lg font-semibold border-b border-transparent rounded hover:border-gray-300 focus:border-blue-500 focus:outline-none"
                              />
                              <textarea
                                value={module.description || ""}
                                onChange={(e) =>
                                  handleUpdateModule(
                                    module._id,
                                    "description",
                                    e.target.value
                                  )
                                }
                                onBlur={(e) =>
                                  handleUpdateModule(
                                    module._id,
                                    "description",
                                    e.target.value
                                  )
                                }
                                className="w-full p-1 mb-2 text-sm text-gray-600 border border-transparent rounded hover:border-gray-300 focus:border-blue-500 focus:outline-none"
                                rows="2"
                                placeholder="Tavsif qo'shish..."
                              />
                              <div className="flex gap-4 text-xs text-gray-500">
                                <span>
                                  Tartib:
                                  <input
                                    type="number"
                                    value={module.order || 0}
                                    onChange={(e) =>
                                      handleUpdateModule(
                                        module._id,
                                        "order",
                                        parseInt(e.target.value) || 0
                                      )
                                    }
                                    onBlur={(e) =>
                                      handleUpdateModule(
                                        module._id,
                                        "order",
                                        parseInt(e.target.value) || 0
                                      )
                                    }
                                    className="w-12 p-1 ml-1 border border-transparent rounded hover:border-gray-300 focus:border-blue-500 focus:outline-none"
                                    min="0"
                                  />
                                </span>
                                <span>
                                  Darslar:{" "}
                                  {
                                    lessons.filter(
                                      (l) =>
                                        l.module === module._id ||
                                        l.moduleId === module._id
                                    ).length
                                  }{" "}
                                  ta
                                </span>
                              </div>
                            </div>
                            <button
                              onClick={() => handleDeleteModule(module._id)}
                              className="p-2 ml-4 text-sm text-red-600 hover:text-red-800"
                              title="Modulni o'chirish"
                            >
                              🗑️
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 3. Darslar */}
            {activeTab === "lessons" && (
              <div className="space-y-6">
                {/* Yangi dars qo'shish formi */}
                <div className="p-4 rounded-lg bg-gray-50">
                  <h3 className="mb-3 font-semibold">➕ Yangi Dars Qo'shish</h3>
                  <form onSubmit={handleAddLesson} className="space-y-3">
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                      <select
                        value={newLesson.moduleId}
                        onChange={(e) =>
                          setNewLesson({
                            ...newLesson,
                            moduleId: e.target.value,
                          })
                        }
                        className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                        required
                      >
                        <option value="">Modulni tanlang *</option>
                        {modules.map((module) => (
                          <option key={module._id} value={module._id}>
                            {module.title}
                          </option>
                        ))}
                      </select>

                      <select
                        value={newLesson.type}
                        onChange={(e) =>
                          setNewLesson({ ...newLesson, type: e.target.value })
                        }
                        className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                        required
                      >
                        <option value="text">Matnli dars</option>
                        <option value="video">Video</option>
                        <option value="material">Material</option>
                        <option value="quiz">Test/Quiz</option>
                        <option value="assignment">Topshiriq</option>
                        <option value="live">Live session</option>
                      </select>
                    </div>

                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                      <input
                        type="text"
                        placeholder="Dars nomi *"
                        value={newLesson.title}
                        onChange={(e) =>
                          setNewLesson({ ...newLesson, title: e.target.value })
                        }
                        className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                        required
                      />
                      <input
                        type="number"
                        placeholder="Davomiylik (daqiqa)"
                        value={newLesson.duration}
                        onChange={(e) =>
                          setNewLesson({
                            ...newLesson,
                            duration: parseInt(e.target.value) || 0,
                          })
                        }
                        className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                        min="0"
                      />
                    </div>

                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                      <input
                        type="number"
                        placeholder="Tartib raqami"
                        value={newLesson.order}
                        onChange={(e) =>
                          setNewLesson({
                            ...newLesson,
                            order: parseInt(e.target.value) || 0,
                          })
                        }
                        className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                        min="0"
                      />
                    </div>

                    <textarea
                      placeholder="Dars mazmuni"
                      value={newLesson.content}
                      onChange={(e) =>
                        setNewLesson({ ...newLesson, content: e.target.value })
                      }
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                      rows="3"
                    />

                    <button
                      type="submit"
                      className="px-4 py-2 text-white transition bg-green-600 rounded-lg hover:bg-green-700"
                    >
                      ➕ Dars Qo'shish
                    </button>
                  </form>
                </div>

                {/* Darslar ro'yxati */}
                <div>
                  <h3 className="mb-3 font-semibold">
                    📖 Darslar ({lessons.length})
                  </h3>
                  {lessons.length === 0 ? (
                    <p className="py-4 text-center text-gray-500">
                      Hozircha darslar mavjud emas
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {lessons.map((lesson) => {
                        const module = modules.find(
                          (m) =>
                            m._id === (lesson.moduleId || lesson.module?._id)
                        );
                        return (
                          <div
                            key={lesson._id}
                            className="p-4 bg-white border border-gray-200 rounded-lg"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <input
                                  type="text"
                                  value={lesson.title}
                                  onChange={(e) =>
                                    handleUpdateLesson(
                                      lesson._id,
                                      "title",
                                      e.target.value
                                    )
                                  }
                                  onBlur={(e) =>
                                    handleUpdateLesson(
                                      lesson._id,
                                      "title",
                                      e.target.value
                                    )
                                  }
                                  className="w-full p-1 mb-2 text-lg font-semibold border-b border-transparent rounded hover:border-gray-300 focus:border-blue-500 focus:outline-none"
                                />
                                <textarea
                                  value={lesson.content || ""}
                                  onChange={(e) =>
                                    handleUpdateLesson(
                                      lesson._id,
                                      "content",
                                      e.target.value
                                    )
                                  }
                                  onBlur={(e) =>
                                    handleUpdateLesson(
                                      lesson._id,
                                      "content",
                                      e.target.value
                                    )
                                  }
                                  className="w-full p-1 mb-2 text-sm text-gray-600 border border-transparent rounded hover:border-gray-300 focus:border-blue-500 focus:outline-none"
                                  rows="2"
                                  placeholder="Mazmun qo'shish..."
                                />
                                <div className="flex flex-wrap gap-4 mt-1 text-xs text-gray-500">
                                  <span>
                                    Modul:
                                    <select
                                      value={
                                        lesson.moduleId || lesson.module?._id
                                      }
                                      onChange={(e) =>
                                        handleUpdateLesson(
                                          lesson._id,
                                          "moduleId",
                                          e.target.value
                                        )
                                      }
                                      onBlur={(e) =>
                                        handleUpdateLesson(
                                          lesson._id,
                                          "moduleId",
                                          e.target.value
                                        )
                                      }
                                      className="p-1 ml-1 border border-transparent rounded hover:border-gray-300 focus:border-blue-500 focus:outline-none"
                                    >
                                      {modules.map((mod) => (
                                        <option key={mod._id} value={mod._id}>
                                          {mod.title}
                                        </option>
                                      ))}
                                    </select>
                                  </span>
                                  <span>
                                    Turi:
                                    <select
                                      value={lesson.type}
                                      onChange={(e) =>
                                        handleUpdateLesson(
                                          lesson._id,
                                          "type",
                                          e.target.value
                                        )
                                      }
                                      onBlur={(e) =>
                                        handleUpdateLesson(
                                          lesson._id,
                                          "type",
                                          e.target.value
                                        )
                                      }
                                      className="p-1 ml-1 border border-transparent rounded hover:border-gray-300 focus:border-blue-500 focus:outline-none"
                                    >
                                      <option value="video">Video</option>
                                      <option value="article">Maqola</option>
                                      <option value="quiz">Test</option>
                                    </select>
                                  </span>
                                  <span>
                                    Davomiylik:
                                    <input
                                      type="number"
                                      value={lesson.duration || 0}
                                      onChange={(e) =>
                                        handleUpdateLesson(
                                          lesson._id,
                                          "duration",
                                          parseInt(e.target.value) || 0
                                        )
                                      }
                                      onBlur={(e) =>
                                        handleUpdateLesson(
                                          lesson._id,
                                          "duration",
                                          parseInt(e.target.value) || 0
                                        )
                                      }
                                      className="w-16 p-1 ml-1 border border-transparent rounded hover:border-gray-300 focus:border-blue-500 focus:outline-none"
                                      min="0"
                                    />{" "}
                                    daq
                                  </span>
                                  <span>
                                    Tartib:
                                    <input
                                      type="number"
                                      value={lesson.order || 0}
                                      onChange={(e) =>
                                        handleUpdateLesson(
                                          lesson._id,
                                          "order",
                                          parseInt(e.target.value) || 0
                                        )
                                      }
                                      onBlur={(e) =>
                                        handleUpdateLesson(
                                          lesson._id,
                                          "order",
                                          parseInt(e.target.value) || 0
                                        )
                                      }
                                      className="w-12 p-1 ml-1 border border-transparent rounded hover:border-gray-300 focus:border-blue-500 focus:outline-none"
                                      min="0"
                                    />
                                  </span>
                                </div>
                              </div>
                              <button
                                onClick={() => handleDeleteLesson(lesson._id)}
                                className="p-2 ml-4 text-sm text-red-600 hover:text-red-800"
                                title="Darsni o'chirish"
                              >
                                🗑️
                              </button>
                            </div>
                            {module && (
                              <div className="mt-1 text-xs text-gray-400">
                                Modul: {module.title}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 4. Ko'rib chiqish */}
            {activeTab === "preview" && (
              <div className="space-y-6">
                {/* Status paneli */}
                <div className="p-6 bg-white border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="mb-2 text-xl font-semibold">Kurs Holati</h3>
                      <div className="flex items-center gap-3">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          course.status === "published" 
                            ? "bg-green-100 text-green-800" 
                            : "bg-yellow-100 text-yellow-800"
                        }`}>
                          {course.status === "published" ? "📢 Nashr qilingan" : "📝 Qoralama"}
                        </span>
                        <span className="text-gray-600">
                          {course.status === "published" 
                            ? "Kurs o'quvchilar uchun mavjud" 
                            : "Kurs hali nashr qilinmagan"}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex gap-3">
                      {course.status === "published" ? (
                        <button
                          onClick={handleUnpublishCourse}
                          disabled={publishing}
                          className={`px-4 py-2 rounded-lg font-medium ${
                            publishing
                              ? "bg-gray-400 cursor-not-allowed"
                              : "bg-orange-500 hover:bg-orange-600 text-white"
                          }`}
                        >
                          {publishing ? "⏳" : "🚫"} Nashrdan Olish
                        </button>
                      ) : (
                        <button
                          onClick={handlePublishCourse}
                          disabled={publishing}
                          className={`px-4 py-2 rounded-lg font-medium ${
                            publishing
                              ? "bg-gray-400 cursor-not-allowed"
                              : "bg-green-600 hover:bg-green-700 text-white"
                          }`}
                        >
                          {publishing ? "⏳" : "📢"} Nashr Qilish
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-white border border-gray-200 rounded-lg">
                  <h3 className="mb-4 text-xl font-semibold">
                    📊 Kurs Statistikasi
                  </h3>
                  <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                    <div className="p-4 text-center rounded-lg bg-blue-50">
                      <div className="text-2xl font-bold text-blue-600">
                        {modules.length}
                      </div>
                      <div className="text-sm text-gray-600">Modullar</div>
                    </div>
                    <div className="p-4 text-center rounded-lg bg-green-50">
                      <div className="text-2xl font-bold text-green-600">
                        {lessons.length}
                      </div>
                      <div className="text-sm text-gray-600">Darslar</div>
                    </div>
                    <div className="p-4 text-center rounded-lg bg-yellow-50">
                      <div className="text-2xl font-bold text-yellow-600">
                        {lessons.reduce(
                          (total, lesson) => total + (lesson.duration || 0),
                          0
                        )}
                      </div>
                      <div className="text-sm text-gray-600">Jami daqiqa</div>
                    </div>
                    <div className="p-4 text-center rounded-lg bg-purple-50">
                      <div className="text-2xl font-bold text-purple-600">
                        {course.price === 0 ? "Bepul" : `$${course.price}`}
                      </div>
                      <div className="text-sm text-gray-600">Narx</div>
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-white border border-gray-200 rounded-lg">
                  <h3 className="mb-4 text-xl font-semibold">
                    🏗️ Kurs Tuzilmasi
                  </h3>
                  {modules.length === 0 ? (
                    <p className="py-4 text-center text-gray-500">
                      Hozircha modullar mavjud emas
                    </p>
                  ) : (
                    modules.map((module) => {
                      const moduleLessons = lessons.filter(
                        (lesson) =>
                          lesson.module === module._id ||
                          lesson.moduleId === module._id
                      );
                      return (
                        <div key={module._id} className="mb-6 last:mb-0">
                          <h4 className="flex items-center mb-3 text-lg font-semibold">
                            <span className="px-3 py-1 mr-2 text-sm text-blue-800 bg-blue-100 rounded-full">
                              {module.order || 0}
                            </span>
                            {module.title}
                          </h4>
                          {module.description && (
                            <p className="mb-3 ml-8 text-sm text-gray-600">
                              {module.description}
                            </p>
                          )}
                          {moduleLessons.length === 0 ? (
                            <p className="ml-8 text-sm text-gray-500">
                              Hozircha darslar mavjud emas
                            </p>
                          ) : (
                            <div className="ml-8 space-y-2">
                              {moduleLessons.map((lesson) => (
                                <div
                                  key={lesson._id}
                                  className="flex items-center gap-3 p-2 text-sm rounded bg-gray-50"
                                >
                                  <span
                                    className={
                                      lesson.type === "video"
                                        ? "text-red-500 bg-red-100 p-1 rounded"
                                        : lesson.type === "article"
                                        ? "text-blue-500 bg-blue-100 p-1 rounded"
                                        : "text-green-500 bg-green-100 p-1 rounded"
                                    }
                                  >
                                    {lesson.type === "video"
                                      ? "🎬"
                                      : lesson.type === "article"
                                      ? "📄"
                                      : "❓"}
                                  </span>
                                  <span className="flex-1 font-medium">
                                    {lesson.title}
                                  </span>
                                  <span className="text-xs text-gray-500">
                                    {lesson.duration || 0} daq • #
                                    {lesson.order || 0}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>

                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => navigate("/teacher/courses")}
                    className="px-6 py-3 text-white transition bg-gray-500 rounded-lg hover:bg-gray-600"
                  >
                    ← Orqaga
                  </button>
                  <button
                    onClick={() => window.open(`/courses/${id}`, "_blank")}
                    className="px-6 py-3 text-white transition bg-blue-600 rounded-lg hover:bg-blue-700"
                  >
                    👁️ Kursni Ko'rish
                  </button>
                  
                  {course.status === "draft" && (
                    <button
                      onClick={handlePublishCourse}
                      disabled={publishing}
                      className={`px-6 py-3 font-semibold text-white rounded-lg transition ${
                        publishing
                          ? "bg-gray-400 cursor-not-allowed"
                          : "bg-green-600 hover:bg-green-700"
                      }`}
                    >
                      {publishing ? "⏳ Nashr qilinmoqda..." : "📢 Kursni Nashr Qilish"}
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}